import { describe, it, expect } from 'vitest'
import { readSourceFile } from './source-reader'

describe('stripDiacritics', () => {
  it('utils.ts exports stripDiacritics', async () => {
    const mod = await import('../../src/lib/utils')
    expect(typeof mod.stripDiacritics).toBe('function')
  })

  it('removes Vietnamese diacritics', async () => {
    const mod = await import('../../src/lib/utils')
    expect(mod.stripDiacritics('C\u1ed9ng h\u00f2a X\u00e3 h\u1ed9i')).toBe('Cong hoa Xa hoi')
    expect(mod.stripDiacritics('\u1ebe \u1ee6 \u1eca')).toBe('E U I')
  })

  it('handles plain ASCII unchanged', async () => {
    const mod = await import('../../src/lib/utils')
    expect(mod.stripDiacritics('Hello World 123')).toBe('Hello World 123')
  })

  it('handles empty string', async () => {
    const mod = await import('../../src/lib/utils')
    expect(mod.stripDiacritics('')).toBe('')
  })

  it('tag-engine.ts normalize delegates to stripDiacritics', () => {
    expect(readSourceFile('lib/tag-engine.ts')).not.toMatch(/\.normalize\(['"]NFD['"]\)/)
  })

  it('tag-engine.ts imports stripDiacritics from utils', () => {
    expect(readSourceFile('lib/tag-engine.ts')).toMatch(/import.*stripDiacritics.*from.*['"]\.\/utils['"]/)
  })
})
