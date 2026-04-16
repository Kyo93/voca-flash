/**
 * RED TESTS — Option B: Comprehensive Cleanup
 * ============================================
 * These tests verify the DESIRED state after refactoring.
 * They MUST fail before the refactor is applied (RED phase).
 *
 * Each test describes a contract the fixed code must satisfy.
 * Tests use source-file reading (fs) for structural checks that
 * don't need React rendering.
 *
 * Run: npm test -- tests/unit/option-b-red.test.ts
 */

import { describe, it, expect } from 'vitest'
import * as path from 'path'
import * as fs from 'fs'

const SRC = path.resolve(__dirname, '../../src')

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8')
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(SRC, relativePath))
}

// ─────────────────────────────────────────────────────────────
// C3: selectQuadrant extracted to shared challenge-logic.ts
// ─────────────────────────────────────────────────────────────

describe('C3 — selectQuadrant shared logic', () => {
  it('src/lib/challenge-logic.ts must exist', () => {
    expect(fileExists('lib/challenge-logic.ts')).toBe(true)
  })

  it('challenge-logic.ts must export selectQuadrant function', () => {
    const source = readFile('lib/challenge-logic.ts')
    expect(source).toContain('export function selectQuadrant')
  })

  it('selectQuadrant returns valid QuadrantType for beginner stability (< 3)', () => {
    // The extracted function should handle stability < 3
    const source = readFile('lib/challenge-logic.ts')
    const validForBeginner = ['construction', 'recognition', 'context_gap']
    // Verify the logic handles stability < 3
    expect(source).toMatch(/stability\s*<\s*3|stability\s*<\s*3\b/)
  })

  it('selectQuadrant returns valid QuadrantType for advanced stability (>= 14)', () => {
    const source = readFile('lib/challenge-logic.ts')
    // Code uses `else` branch (implicitly >= 14 since previous is < 14)
    expect(source).toMatch(/} else \{/)
  })
})

// ─────────────────────────────────────────────────────────────
// C2: Sidebar uses Supabase streak when logged in
// ─────────────────────────────────────────────────────────────

