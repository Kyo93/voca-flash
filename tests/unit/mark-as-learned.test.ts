/**
 * RED TESTS — "Mark as Learned" Button in StudyPage
 * ==================================================
 * Bug: "Mark as Learned" button calls rate(3) directly without flipping first.
 * Expected: markLearned should flip card first, then rate(3).
 *
 * Run: npm test -- tests/unit/mark-as-learned.test.ts
 */

import { describe, it, expect } from 'vitest'
import * as path from 'path'
import * as fs from 'fs'

const SRC = path.resolve(__dirname, '../../src')

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8')
}

describe('markLearned — must flip card THEN rate', () => {
  it('markLearned body must call flip() before rating', () => {
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
    // After fix: markLearned must call flip() in its body
    expect(body).toContain('flip()')
    // And still rate with Good (3)
    expect(body).toContain('rate(3)')
  })
})

describe('StudyPage "Mark as Learned" — must call markLearned, not rate directly', () => {
  it('button onClick must use markLearned from useFlashcard, not rate(3)', () => {
    const source = readFile('pages/StudyPage.tsx')
    // Search for the translation key or the original text
    const malIdx = source.indexOf('study.markLearned') !== -1 
      ? source.indexOf('study.markLearned')
      : source.indexOf('Mark as Learned')
    expect(malIdx).toBeGreaterThan(-1)
    // Look at the 400 chars BEFORE "Mark as Learned" to find onClick
    const snippet = source.substring(Math.max(0, malIdx - 400), malIdx + 200)
    // Bug: was onClick={() => rate(3)}
    expect(snippet).not.toMatch(/rate\(3\)/)
    // Fix: onClick should reference markLearned
    expect(snippet).toMatch(/markLearned/)
  })
})
