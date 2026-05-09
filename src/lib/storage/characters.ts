import { DEFAULT_CHARACTER_ID, type CharacterUnlockState } from '../characters'
import { REWARD_PROGRESS_UPDATED_EVENT, toRewardProgressView, type RewardProgressView, type StoredRewardProgress } from '../rewards'
import { supabase } from '../supabase'
import { fetchRewardProgress } from './rewards'

interface CharacterUnlockRow {
  character_id: string
  current_stage?: number
  evolution_spent_xp?: number
}

interface RewardProgressRow {
  user_id: string
  total_xp: number
  study_xp: number
  review_xp: number
  spent_xp?: number
  arena_sessions: number
  selected_character_id?: string | null
  updated_at: string | null
}

export interface StoredCharacterCollection {
  rewardProgress: RewardProgressView
  unlockedCharacterIds: string[]
  unlockedCharacterStates: CharacterUnlockState[]
  selectedCharacterId: string | null
}

interface CharacterUnlockResponse {
  reward_progress?: RewardProgressRow
  unlocked_character_ids?: string[]
  unlocked_characters?: CharacterUnlockRow[]
}

interface CharacterSelectResponse {
  reward_progress?: RewardProgressRow
}

const FALLBACK_STORAGE_PREFIX = 'voca-flash-characters:'
interface FallbackCharacterCollection {
  unlockedCharacterIds: string[]
  unlockedCharacterStates: CharacterUnlockState[]
  selectedCharacterId: string | null
}

interface StoredFallbackCharacterCollection {
  unlockedCharacterIds?: unknown
  unlockedCharacterStates?: unknown
  selectedCharacterId?: unknown
}

const fallbackCollections = new Map<string, FallbackCharacterCollection>()

function rowToStored(row: RewardProgressRow): StoredRewardProgress {
  return {
    userId: row.user_id,
    totalXp: row.total_xp ?? 0,
    studyXp: row.study_xp ?? 0,
    reviewXp: row.review_xp ?? 0,
    spentXp: row.spent_xp ?? 0,
    arenaSessions: row.arena_sessions ?? 0,
    selectedCharacterId: row.selected_character_id ?? null,
    updatedAt: row.updated_at ?? null,
  }
}

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function getFallbackKey(userId: string): string {
  return `${FALLBACK_STORAGE_PREFIX}${userId}`
}

function getDefaultFallbackCollection(): FallbackCharacterCollection {
  return {
    unlockedCharacterIds: [DEFAULT_CHARACTER_ID],
    unlockedCharacterStates: [{ characterId: DEFAULT_CHARACTER_ID, currentStage: 1, evolutionSpentXp: 0 }],
    selectedCharacterId: DEFAULT_CHARACTER_ID,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
}

function readPositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.max(0, Math.floor(value))
}

function readFallbackCharacterStates(value: unknown): CharacterUnlockState[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.characterId !== 'string' || item.characterId.length === 0) {
      return []
    }

    return [{
      characterId: item.characterId,
      currentStage: Math.max(1, readPositiveInteger(item.currentStage, 1)),
      evolutionSpentXp: readPositiveInteger(item.evolutionSpentXp, 0),
    }]
  })
}

function normalizeFallbackCollection(value: unknown): FallbackCharacterCollection | null {
  if (!isRecord(value)) return null

  const stored = value as StoredFallbackCharacterCollection
  const hasKnownShape = 'unlockedCharacterIds' in stored
    || 'unlockedCharacterStates' in stored
    || 'selectedCharacterId' in stored
  if (!hasKnownShape) return null

  const storedIds = readStringArray(stored.unlockedCharacterIds)
  const storedStates = readFallbackCharacterStates(stored.unlockedCharacterStates)
  const migratedStates = storedStates.length > 0
    ? storedStates
    : storedIds.map((characterId) => ({
      characterId,
      currentStage: 1,
      evolutionSpentXp: 0,
    }))
  const unlockedCharacterStates = uniqueCharacterStates(migratedStates)
  const unlockedCharacterIds = uniqueCharacterIds([
    ...storedIds,
    ...unlockedCharacterStates.map(state => state.characterId),
  ])
  const rawSelectedCharacterId = stored.selectedCharacterId
  const selectedCharacterId = typeof rawSelectedCharacterId === 'string'
    && unlockedCharacterIds.includes(rawSelectedCharacterId)
    ? rawSelectedCharacterId
    : DEFAULT_CHARACTER_ID

  return {
    unlockedCharacterIds,
    unlockedCharacterStates,
    selectedCharacterId,
  }
}

