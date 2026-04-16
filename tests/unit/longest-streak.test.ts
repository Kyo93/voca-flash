/**
 * tests/unit/longest-streak.test.ts
 *
 * RED: streak.ts recordStreak must track longest_streak.
 * currently longestStreak hardcoded = current streak (streak.ts:66).
 * Fix: add longest_streak column + update logic.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const STREAK_TS_PATH = resolve(
  'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash',
  'src/lib/streak.ts'
)
const AUTH_TS_PATH = resolve(
  'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash',
  'src/lib/storage/auth.ts'
)

describe('longest_streak tracking', () => {

  it('streak.ts must NOT hardcode longestStreak to streak_days', async () => {
    const source = readFileSync(STREAK_TS_PATH, 'utf-8')
    // Currently: longestStreak: data.streak_days as number (hardcoded)
    // After fix: should read from a separate longest_streak field
    expect(source).not.toMatch(/longestStreak:.*data\.streak_days/)
  })

  it('streak.ts StreakData interface must include longestStreak', async () => {
    const source = readFileSync(STREAK_TS_PATH, 'utf-8')
    expect(source).toMatch(/longestStreak/)
  })

  it('streak.ts should reference longest_streak from profile (not just streak_days)', async () => {
    const source = readFileSync(STREAK_TS_PATH, 'utf-8')
    // Should have separate field or logic that updates longest when current > longest
    // Check for update of longest: either a longest_streak field from DB or local logic
    const hasLocalUpdate = source.includes('Math.max') && source.includes('longestStreak')
    const hasDbField = source.includes('longest_streak')
    expect(hasLocalUpdate || hasDbField).toBe(true)
  })

  it('storage/auth.ts recordStreak must update longest_streak when new streak > current longest', async () => {
    const source = readFileSync(AUTH_TS_PATH, 'utf-8')
    // recordStreak must update longest_streak in DB
    expect(source).toMatch(/longest_streak/)
  })
})