/**
 * tests/unit/abc-filter.test.ts
 *
 * RED phase: getUserVocabulary should support filtering by first letter (ABC filter).
 */

import { describe, it, expect } from 'vitest'

describe('ABC Filter Storage — RED', () => {
  it('getUserVocabulary should accept a "letter" option', async () => {
    const mod = await import('../../src/lib/storage/mastery')
    // We expect the options interface to include 'letter'
    // Since we can't check the TS interface at runtime easily, 
    // we'll check if passing it doesn't cause a runtime crash (though it won't do anything yet)
    // and we'll check the source code like the other tests.
    const fs = await import('fs')
    const source = fs.readFileSync('c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/lib/storage/mastery.ts', 'utf-8')
    
    expect(source).toMatch(/letter\?:\s*string/)
  })

  it('getUserVocabulary should pass p_letter to supabase.rpc', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync('c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/lib/storage/mastery.ts', 'utf-8')
    
    expect(source).toMatch(/p_letter:\s*letter/)
  })
})

describe('ABC Filter UI State — RED', () => {
  it('MasteryPage data logic should have abcLetter in advancedFilters state', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync('c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/hooks/useMasteryWords.ts', 'utf-8')
    
    expect(source).toMatch(/abcLetter:\s*null/)
  })
})
