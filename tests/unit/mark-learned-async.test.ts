/**
 * RED TESTS — "Mark as Learned" Flip Animation Bug
 * ===================================================
 * Bug: markLearned() calls flip() and rate(3) synchronously — both setState
 * fire in the same event tick, React re-renders once after BOTH complete.
 * User sees: card jumps directly to next word, NO flip animation.
 *
 * Fix: rate(3) must be deferred until after the flip animation completes
 * (~300ms). Use requestAnimationFrame or setTimeout.
 *
 * Run: npm test -- tests/unit/mark-learned-async.test.ts
 */

import { describe, it, expect } from 'vitest'
import * as path from 'path'
import * as fs from 'fs'

const SRC = path.resolve(__dirname, '../../src')

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8')
}

describe('markLearned — must defer rate() until flip animation finishes', () => {
  it('rate() call must be deferred (setTimeout/requestAnimationFrame), not synchronous', () => {
    const source = readFile('hooks/useFlashcard.ts')
    const idx = source.indexOf('const markLearned')
    expect(idx).toBeGreaterThan(-1)

    // Find the closing } of this function body
    let braceCount = 0
    let end = idx
    let started = false
    for (let i = idx; i < source.length; i++) {
      const ch = source[i]
      if (ch === '{') { braceCount++; started = true }
      if (ch === '}') {
        braceCount--
        if (started && braceCount === 0) { end = i; break }
      }
    }
    const body = source.substring(idx, end + 1)

    // flip() must still be called
    expect(body).toContain('flip()')
    // rate(3) must be deferred — look for setTimeout/requestAnimationFrame wrapping
    // NOT: flip(); rate(3)  (both synchronous = wrong)
    // YES: flip(); setTimeout(() => rate(3), ...) or: requestAnimationFrame(() => rate(3))
    expect(body).toMatch(/setTimeout|requestAnimationFrame/)
  })

  it('rate() must NOT appear as a bare synchronous call after flip()', () => {
    const source = readFile('hooks/useFlashcard.ts')
    const idx = source.indexOf('const markLearned')

    let braceCount = 0
    let end = idx
    let started = false
    for (let i = idx; i < source.length; i++) {
      const ch = source[i]
      if (ch === '{') { braceCount++; started = true }
      if (ch === '}') {
        braceCount--
        if (started && braceCount === 0) { end = i; break }
      }
    }
    const body = source.substring(idx, end + 1)

    // Remove all whitespace to detect "flip()rate(3)" pattern (both on same line/tick)
    const flat = body.replace(/\s+/g, '')
    // If flip() immediately precedes rate() with no setTimeout/requestAnimationFrame
    // between them in the flat string, it's synchronous = wrong
    const flipIdx = flat.indexOf('flip()')
    // Matches rate(3) or rate(SRS_RATINGS.GOOD)
    const rateMatch = flat.match(/rate\((3|SRS_RATINGS\.GOOD)\)/)
    const rateIdx = rateMatch ? rateMatch.index! : -1
    
    // They must both exist and rate must NOT be immediately after flip (gap > 20 chars)
    expect(flipIdx).toBeGreaterThan(-1)
    expect(rateIdx).toBeGreaterThan(-1)
    // Check: is rate() called synchronously right after flip()?
    const gap = rateIdx - (flipIdx + 'flip()'.length)
    expect(gap).toBeGreaterThan(20) // >20 chars means setTimeout/raf was inserted
  })
})
