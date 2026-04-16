/**
 * RED TESTS — StudyPage Layout Centering
 * ======================================
 * Bug: Flashcard content is too close to header, not vertically centered.
 * - "Daily Mastery" label touches the Header sticky bar
 * - Flashcard is pushed up, not centered on screen
 *
 * Fix: StudyPage content should have proper top padding and vertical centering.
 * Run: npm test -- tests/unit/study-page-layout.test.ts
 */

import { describe, it, expect } from 'vitest'
import * as path from 'path'
import * as fs from 'fs'

const SRC = path.resolve(__dirname, '../../src')

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8')
}

describe('StudyPage — flashcard content must be vertically centered with top padding', () => {
  it('main content wrapper must have top padding to clear sticky Header', () => {
    const source = readFile('pages/StudyPage.tsx')
    // After fix: the main return container should have pt-{n} or mt-{n} or gap-{n}
    // to create space between content and the sticky Header (h-20)
    // Bug: current code has no top padding — content touches header
    const contentStart = source.indexOf('flex flex-col items-center justify-center pt-8 min-h-[80vh]')
    expect(contentStart).toBeGreaterThan(-1)
    const snippet = source.substring(contentStart, contentStart + 100)
    // After fix: should have pt-6 or pt-8 or mt-6 or similar to create gap from header
    // The current bug: only has "min-h-[60vh]" with no top spacing
    expect(snippet).toMatch(/pt-|mt-|gap-|space-y-/)
  })

  it('"Daily Mastery" label must not touch sticky Header (has top spacing)', () => {
    const source = readFile('pages/StudyPage.tsx')
    // The Session Progress section should have top padding or the parent has top padding
    // Currently: the container starts at top 0 with no padding
    // After fix: should have pt-8 or top margin/gap to separate from Header
    void source.match(/Daily Mastery[\s\S]{0,200}Session Progress/s)?.[0]
    // The parent of "Daily Mastery" must have top spacing (pt-6, mt-6, or the flex container has gap)
    // Check: the container div wrapping everything has pt-{n}
    // The current return wrapper for the flashcard content has: no top padding
    // We check the container right before "Daily Mastery"
    const idx = source.indexOf('Session Progress')
    const before = source.substring(Math.max(0, idx - 300), idx)
    // Should have pt-6, pt-8, mt-6, or gap-{n} in the parent container
    expect(before).toMatch(/pt-|mt-|gap-|space-y-/)
  })
})