function getFallbackCollection(userId: string): FallbackCharacterCollection {
  if (canUseLocalStorage()) {
    const raw = window.localStorage.getItem(getFallbackKey(userId))
    if (raw) {
      try {
        const parsed = normalizeFallbackCollection(JSON.parse(raw))
        if (parsed) return parsed
        window.localStorage.removeItem(getFallbackKey(userId))
      } catch {
        window.localStorage.removeItem(getFallbackKey(userId))
      }
    }
  }

  return fallbackCollections.get(userId) ?? getDefaultFallbackCollection()
}

function saveFallbackCollection(userId: string, collection: {
  unlockedCharacterIds: string[]
  unlockedCharacterStates: CharacterUnlockState[]
  selectedCharacterId: string | null
}) {
  const normalizedCollection = normalizeFallbackCollection(collection) ?? getDefaultFallbackCollection()
  fallbackCollections.set(userId, normalizedCollection)
  if (canUseLocalStorage()) {
    window.localStorage.setItem(getFallbackKey(userId), JSON.stringify(normalizedCollection))
  }
}

function notifyRewardProgressUpdated(progress: RewardProgressView): void {
  if (typeof window === 'undefined') return

  window.dispatchEvent(new CustomEvent(REWARD_PROGRESS_UPDATED_EVENT, {
    detail: {
      userId: progress.userId,
      totalXp: progress.totalXp,
    },
  }))
}

function warnCharacterStorageFallback(error: unknown): void {
  console.warn('[Characters] Falling back to local character collection:', error)
}

function uniqueCharacterIds(ids: string[]): string[] {
  return Array.from(new Set([DEFAULT_CHARACTER_ID, ...ids.filter(Boolean)]))
}

function uniqueCharacterStates(states: CharacterUnlockState[]): CharacterUnlockState[] {
  const byId = new Map<string, CharacterUnlockState>()
  byId.set(DEFAULT_CHARACTER_ID, {
    characterId: DEFAULT_CHARACTER_ID,
    currentStage: 1,
    evolutionSpentXp: 0,
  })

  for (const state of states) {
    byId.set(state.characterId, {
      characterId: state.characterId,
      currentStage: Math.max(1, Math.floor(state.currentStage || 1)),
      evolutionSpentXp: Math.max(0, Math.floor(state.evolutionSpentXp || 0)),
    })
  }

  return Array.from(byId.values())
}

function rowToCharacterState(row: CharacterUnlockRow): CharacterUnlockState {
  return {
    characterId: row.character_id,
    currentStage: row.current_stage ?? 1,
    evolutionSpentXp: row.evolution_spent_xp ?? 0,
  }
}

export async function fetchCharacterCollection(userId: string): Promise<StoredCharacterCollection> {
  const [rewardProgress, unlocksResult] = await Promise.all([
    fetchRewardProgress(userId),
    supabase
      .from('user_character_unlocks')
      .select('character_id,current_stage,evolution_spent_xp')
      .eq('user_id', userId),
  ])

  if (unlocksResult.error) {
    warnCharacterStorageFallback(unlocksResult.error)
    const fallback = getFallbackCollection(userId)
    return {
      rewardProgress,
      unlockedCharacterIds: uniqueCharacterIds(fallback.unlockedCharacterIds),
      unlockedCharacterStates: uniqueCharacterStates(fallback.unlockedCharacterStates ?? []),
      selectedCharacterId: rewardProgress.selectedCharacterId ?? fallback.selectedCharacterId,
    }
  }

  const unlockRows = (unlocksResult.data ?? []) as CharacterUnlockRow[]
  const unlockedCharacterIds = uniqueCharacterIds(unlockRows.map(row => row.character_id))
  const unlockedCharacterStates = uniqueCharacterStates(unlockRows.map(rowToCharacterState))

  return {
    rewardProgress,
    unlockedCharacterIds,
    unlockedCharacterStates,
    selectedCharacterId: rewardProgress.selectedCharacterId ?? DEFAULT_CHARACTER_ID,
  }
}

