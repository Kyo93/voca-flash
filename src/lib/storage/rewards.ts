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
  arena_sessions: number
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
    arenaSessions: row.arena_sessions ?? 0,
    updatedAt: row.updated_at ?? null,
  }
}

function getFallbackKey(userId: string): string {
  return `${FALLBACK_STORAGE_PREFIX}${userId}`
}

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function loadFallbackStoredRewardProgress(userId: string): StoredRewardProgress {
  if (canUseLocalStorage()) {
    const raw = window.localStorage.getItem(getFallbackKey(userId))
    if (raw) {
      try {
        return JSON.parse(raw) as StoredRewardProgress
      } catch {
        window.localStorage.removeItem(getFallbackKey(userId))
      }
    }
  }

  return memoryFallback.get(userId) ?? createEmptyRewardProgress(userId)
}

function saveFallbackStoredRewardProgress(progress: StoredRewardProgress): void {
  memoryFallback.set(progress.userId, progress)

  if (canUseLocalStorage()) {
    window.localStorage.setItem(getFallbackKey(progress.userId), JSON.stringify(progress))
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
