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
    // Use todayBoundaryStr to match what recordStudy() uses internally.
    // This ensures lastStudyDate is always "1 day behind" relative to 4 AM boundary.
    const today = new Date()
    today.setHours(4, 0, 0, 0)
    if (today.getHours() > 12) today.setDate(today.getDate() - 1)
    const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split('T')[0]

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
    // 4 AM boundary minus 3 days
    const today = new Date()
    today.setHours(4, 0, 0, 0)
    if (today.getHours() > 12) today.setDate(today.getDate() - 1)
    const threeDaysAgoStr = new Date(today.getTime() - 3 * 86400000).toISOString().split('T')[0]

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
