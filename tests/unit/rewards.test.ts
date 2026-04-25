import { describe, expect, it } from 'vitest'
import {
  REWARD_BADGES,
  REWARD_XP,
  applyRewardGainToStoredProgress,
  calculateReviewReward,
  calculateStudyReward,
  createEmptyRewardProgress,
  getNewlyUnlockedRewardBadges,
  getRewardLevel,
  toRewardProgressView,
} from '../../src/lib/rewards'
import { SRS_RATINGS } from '../../src/lib/constants'

describe('reward domain logic', () => {
  it('awards Arena XP for correct, wrong, and ghost recall answers', () => {
    expect(calculateReviewReward({
      isCorrect: true,
      quadrant: 'recognition',
    }).xp).toBe(REWARD_XP.REVIEW_CORRECT)

    expect(calculateReviewReward({
      isCorrect: false,
      quadrant: 'recognition',
    }).xp).toBe(REWARD_XP.REVIEW_WRONG)

    expect(calculateReviewReward({
      isCorrect: true,
      quadrant: 'ghost_recall',
    }).xp).toBe(REWARD_XP.REVIEW_CORRECT + REWARD_XP.REVIEW_GHOST_RECALL_BONUS)
  })

  it('awards higher Study XP for first learned words', () => {
    expect(calculateStudyReward({
      isNewWord: true,
      rating: SRS_RATINGS.GOOD,
    }).xp).toBe(REWARD_XP.NEW_WORD)

    expect(calculateStudyReward({
      isNewWord: true,
      rating: SRS_RATINGS.AGAIN,
    }).xp).toBe(REWARD_XP.NEW_WORD_AGAIN)

    expect(calculateStudyReward({
      isNewWord: false,
      rating: SRS_RATINGS.HARD,
    }).xp).toBe(REWARD_XP.REVIEW_HARD)
  })

  it('computes reward level progress and unlocked badges from total XP', () => {
    const progress = toRewardProgressView({
      ...createEmptyRewardProgress('user-1'),
      totalXp: 260,
      studyXp: 150,
      reviewXp: 110,
    })

    expect(progress.currentLevel).toEqual(getRewardLevel(260))
    expect(progress.currentLevel.level).toBe(3)
    expect(progress.levelProgress).toBeGreaterThan(0)
    expect(progress.unlockedBadges.map(badge => badge.id)).toContain(REWARD_BADGES[1].id)
  })

  it('detects newly unlocked badges only across crossed thresholds', () => {
    expect(getNewlyUnlockedRewardBadges(40, 260).map(badge => badge.id)).toEqual([
      'first_spark',
      'arena_regular',
    ])

    expect(getNewlyUnlockedRewardBadges(260, 300)).toHaveLength(0)
  })

  it('applies reward gain to the correct source bucket', () => {
    const stored = createEmptyRewardProgress('user-1')
    const updated = applyRewardGainToStoredProgress(stored, {
      source: 'arena',
      reason: 'review',
      xp: 10,
    })

    expect(updated.totalXp).toBe(10)
    expect(updated.reviewXp).toBe(10)
    expect(updated.studyXp).toBe(0)
  })

  it('keeps lifetime XP separate from spendable character XP', () => {
    const progress = toRewardProgressView({
      ...createEmptyRewardProgress('user-1'),
      totalXp: 500,
      studyXp: 300,
      reviewXp: 200,
      spentXp: 150,
    })

    expect(progress.totalXp).toBe(500)
    expect(progress.spentXp).toBe(150)
    expect(progress.availableXp).toBe(350)
    expect(progress.currentLevel).toEqual(getRewardLevel(500))
  })

  it('never lets spent XP create a negative available balance', () => {
    const progress = toRewardProgressView({
      ...createEmptyRewardProgress('user-1'),
      totalXp: 40,
      spentXp: 100,
    })

    expect(progress.availableXp).toBe(0)
  })
})
