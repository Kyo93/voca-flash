/**
 * RED TEST — "Mark as Learned" delay must be >= flip animation duration
 * =======================================================================
 * Bug: markLearned defers rate() by only 350ms, but flip animation is 700ms.
 * User sees <400ms of the flip, then immediately jumps to next card.
 *
 * Fix: delay must be >= 1000ms — user-specified comfortable reading time.
 * Run: npm test -- tests/unit/mark-learned-delay.test.ts
 */

import { describe, it, expect } from 'vitest'
import * as path from 'path'
import * as fs from 'fs'

const SRC = path.resolve(__dirname, '../../src')

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8')
}

describe('markLearned delay must be >= 1000ms (user comfort)', () => {
  it('setTimeout delay must be >= 1000ms for comfortable reading', () => {
    const source = readFile('hooks/useFlashcard.ts')
    const idx = source.indexOf('const markLearned')
    expect(idx).toBeGreaterThan(-1)

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

    // Extract the setTimeout delay value
    const match = body.match(/setTimeout\s*\(\s*\(\s*\)\s*=>\s*\w+\([^)]*\)\s*,\s*(\d+)\s*\)/)
    expect(match).not.toBeNull()

    const delay = parseInt(match![1], 10)
    // Flip animation is duration-700 (700ms) — give user 100ms extra buffer to absorb the answer
    expect(delay).toBeGreaterThanOrEqual(1000)
  })
})
