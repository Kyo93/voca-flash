/**
 * tests/unit/strip-diacritics.test.ts
 *
 * RED phase: tag-engine.ts nên dùng stripDiacritics() từ utils.ts
 * thay vì tự định nghĩa normalize() trùng logic với slugify.
 */

import { describe, it, expect } from 'vitest'

describe('stripDiacritics — RED', () => {
  it('utils.ts must export stripDiacritics', async () => {
    const mod = await import('../../src/lib/utils')
    expect(typeof mod.stripDiacritics).toBe('function')
  })

  it('stripDiacritics removes Vietnamese diacritics', async () => {
    const mod = await import('../../src/lib/utils')
    expect(mod.stripDiacritics('Cộng hòa Xã hội')).toBe('Cong hoa Xa hoi')
    expect(mod.stripDiacritics('Ế Ủ Ị')).toBe('E U I')
  })

  it('stripDiacritics handles plain ASCII unchanged', async () => {
    const mod = await import('../../src/lib/utils')
    expect(mod.stripDiacritics('Hello World 123')).toBe('Hello World 123')
  })

  it('stripDiacritics handles empty string', async () => {
    const mod = await import('../../src/lib/utils')
    expect(mod.stripDiacritics('')).toBe('')
  })

  it('tag-engine.ts normalize must delegate to stripDiacritics (no duplicate NFD logic)', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/tag-engine.ts',
      'utf-8'
    )
    // After fix: normalize calls stripDiacritics, not inline .normalize('NFD')
    // Should NOT have .normalize('NFD') inside tag-engine.ts
    expect(source).not.toMatch(/\.normalize\(['"]NFD['"]\)/)
  })

  it('tag-engine.ts must import stripDiacritics from utils', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/tag-engine.ts',
      'utf-8'
    )
    expect(source).toMatch(/import.*stripDiacritics.*from.*['"]\.\/utils['"]/)
  })
})