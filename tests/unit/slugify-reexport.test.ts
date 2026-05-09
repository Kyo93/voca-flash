import { describe, it, expect } from 'vitest'
import { readSourceFile } from './source-reader'

describe('slugify re-export', () => {
  it('import-parser.ts re-exports slugify from ./utils', async () => {
    const mod = await import('../../src/lib/import-parser')
    expect(typeof mod.slugify).toBe('function')
  })

  it('slugify from import-parser matches slugify from utils by identity', async () => {
    const utils = await import('../../src/lib/utils')
    const parser = await import('../../src/lib/import-parser')
    expect(parser.slugify).toBe(utils.slugify)
  })

  it('slugify from import-parser produces correct slugs', async () => {
    const mod = await import('../../src/lib/import-parser')
    expect(mod.slugify('Hello World')).toBe('hello-world')
    expect(mod.slugify('C\u1ed9ng h\u00f2a X\u00e3 h\u1ed9i Ch\u1ee7 ngh\u0129a Vi\u1ec7t Nam')).toBe('cong-hoa-xa-hoi-chu-nghia-viet-nam')
    expect(mod.slugify('  multiple   spaces  ')).toBe('-multiple-spaces-')
  })

  it('import-parser does not define its own slugify implementation', () => {
    expect(readSourceFile('lib/import-parser.ts')).not.toMatch(/export\s+function\s+slugify\s*\(/)
  })
})
