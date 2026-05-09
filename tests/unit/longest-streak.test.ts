import { describe, it, expect } from 'vitest'
import { readSourceFile } from './source-reader'

describe('longest_streak tracking', () => {
  it('streak.ts does not hardcode longestStreak to streak_days', () => {
    expect(readSourceFile('lib/streak.ts')).not.toMatch(/longestStreak:.*data\.streak_days/)
  })

  it('streak.ts StreakData interface includes longestStreak', () => {
    expect(readSourceFile('lib/streak.ts')).toMatch(/longestStreak/)
  })

  it('streak.ts references longest_streak from profile or updates longest locally', () => {
    const source = readSourceFile('lib/streak.ts')
    const hasLocalUpdate = source.includes('Math.max') && source.includes('longestStreak')
    const hasDbField = source.includes('longest_streak')
    expect(hasLocalUpdate || hasDbField).toBe(true)
  })

  it('storage/auth.ts recordStreak updates longest_streak', () => {
    expect(readSourceFile('lib/storage/auth.ts')).toMatch(/longest_streak/)
  })
})
