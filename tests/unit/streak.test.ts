import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { saveStreak, recordStudy, loadStreak, getStreakDisplay } from '../../src/lib/streak'
import { getTodayBoundary } from '../../src/lib/utils'

const FIXED_STUDY_TIME = new Date('2026-04-27T10:00:00+07:00')

function studyBoundaryDateOffset(days: number): string {
  const boundary = new Date(getTodayBoundary())
  boundary.setDate(boundary.getDate() + days)
  return boundary.toISOString().split('T')[0]
}

describe('Streak System', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_STUDY_TIME)
    localStorage.removeItem('vocamaster-streak')
  })

  afterEach(() => {
    vi.useRealTimers()
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
    saveStreak({
      currentStreak: 3,
      lastStudyDate: studyBoundaryDateOffset(-1),
      longestStreak: 3,
    })

    const data = recordStudy()
    expect(data.currentStreak).toBe(4)
    expect(data.longestStreak).toBe(4)
  })

  it('recordStudy resets streak when missed > 1 day', () => {
    saveStreak({
      currentStreak: 10,
      lastStudyDate: studyBoundaryDateOffset(-3),
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
