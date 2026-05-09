import { supabase } from '../supabase'
import {
  applyRewardGainToStoredProgress,
  createEmptyRewardProgress,
  REWARD_PROGRESS_UPDATED_EVENT,
  toRewardProgressView,
  type RewardGain,
  type RewardProgressView,
  type StoredRewardProgress,
} from '../rewards'

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

const FALLBACK_STORAGE_PREFIX = 'voca-flash-rewards:'
const memoryFallback = new Map<string, StoredRewardProgress>()

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

function getFallbackKey(userId: string): string {
  return `${FALLBACK_STORAGE_PREFIX}${userId}`
}

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readNonNegativeInteger(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return Math.max(0, Math.floor(value))
}

function readNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function normalizeFallbackStoredRewardProgress(
  value: unknown,
  userId: string
): StoredRewardProgress | null {
  if (!isRecord(value)) return null

  const hasKnownShape = 'userId' in value
    || 'totalXp' in value
    || 'studyXp' in value
    || 'reviewXp' in value
    || 'spentXp' in value
    || 'arenaSessions' in value
    || 'selectedCharacterId' in value
    || 'updatedAt' in value
  if (!hasKnownShape) return null

  return {
    userId,
    totalXp: readNonNegativeInteger(value.totalXp),
    studyXp: readNonNegativeInteger(value.studyXp),
    reviewXp: readNonNegativeInteger(value.reviewXp),
    spentXp: readNonNegativeInteger(value.spentXp),
    arenaSessions: readNonNegativeInteger(value.arenaSessions),
    selectedCharacterId: readNullableString(value.selectedCharacterId),
    updatedAt: readNullableString(value.updatedAt),
  }
}

function loadFallbackStoredRewardProgress(userId: string): StoredRewardProgress {
  if (canUseLocalStorage()) {
    const raw = window.localStorage.getItem(getFallbackKey(userId))
    if (raw) {
      try {
        const parsed = normalizeFallbackStoredRewardProgress(JSON.parse(raw), userId)
        if (parsed) return parsed
        window.localStorage.removeItem(getFallbackKey(userId))
      } catch {
        window.localStorage.removeItem(getFallbackKey(userId))
      }
    }
  }

  return memoryFallback.get(userId) ?? createEmptyRewardProgress(userId)
}

function saveFallbackStoredRewardProgress(progress: StoredRewardProgress): void {
  const normalizedProgress = normalizeFallbackStoredRewardProgress(progress, progress.userId)
    ?? createEmptyRewardProgress(progress.userId)
  memoryFallback.set(progress.userId, normalizedProgress)

  if (canUseLocalStorage()) {
    window.localStorage.setItem(getFallbackKey(progress.userId), JSON.stringify(normalizedProgress))
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

function warnRewardStorageFallback(error: unknown): void {
  console.warn('[Rewards] Falling back to local reward progress:', error)
}

export async function fetchRewardProgress(userId: string): Promise<RewardProgressView> {
  const { data, error } = await supabase
    .from('user_reward_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    warnRewardStorageFallback(error)
    return toRewardProgressView(loadFallbackStoredRewardProgress(userId))
  }

  return toRewardProgressView(data ? rowToStored(data as RewardProgressRow) : createEmptyRewardProgress(userId))
}

export async function applyUserRewardGain(userId: string, gain: RewardGain): Promise<RewardProgressView> {
  const studyXpDelta = gain.source === 'study' ? gain.xp : 0
  const reviewXpDelta = gain.source === 'arena' ? gain.xp : 0

  const { data, error } = await supabase.rpc('increment_user_reward_progress', {
    p_user_id: userId,
    p_xp_delta: gain.xp,
    p_study_xp_delta: studyXpDelta,
    p_review_xp_delta: reviewXpDelta,
    p_arena_session_delta: 0,
  })

  if (!error && data) {
    const stored = rowToStored(data as RewardProgressRow)
    saveFallbackStoredRewardProgress(stored)
    const progress = toRewardProgressView(stored)
    notifyRewardProgressUpdated(progress)
    return progress
  }

  if (error) {
    warnRewardStorageFallback(error)
  }

  const fallback = applyRewardGainToStoredProgress(loadFallbackStoredRewardProgress(userId), gain)
  saveFallbackStoredRewardProgress(fallback)
  const progress = toRewardProgressView(fallback)
  notifyRewardProgressUpdated(progress)
  return progress
}
