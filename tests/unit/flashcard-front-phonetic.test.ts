/**
 * RED TEST — Phonetic Display Fix in FlashcardFront
 * ===============================================
 * Bug: FlashcardFront.tsx uses card.front (the word) for phonetic display
 * instead of the actual card.phonetic field.
 *
 * Run: npm test -- tests/unit/flashcard-front-phonetic.test.ts
 */

import { describe, it, expect } from 'vitest'
import * as path from 'path'
import * as fs from 'fs'

const SRC = path.resolve(__dirname, '../../src')

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8')
}

describe('FlashcardFront phonetic display logic', () => {
  it('should use card.phonetic for the phonetic display area instead of card.front', () => {
    const source = readFile('components/study/FlashcardFront.tsx')
    
    // We expect the code to use startsWith('/') to avoid double slashes
    expect(source).toMatch(/\.startsWith\('\/'\)\s*\?\s*[^:]+:\s*`\/[^`]+`/)
    
    // It should NOT be hardcoded as /{card.front}/ or /{card.phonetic || card.front}/ anymore
    expect(source).not.toMatch(/>\/{card\.(phonetic\s*\|\|\s*card\.)?front}\/<\/p>/)
  })
})
