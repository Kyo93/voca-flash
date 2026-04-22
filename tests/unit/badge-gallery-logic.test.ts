import { describe, it, expect } from 'vitest'

// Unlock conditions copied from BadgeGallery.tsx
const checkBadgeUnlock = (id: string, streak: number, totalMastered: number, totalTimeMs: number) => {
  switch (id) {
    case 'first_step': return totalMastered > 0
    case 'steady_learner': return streak >= 7
    case 'fire_starter': return streak >= 30
    case 'lexical_legend': return totalMastered >= 1000
    case 'marathon_scholar': return totalTimeMs > 10 * 3600 * 1000 // 10 hours
    default: return false
  }
}

describe('BadgeGallery Unlock Logic', () => {
  it('should verify First Step badge', () => {
    expect(checkBadgeUnlock('first_step', 0, 0, 0)).toBe(false)
    expect(checkBadgeUnlock('first_step', 0, 1, 0)).toBe(true)
  })

  it('should verify Streak badges', () => {
    expect(checkBadgeUnlock('steady_learner', 6, 0, 0)).toBe(false)
    expect(checkBadgeUnlock('steady_learner', 7, 0, 0)).toBe(true)
    expect(checkBadgeUnlock('fire_starter', 29, 0, 0)).toBe(false)
    expect(checkBadgeUnlock('fire_starter', 30, 0, 0)).toBe(true)
  })

  it('should verify Lexical Legend badge', () => {
    expect(checkBadgeUnlock('lexical_legend', 0, 999, 0)).toBe(false)
    expect(checkBadgeUnlock('lexical_legend', 0, 1000, 0)).toBe(true)
  })

  it('should verify Marathon Scholar badge', () => {
    const nineHours = 9 * 3600 * 1000
    const elevenHours = 11 * 3600 * 1000
    expect(checkBadgeUnlock('marathon_scholar', 0, 0, nineHours)).toBe(false)
    expect(checkBadgeUnlock('marathon_scholar', 0, 0, elevenHours)).toBe(true)
  })
})
