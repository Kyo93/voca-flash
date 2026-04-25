import { describe, expect, it } from 'vitest'
import {
  buildAchievements,
  getAchievementCounts,
  getRecentAchievements,
} from '../../src/lib/achievements'
import {
  createEmptyRewardProgress,
  toRewardProgressView,
} from '../../src/lib/rewards'

function rewardProgressWithXp(totalXp: number) {
  return toRewardProgressView({
    ...createEmptyRewardProgress('user-1'),
    totalXp,
    studyXp: totalXp,
  })
}

function build(overrides: Partial<Parameters<typeof buildAchievements>[0]> = {}) {
  return buildAchievements({
    rewardProgress: rewardProgressWithXp(0),
    streak: 0,
    totalMastered: 0,
    totalTimeMs: 0,
    ...overrides,
  })
}

describe('achievement logic', () => {
  it('builds only achievements backed by real metrics', () => {
    const achievements = build()
    const ids = achievements.map(achievement => achievement.id)

    expect(ids).not.toContain('c1_peak')
    expect(ids).not.toContain('early_bird')
    expect(ids).toContain('first_spark')
    expect(ids).toContain('steady_learner')
    expect(ids).toContain('first_step')
    expect(ids).toContain('marathon_scholar')
  })

  it('unlocks EXP badges from reward progress', () => {
    const locked = build({ rewardProgress: rewardProgressWithXp(49) })
      .find(achievement => achievement.id === 'first_spark')
    const unlocked = build({ rewardProgress: rewardProgressWithXp(50) })
      .find(achievement => achievement.id === 'first_spark')

    expect(locked?.unlocked).toBe(false)
    expect(unlocked?.unlocked).toBe(true)
  })

  it('unlocks streak badges at their thresholds', () => {
    const daySix = build({ streak: 6 })
    const dayThirty = build({ streak: 30 })
    const dayHundred = build({ streak: 100 })

    expect(daySix.find(achievement => achievement.id === 'steady_learner')?.unlocked).toBe(false)
    expect(dayThirty.find(achievement => achievement.id === 'steady_learner')?.unlocked).toBe(true)
    expect(dayThirty.find(achievement => achievement.id === 'fire_starter')?.unlocked).toBe(true)
    expect(dayHundred.find(achievement => achievement.id === 'persistent_scholar')?.unlocked).toBe(true)
  })

  it('unlocks mastery and study-time badges from analytics metrics', () => {
    const achievements = build({
      totalMastered: 1000,
      totalTimeMs: 10 * 60 * 60 * 1000,
    })

    expect(achievements.find(achievement => achievement.id === 'first_step')?.unlocked).toBe(true)
    expect(achievements.find(achievement => achievement.id === 'lexical_legend')?.unlocked).toBe(true)
    expect(achievements.find(achievement => achievement.id === 'vocab_master')?.unlocked).toBe(false)
    expect(achievements.find(achievement => achievement.id === 'marathon_scholar')?.unlocked).toBe(true)
  })

  it('limits the compact recent list for the Progress page', () => {
    const achievements = build({
      rewardProgress: rewardProgressWithXp(500),
      streak: 7,
      totalMastered: 19,
    })
    const recent = getRecentAchievements(achievements, 2)

    expect(recent).toHaveLength(2)
    expect(recent.every(achievement => achievement.id !== 'c1_peak')).toBe(true)
  })

  it('counts unlocked achievements for summary copy', () => {
    const counts = getAchievementCounts(build({
      rewardProgress: rewardProgressWithXp(50),
      totalMastered: 1,
    }))

    expect(counts.total).toBeGreaterThan(counts.unlocked)
    expect(counts.unlocked).toBe(2)
  })
})
