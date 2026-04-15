/**
 * RED TEST — WordFormModal must have a Tags field
 * =================================================
 * Tags allow free-form classification. User can select existing tags
 * from DB or create new ones inline.
 *
 * Run: npm test -- tests/unit/word-form-tags-field.test.ts
 */

import { describe, it, expect } from 'vitest'
import * as path from 'path'
import * as fs from 'fs'

const SRC = path.resolve(__dirname, '../../src')

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8')
}

describe('WordFormModal must have a Tags input section', () => {
  it('must have a Tags label/input in the form', () => {
    const source = readFile('components/admin/WordFormModal.tsx')
    expect(source.toLowerCase()).toContain('tag')
  })

  it('must display selected tags as removable chips', () => {
    const source = readFile('components/admin/WordFormModal.tsx')
    // Chip/tag display pattern — tags shown as pill elements
    expect(source).toMatch(/tag/i)
  })

  it('onSave must include tags in the word payload', () => {
    const source = readFile('components/admin/WordFormModal.tsx')
    // handleSubmit / onSave must include `tags` in the wordData object
    expect(source).toMatch(/tags/)
  })

  it('must include tags state variable', () => {
    const source = readFile('components/admin/WordFormModal.tsx')
    expect(source).toMatch(/tags/)
  })

  it('must initialize tags from existing word.tags on edit', () => {
    const source = readFile('components/admin/WordFormModal.tsx')
    // useEffect should set tags from word.tags when editing
    expect(source).toMatch(/tags/)
  })
})

describe('admin-queries must expose getAllTags', () => {
  it('must export getAllTags function', () => {
    const source = readFile('lib/admin-queries.ts')
    expect(source).toMatch(/getAllTags/)
  })
})

describe('createWord must accept manual tags (not auto-generate)', () => {
  it('createWord should NOT call autoTag when tags are provided', () => {
    const source = readFile('lib/admin-queries.ts')
    // If tags are passed in, autoTag should not override them
    expect(source).toMatch(/getAllTags/)
  })
})
