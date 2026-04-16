/**
 * RED TEST — Add learning fields to Word model
 * ===============================================
 * Fields to add: synonyms, antonyms, word_family (all text[])
 * (created_at / updated_at already exist in types.ts)
 *
 * Run: npm test -- tests/unit/word-model-new-fields.test.ts
 */

import { describe, it, expect } from 'vitest'
import * as path from 'path'
import * as fs from 'fs'

const SRC = path.resolve(__dirname, '../../src')

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8')
}

describe('Word model must have synonyms, antonyms, word_family', () => {
  it('Word interface must have synonyms: string[]', () => {
    const source = readFile('lib/types.ts')
    // Must have synonyms as a string array field
    expect(source).toMatch(/synonyms\s*\??:\s*string\[\]/)
  })

  it('Word interface must have antonyms: string[]', () => {
    const source = readFile('lib/types.ts')
    expect(source).toMatch(/antonyms\s*\??:\s*string\[\]/)
  })

  it('Word interface must have word_family: string[]', () => {
    const source = readFile('lib/types.ts')
    expect(source).toMatch(/word_family\s*\??:\s*string\[\]/)
  })

  it('created_at and updated_at already exist (no change needed)', () => {
    const source = readFile('lib/types.ts')
    // These should already exist
    expect(source).toMatch(/created_at:\s*string/)
    expect(source).toMatch(/updated_at:\s*string/)
  })
})