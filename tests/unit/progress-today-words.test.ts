// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { getWordsToday, getUserLevel, getRetentionDisplay, getRetentionLabel } from '../../src/lib/progress-utils'

describe('getWordsToday', () => {
  it('returns the review count for today from review_activity', () => {
    const today = new Date().toISOString().split('T')[0]
    const reviewActivity = [
      { date: '2025-01-01', reviews: 5, duration_ms: 1000 },
      { date: today, reviews: 18, duration_ms: 3000 },
    ]

    expect(getWordsToday(reviewActivity)).toBe(18)
  })

  it('returns 0 when no activity exists for today', () => {
    const reviewActivity = [
      { date: '2025-01-01', reviews: 5, duration_ms: 1000 },
    ]

    expect(getWordsToday(reviewActivity)).toBe(0)
  })

  it('returns 0 when review_activity is empty or null', () => {
    expect(getWordsToday([])).toBe(0)
    expect(getWordsToday(null as any)).toBe(0)
    expect(getWordsToday(undefined as any)).toBe(0)
  })
})

describe('getUserLevel', () => {
  // getUserLevel(totalWords, retentionRate)
  // totalWords = ALL words user has encountered (new + learning + review + relearning)

  it('returns Beginner for fewer than 50 total words', () => {
    expect(getUserLevel(8, 0)).toBe('A1 Beginner')
    expect(getUserLevel(30, 0.5)).toBe('A1 Beginner')
  })

  it('returns Elementary for 50-199 total words', () => {
    expect(getUserLevel(100, 0.6)).toBe('A2 Elementary')
  })

  it('returns Intermediate for 200-499 total words', () => {
    expect(getUserLevel(300, 0.7)).toBe('B1 Intermediate')
  })

  it('returns Upper Intermediate for 500-999 total words', () => {
    expect(getUserLevel(700, 0.75)).toBe('B2 Upper Intermediate')
  })

  it('returns Advanced for 1000-1999 words with good retention', () => {
    expect(getUserLevel(1200, 0.8)).toBe('C1 Advanced')
  })

  it('returns Proficient for 2000+ words with high retention', () => {
    expect(getUserLevel(2500, 0.85)).toBe('C2 Proficient')
  })

  it('caps at B2 when retention is genuinely low (below 0.6 with sufficient reviews)', () => {
    expect(getUserLevel(3000, 0.4)).toBe('B2 Upper Intermediate')
  })

  // BUG FIX: retention=0 means NO review data, not bad retention
  // A user with 8 words and 0 retention should NOT be penalized
  it('does NOT cap level when retention is 0 (no review data yet)', () => {
    expect(getUserLevel(100, 0)).toBe('A2 Elementary')
    expect(getUserLevel(500, 0)).toBe('B2 Upper Intermediate')
    expect(getUserLevel(1200, 0)).toBe('C1 Advanced')
  })

  it('does NOT cap level for very small retention values close to 0', () => {
    expect(getUserLevel(1200, 0.05)).toBe('C1 Advanced')
  })
})

describe('getRetentionDisplay', () => {
  // Dashboard RPC hardcodes 0.9 — Progress RPC returns 0 when no reviews exist.
  // Both pages should show the same meaningful value for the same user.

  it('returns actual percentage when user has real review data', () => {
    // retention_rate=0.85 with review_activity containing entries = real data
    const result = getRetentionDisplay(0.85, [
      { date: '2025-01-01', reviews: 10, duration_ms: 5000 },
    ])
    expect(result).toEqual({ percent: 85, hasData: true })
  })

  it('returns hasData=false when retention is 0 and no review activity exists', () => {
    const result = getRetentionDisplay(0, [])
    expect(result).toEqual({ percent: 0, hasData: false })
  })

  it('returns hasData=false when retention is 0 and review_activity is null', () => {
    const result = getRetentionDisplay(0, null as any)
    expect(result).toEqual({ percent: 0, hasData: false })
  })

  it('returns real data even if retention is low but reviews exist', () => {
    const result = getRetentionDisplay(0.3, [
      { date: '2025-01-01', reviews: 5, duration_ms: 2000 },
    ])
    expect(result).toEqual({ percent: 30, hasData: true })
  })

  it('rounds percentage correctly', () => {
    const result = getRetentionDisplay(0.867, [
      { date: '2025-01-01', reviews: 10, duration_ms: 5000 },
    ])
    expect(result).toEqual({ percent: 87, hasData: true })
  })
})

describe('getRetentionLabel', () => {
  // MemoryHealthCard on Dashboard hardcodes "Xuất sắc" (excellent).
  // This function returns a quality key based on the actual retention rate.

  it('returns "excellent" for retention >= 80%', () => {
    expect(getRetentionLabel(0.9)).toBe('excellent')
    expect(getRetentionLabel(0.8)).toBe('excellent')
  })

  it('returns "good" for retention 60-79%', () => {
    expect(getRetentionLabel(0.75)).toBe('good')
    expect(getRetentionLabel(0.6)).toBe('good')
  })

  it('returns "needs_work" for retention below 60%', () => {
    expect(getRetentionLabel(0.5)).toBe('needs_work')
    expect(getRetentionLabel(0.3)).toBe('needs_work')
  })

  it('returns "no_data" for retention 0 (no reviews)', () => {
    expect(getRetentionLabel(0)).toBe('no_data')
  })
})
