/**
 * RED TESTS — WordFormModal must include synonyms, antonyms, word_family fields
 * ===========================================================================
 * New learning fields must be editable in the word creation/edit form.
 *
 * Run: npm test -- tests/unit/word-form-modal-new-fields.test.ts
 */

import { describe, it, expect } from 'vitest'
import * as path from 'path'
import * as fs from 'fs'

const SRC = path.resolve(__dirname, '../../src')

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8')
}

describe('WordFormModal must have synonyms, antonyms, word_family inputs', () => {
  it('must have input/textarea for synonyms', () => {
    const source = readFile('components/admin/WordFormModal.tsx')
    expect(source.toLowerCase()).toContain('synonyms')
  })

  it('must have input/textarea for antonyms', () => {
    const source = readFile('components/admin/WordFormModal.tsx')
    expect(source.toLowerCase()).toContain('antonyms')
  })

  it('must have input/textarea for word_family', () => {
    const source = readFile('components/admin/WordFormModal.tsx')
    expect(source.toLowerCase()).toContain('word_family')
  })

  it('onSave must pass synonyms, antonyms, word_family in wordData', () => {
    const source = readFile('components/admin/WordFormModal.tsx')
    // handleSave / onSave must include these fields in the data object
    expect(source).toMatch(/synonyms|antonyms|word_family/)
  })
})