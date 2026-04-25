import type { QuadrantType } from './challenge-logic'
import { SRS_RATINGS } from './constants'
import type { SrsRating } from './srs'

export type RewardSource = 'study' | 'arena'
export type RewardReason = 'new_word' | 'review' | 'effort' | 'ghost_recall'

export const REWARD_PROGRESS_UPDATED_EVENT = 'voca-flash:reward-progress-updated'

export interface RewardGain {
  source: RewardSource
  reason: RewardReason
  xp: number
}

export interface StoredRewardProgress {
  userId: string
  totalXp: number
  studyXp: number
  reviewXp: number
  arenaSessions: number
  updatedAt: string | null
}

export interface RewardLevel {
  level: number
  minXp: number
  titleKey: string
  characterKey: string
  icon: string
}

export interface RewardBadge {
  id: string
  minXp: number
  titleKey: string
  descriptionKey: string
  icon: string
}

export interface RewardProgressView extends StoredRewardProgress {
  currentLevel: RewardLevel
  nextLevel: RewardLevel | null
  xpIntoLevel: number
  xpForNextLevel: number
  levelProgress: number
  unlockedBadges: RewardBadge[]
  nextBadge: RewardBadge | null
}

export const REWARD_XP = {
  NEW_WORD: 15,
  NEW_WORD_AGAIN: 5,
  REVIEW_CORRECT: 10,
  REVIEW_WRONG: 2,
  REVIEW_GHOST_RECALL_BONUS: 5,
  REVIEW_HARD: 6,
  REVIEW_EASY: 12,
} as const

export const REWARD_LEVELS: RewardLevel[] = [
  {
    level: 1,
    minXp: 0,
    titleKey: 'rewards.levels.seedling',
    characterKey: 'rewards.characters.seedling',
    icon: 'school',
  },
  {
    level: 2,
    minXp: 100,
    titleKey: 'rewards.levels.apprentice',
    characterKey: 'rewards.characters.apprentice',
    icon: 'local_library',
  },
  {
    level: 3,
    minXp: 250,
    titleKey: 'rewards.levels.archivist',
    characterKey: 'rewards.characters.archivist',
    icon: 'auto_stories',
  },
  {
    level: 4,
    minXp: 500,
    titleKey: 'rewards.levels.strategist',
    characterKey: 'rewards.characters.strategist',
    icon: 'psychology',
  },
  {
    level: 5,
    minXp: 900,
    titleKey: 'rewards.levels.mentor',
    characterKey: 'rewards.characters.mentor',
    icon: 'workspace_premium',
  },
  {
    level: 6,
    minXp: 1400,
    titleKey: 'rewards.levels.sage',
    characterKey: 'rewards.characters.sage',
    icon: 'military_tech',
  },
  {
    level: 7,
    minXp: 2200,
    titleKey: 'rewards.levels.master',
    characterKey: 'rewards.characters.master',
    icon: 'emoji_events',
  },
]

export const REWARD_BADGES: RewardBadge[] = [
  {
    id: 'first_spark',
    minXp: 50,
    titleKey: 'rewards.badges.first_spark.title',
    descriptionKey: 'rewards.badges.first_spark.desc',
    icon: 'stars',
  },
  {
    id: 'arena_regular',
    minXp: 250,
    titleKey: 'rewards.badges.arena_regular.title',
    descriptionKey: 'rewards.badges.arena_regular.desc',
    icon: 'shield',
  },
  {
    id: 'memory_keeper',
    minXp: 500,
    titleKey: 'rewards.badges.memory_keeper.title',
    descriptionKey: 'rewards.badges.memory_keeper.desc',
    icon: 'psychology_alt',
  },
  {
    id: 'lexical_champion',
    minXp: 900,
    titleKey: 'rewards.badges.lexical_champion.title',
    descriptionKey: 'rewards.badges.lexical_champion.desc',
    icon: 'workspace_premium',
  },
  {
    id: 'scholar_legend',
    minXp: 1400,
    titleKey: 'rewards.badges.scholar_legend.title',
    descriptionKey: 'rewards.badges.scholar_legend.desc',
    icon: 'military_tech',
  },
]

export function createEmptyRewardProgress(userId: string): StoredRewardProgress {
  return {
    userId,
    totalXp: 0,
    studyXp: 0,
    reviewXp: 0,
    arenaSessions: 0,
    updatedAt: null,
  }
}

export function normalizeXp(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
}

export function getRewardLevel(totalXp: number): RewardLevel {
  const normalized = normalizeXp(totalXp)
  return [...REWARD_LEVELS]
    .reverse()
    .find(level => normalized >= level.minXp) ?? REWARD_LEVELS[0]
}