export async function unlockUserCharacter(
  userId: string,
  characterId: string,
  costXp: number
): Promise<StoredCharacterCollection> {
  const { data, error } = await supabase.rpc('unlock_user_character', {
    p_user_id: userId,
    p_character_id: characterId,
    p_cost_xp: costXp,
  })

  if (!error && data) {
    const response = data as CharacterUnlockResponse
    const rewardProgress = response.reward_progress
      ? toRewardProgressView(rowToStored(response.reward_progress))
      : await fetchRewardProgress(userId)
    const responseStates = response.unlocked_characters?.map(rowToCharacterState) ?? []

    if (responseStates.length === 0) {
      const collection = await fetchCharacterCollection(userId)
      saveFallbackCollection(userId, {
        unlockedCharacterIds: collection.unlockedCharacterIds,
        unlockedCharacterStates: collection.unlockedCharacterStates,
        selectedCharacterId: collection.selectedCharacterId,
      })
      notifyRewardProgressUpdated(rewardProgress)
      return collection
    }

    const unlockedCharacterIds = uniqueCharacterIds(
      response.unlocked_character_ids ?? responseStates.map(state => state.characterId).concat(characterId)
    )
    const unlockedCharacterStates = uniqueCharacterStates(responseStates.length > 0
      ? responseStates
      : [{ characterId, currentStage: 1, evolutionSpentXp: 0 }])
    const selectedCharacterId = rewardProgress.selectedCharacterId ?? characterId

    saveFallbackCollection(userId, { unlockedCharacterIds, unlockedCharacterStates, selectedCharacterId })
    notifyRewardProgressUpdated(rewardProgress)

    return {
      rewardProgress,
      unlockedCharacterIds,
      unlockedCharacterStates,
      selectedCharacterId,
    }
  }

  if (error) {
    warnCharacterStorageFallback(error)
  }

  return fetchCharacterCollection(userId)
}

export async function evolveUserCharacter(
  userId: string,
  characterId: string,
  targetStage: number,
  costXp: number
): Promise<StoredCharacterCollection> {
  const { data, error } = await supabase.rpc('evolve_user_character', {
    p_user_id: userId,
    p_character_id: characterId,
    p_target_stage: targetStage,
    p_cost_xp: costXp,
  })

  if (!error && data) {
    const response = data as CharacterUnlockResponse
    const rewardProgress = response.reward_progress
      ? toRewardProgressView(rowToStored(response.reward_progress))
      : await fetchRewardProgress(userId)
    const unlockedCharacterStates = uniqueCharacterStates((response.unlocked_characters ?? []).map(rowToCharacterState))
    const unlockedCharacterIds = uniqueCharacterIds(unlockedCharacterStates.map(state => state.characterId))
    const selectedCharacterId = rewardProgress.selectedCharacterId ?? DEFAULT_CHARACTER_ID

    saveFallbackCollection(userId, { unlockedCharacterIds, unlockedCharacterStates, selectedCharacterId })
    notifyRewardProgressUpdated(rewardProgress)

    return {
      rewardProgress,
      unlockedCharacterIds,
      unlockedCharacterStates,
      selectedCharacterId,
    }
  }

  if (error) {
    warnCharacterStorageFallback(error)
  }

  return fetchCharacterCollection(userId)
}

export async function selectUserCharacter(
  userId: string,
  characterId: string
): Promise<StoredCharacterCollection> {
  const { data, error } = await supabase.rpc('select_user_character', {
    p_user_id: userId,
    p_character_id: characterId,
  })

  if (error) {
    warnCharacterStorageFallback(error)
    return fetchCharacterCollection(userId)
  }

  const current = await fetchCharacterCollection(userId)

  if (data) {
    const response = data as CharacterSelectResponse
    const rewardProgress = response.reward_progress
      ? toRewardProgressView(rowToStored(response.reward_progress))
      : toRewardProgressView({
        ...current.rewardProgress,
        selectedCharacterId: characterId,
      })

    saveFallbackCollection(userId, {
      unlockedCharacterIds: current.unlockedCharacterIds,
      unlockedCharacterStates: current.unlockedCharacterStates,
      selectedCharacterId: characterId,
    })
    notifyRewardProgressUpdated(rewardProgress)

    return {
      rewardProgress,
      unlockedCharacterIds: current.unlockedCharacterIds,
      unlockedCharacterStates: current.unlockedCharacterStates,
      selectedCharacterId: characterId,
    }
  }

  return current
}