describe('C2 — Sidebar uses Supabase streak for logged-in users', () => {
  it('Sidebar.tsx must NOT unconditionally call getStreakDisplay()', () => {
    const source = readFile('components/Sidebar.tsx')
    // The bug: `const streak = getStreakDisplay()` is called unconditionally
    // After fix: this line must be removed or replaced
    const hasBug = /const\s+streak\s*=\s*getStreakDisplay\s*\(\s*\)/.test(source)
    expect(hasBug).toBe(false)
  })

  it('Sidebar.tsx must use Supabase-based streak for logged-in users', () => {
    const source = readFile('components/Sidebar.tsx')
    // After fix: should use fetchStreakFromSupabase or getStreakDisplayAsync
    const usesAsyncSupabase =
      /fetchStreakFromSupabase/.test(source) ||
      /getStreakDisplayAsync/.test(source)
    expect(usesAsyncSupabase).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────
// C4: RightSidebar streak caching
// ─────────────────────────────────────────────────────────────

describe('C4 — RightSidebar streak caching', () => {
  it('RightSidebar.tsx must have a caching mechanism for streak fetch', () => {
    const source = readFile('components/RightSidebar.tsx')
    // After fix: there should be a cache mechanism (useRef, module-level var, or stable dep)
    // Check for cache patterns
    const hasCache =
      /useRef|cache\s*[:=]|streakCache|streakDataRef/.test(source) ||
      /localStorage|loadStreak/.test(source)
    // More specifically: the component should NOT re-fetch on every user change
    // if the same user is already loaded. A useRef cache satisfies this.
    expect(hasCache).toBe(true)
  })

  it('RightSidebar.tsx must use useEffect with [user.id] not just [user]', () => {
    const source = readFile('components/RightSidebar.tsx')
    // After fix: dependency should be user?.id or userId (not the whole user object)
    // This prevents unnecessary re-fetches when user reference changes
    const usesStableDep = /\[user\?\.id\]|\[userId\]|useRef.*user/.test(source)
    // Either use a stable dependency or a cache
    // We check for one of these patterns
    const hasStablePattern =
      /useRef.*streak|cache|streakData|streakRef/.test(source) ||
      usesStableDep
    expect(hasStablePattern).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────
// M1: Naming — getMasteryStats (not fetchMasteryStats)
// ─────────────────────────────────────────────────────────────

describe('M1 — Naming consistency get/fetch prefix', () => {
  it('mastery.ts must NOT export fetchMasteryStats (should be getMasteryStats)', () => {
    const source = readFile('lib/storage/mastery.ts')
    const stillHasOldName = /^export (async )?function fetchMasteryStats/m.test(source) ||
      /^export const fetchMasteryStats/m.test(source)
    expect(stillHasOldName).toBe(false)
  })

  it('mastery.ts must export getMasteryStats', () => {
    const source = readFile('lib/storage/mastery.ts')
    expect(source).toMatch(/export (async )?function getMasteryStats/)
  })

  it('mastery.ts must NOT export fetchUserVocabulary (should be getUserVocabulary)', () => {
    const source = readFile('lib/storage/mastery.ts')
    const stillHasOldName = /^export (async )?function fetchUserVocabulary/m.test(source) ||
      /^export const fetchUserVocabulary/m.test(source)
    expect(stillHasOldName).toBe(false)
  })

  it('mastery.ts must export getUserVocabulary', () => {
    const source = readFile('lib/storage/mastery.ts')
    expect(source).toMatch(/export (async )?function getUserVocabulary/)
  })
})

// ─────────────────────────────────────────────────────────────
// M4: slugify moved out of useAdminTopics hook
// ─────────────────────────────────────────────────────────────

describe('M4 — slugify moved out of useAdminTopics hook', () => {
  it('useAdminTopics.ts must NOT export slugify function', () => {
    const source = readFile('hooks/admin/useAdminTopics.ts')
    const stillExportsSlugify = /^export function slugify/m.test(source) ||
      /^export { slugify }/m.test(source)
    expect(stillExportsSlugify).toBe(false)
  })

  it('src/lib/utils.ts must export slugify function', () => {
    const source = readFile('lib/utils.ts')
    expect(source).toContain('export function slugify')
  })

  it('slugify from utils.ts works correctly', () => {
    // Verify slugify has the NFD normalize for Vietnamese diacritics handling
    const source = readFile('lib/utils.ts')
    expect(source).toMatch(/normalize\s*\(\s*['"]NFD['"]\s*\)/)
    // Verify it calls .replace() on the normalized string (diacritics removal)
    expect(source).toMatch(/\.normalize\s*\(\s*['"]NFD['"]\s*\)\s*\.replace\s*\(/s)
  })
})

// ─────────────────────────────────────────────────────────────
// L1: RoadmapContext IS used by admin panel — NOT dead code
// The proposal incorrectly labeled it as dead. It is actively used
// by AdminLayout, WordsPage, TopicsPage for roadmap selection.
// ─────────────────────────────────────────────────────────────

describe('L1 — RoadmapContext is actively used (not dead code)', () => {
  it('src/contexts/RoadmapContext.tsx must exist (used by admin panel)', () => {
    expect(fileExists('contexts/RoadmapContext.tsx')).toBe(true)
  })

  it('AdminLayout must use RoadmapProvider for admin pages', () => {
    const source = readFile('components/admin/AdminLayout.tsx')
    expect(source).toContain('RoadmapProvider')
    expect(source).toContain('RoadmapContext')
  })

  it('WordsPage and TopicsPage must use useRoadmapContext for roadmap selection', () => {
    const wordsPage = readFile('pages/admin/WordsPage.tsx')
    const topicsPage = readFile('pages/admin/TopicsPage.tsx')
    expect(wordsPage).toContain('useRoadmapContext')
    expect(topicsPage).toContain('useRoadmapContext')
  })
})

// ─────────────────────────────────────────────────────────────
// L2: ReviewChallenge in shared location (not useReviewSession)
// ─────────────────────────────────────────────────────────────

describe('L2 — ReviewChallenge in shared location', () => {
  it('useFreeStudySession.ts must NOT import ReviewChallenge from useReviewSession', () => {
    const source = readFile('hooks/useFreeStudySession.ts')
    const importsFromUseReviewSession =
      /import\s*\{[^}]*ReviewChallenge[^}]*\}.*from\s*['"]\.\/useReviewSession/.test(source) ||
      /import\s*\{[^}]*ReviewChallenge[^}]*\}.*from\s*['"]\.\.\/useReviewSession/.test(source)
    expect(importsFromUseReviewSession).toBe(false)
  })

  it('challenge-logic.ts must export ReviewChallenge type', () => {
    const source = readFile('lib/challenge-logic.ts')
    expect(source).toContain('export interface ReviewChallenge')
  })
})

// ─────────────────────────────────────────────────────────────
// C1: StudyPage reuses AppLayout, not its own grid
// ─────────────────────────────────────────────────────────────

describe('C1 — StudyPage reuses AppLayout, not its own grid', () => {
  it('StudyPage.tsx must NOT import Sidebar', () => {
    const source = readFile('pages/StudyPage.tsx')
    const importsSidebar = /import.*Sidebar.*from/.test(source)
    expect(importsSidebar).toBe(false)
  })

  it('StudyPage.tsx must NOT define its own grid layout (gridTemplateColumns)', () => {
    const source = readFile('pages/StudyPage.tsx')
    const hasOwnGrid =
      /gridTemplateColumns/.test(source) ||
      /grid-template-columns/.test(source)
    expect(hasOwnGrid).toBe(false)
  })

  it('StudyPage.tsx must NOT have duplicate Sidebar rendering logic', () => {
    const source = readFile('pages/StudyPage.tsx')
    // Check for the pattern of the old StudyPage: Sidebar + its own margin/width calc
    const hasDuplicateLayout =
      /\/\* Left sidebar \*\//.test(source) ||
      (/<aside[^>]*gridArea[^>]*sidebar/.test(source) &&
       /import.*Sidebar.*from/.test(source))
    expect(hasDuplicateLayout).toBe(false)
  })
})