export function getNextRewardLevel(totalXp: number): RewardLevel | null {
  const normalized = normalizeXp(totalXp)
  return REWARD_LEVELS.find(level => level.minXp > normalized) ?? null
}

export function getUnlockedRewardBadges(totalXp: number): RewardBadge[] {
  const normalized = normalizeXp(totalXp)
  return REWARD_BADGES.filter(badge => normalized >= badge.minXp)
}

export function getNextRewardBadge(totalXp: number): RewardBadge | null {
  const normalized = normalizeXp(totalXp)
  return REWARD_BADGES.find(badge => badge.minXp > normalized) ?? null
}

export function getNewlyUnlockedRewardBadges(previousXp: number, nextXp: number): RewardBadge[] {
  const previous = normalizeXp(previousXp)
  const next = normalizeXp(nextXp)
  return REWARD_BADGES.filter(badge => previous < badge.minXp && next >= badge.minXp)
}

export function toRewardProgressView(progress: StoredRewardProgress): RewardProgressView {
  const totalXp = normalizeXp(progress.totalXp)
  const currentLevel = getRewardLevel(totalXp)
  const nextLevel = getNextRewardLevel(totalXp)
  const xpIntoLevel = totalXp - currentLevel.minXp
  const xpForNextLevel = nextLevel ? nextLevel.minXp - currentLevel.minXp : 0

  return {
    ...progress,
    totalXp,
    studyXp: normalizeXp(progress.studyXp),
    reviewXp: normalizeXp(progress.reviewXp),
    arenaSessions: normalizeXp(progress.arenaSessions),
    currentLevel,
    nextLevel,
    xpIntoLevel,
    xpForNextLevel,
    levelProgress: nextLevel && xpForNextLevel > 0
      ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100))
      : 100,
    unlockedBadges: getUnlockedRewardBadges(totalXp),
    nextBadge: getNextRewardBadge(totalXp),
  }
}

export function applyRewardGainToStoredProgress(
  progress: StoredRewardProgress,
  gain: RewardGain
): StoredRewardProgress {
  const xp = normalizeXp(gain.xp)
  const now = new Date().toISOString()

  return {
    ...progress,
    totalXp: normalizeXp(progress.totalXp) + xp,
    studyXp: normalizeXp(progress.studyXp) + (gain.source === 'study' ? xp : 0),
    reviewXp: normalizeXp(progress.reviewXp) + (gain.source === 'arena' ? xp : 0),
    arenaSessions: normalizeXp(progress.arenaSessions),
    updatedAt: now,
  }
}

export function calculateReviewReward({
  isCorrect,
  isSkipped,
  quadrant,
}: {
  isCorrect: boolean
  isSkipped?: boolean
  quadrant: QuadrantType
}): RewardGain {
  if (!isCorrect || isSkipped) {
    return {
      source: 'arena',
      reason: 'effort',
      xp: REWARD_XP.REVIEW_WRONG,
    }
  }

  const ghostBonus = quadrant === 'ghost_recall' ? REWARD_XP.REVIEW_GHOST_RECALL_BONUS : 0

  return {
    source: 'arena',
    reason: quadrant === 'ghost_recall' ? 'ghost_recall' : 'review',
    xp: REWARD_XP.REVIEW_CORRECT + ghostBonus,
  }
}

export function calculateStudyReward({
  isNewWord,
  rating,
}: {
  isNewWord: boolean
  rating: SrsRating
}): RewardGain {
  if (isNewWord) {
    return {
      source: 'study',
      reason: rating === SRS_RATINGS.AGAIN ? 'effort' : 'new_word',
      xp: rating === SRS_RATINGS.AGAIN ? REWARD_XP.NEW_WORD_AGAIN : REWARD_XP.NEW_WORD,
    }
  }

  if (rating === SRS_RATINGS.AGAIN) {
    return {
      source: 'study',
      reason: 'effort',
      xp: REWARD_XP.REVIEW_WRONG,
    }
  }

  if (rating === SRS_RATINGS.HARD) {
    return {
      source: 'study',
      reason: 'review',
      xp: REWARD_XP.REVIEW_HARD,
    }
  }

  if (rating === SRS_RATINGS.EASY) {
    return {
      source: 'study',
      reason: 'review',
      xp: REWARD_XP.REVIEW_EASY,
    }
  }

  return {
    source: 'study',
    reason: 'review',
    xp: REWARD_XP.REVIEW_CORRECT,
  }
}
