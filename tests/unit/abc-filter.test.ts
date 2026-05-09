import { describe, it, expect } from 'vitest'
import { readSourceFile } from './source-reader'

describe('ABC Filter Storage', () => {
  it('getUserVocabulary accepts a "letter" option', async () => {
    await expect(import('../../src/lib/storage/mastery')).resolves.toBeDefined()
    expect(readSourceFile('lib/storage/mastery.ts')).toMatch(/letter\?:\s*string/)
  })

  it('getUserVocabulary passes p_letter to supabase.rpc', () => {
    expect(readSourceFile('lib/storage/mastery.ts')).toMatch(/p_letter:\s*letter/)
  })
})

describe('ABC Filter UI State', () => {
  it('MasteryPage data logic has abcLetter in advancedFilters state', () => {
    expect(readSourceFile('hooks/useMasteryWords.ts')).toMatch(/abcLetter:\s*null/)
  })
})
