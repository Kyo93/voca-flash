import { describe, it, expect, beforeEach } from 'vitest'
import { saveStreak, recordStudy, loadStreak, getStreakDisplay } from '../../src/lib/streak'

describe('Streak System', () => {
  beforeEach(() => {
    localStorage.removeItem('vocamaster-streak')
  })

  it('loadStreak returns default when empty', () => {
    const data = loadStreak()
    expect(data.currentStreak).toBe(0)
    expect(data.lastStudyDate).toBe('')
  })

  it('recordStudy starts streak at 1 for new user', () => {
    const data = recordStudy()
    expect(data.currentStreak).toBeGreaterThanOrEqual(1)
    expect(data.lastStudyDate).toBeDefined()
  })

  it('recordStudy increments streak on consecutive days', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    saveStreak({
      currentStreak: 3,
      lastStudyDate: yesterdayStr,
      longestStreak: 3,
    })

    const data = recordStudy()
    expect(data.currentStreak).toBe(4)
    expect(data.longestStreak).toBe(4)
  })

  it('recordStudy resets streak when missed > 1 day', () => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0]

    saveStreak({
      currentStreak: 10,
      lastStudyDate: threeDaysAgoStr,
      longestStreak: 10,
    })

    const data = recordStudy()
    expect(data.currentStreak).toBe(1)
    expect(data.longestStreak).toBe(10)
  })

  it('getStreakDisplay returns current data', () => {
    const data = getStreakDisplay()
    expect(data).toHaveProperty('currentStreak')
    expect(data).toHaveProperty('lastStudyDate')
    expect(data).toHaveProperty('longestStreak')
  })
})
