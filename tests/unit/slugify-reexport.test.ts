/**
 * tests/unit/slugify-reexport.test.ts
 *
 * RED phase: import-parser.ts không nên định nghĩa slugify() local.
 * Nên import từ utils.ts — single source of truth.
 */

import { describe, it, expect } from 'vitest'

describe('slugify re-export — RED', () => {
  it('import-parser.ts must re-export slugify from ./utils', async () => {
    const mod = await import('../../src/lib/import-parser')
    expect(typeof mod.slugify).toBe('function')
  })

  it('slugify from import-parser must match slugify from utils (identity)', async () => {
    const utils = await import('../../src/lib/utils')
    const parser = await import('../../src/lib/import-parser')
    expect(parser.slugify).toBe(utils.slugify)
  })

  it('slugify from import-parser produces correct slug', async () => {
    const mod = await import('../../src/lib/import-parser')
    expect(mod.slugify('Hello World')).toBe('hello-world')
    expect(mod.slugify('Cộng hòa Xã hội Chủ nghĩa Việt Nam')).toBe('cong-hoa-xa-hoi-chu-nghia-viet-nam')
    expect(mod.slugify('  multiple   spaces  ')).toBe('-multiple-spaces-')
  })

  it('import-parser must NOT have its own slugify definition (no duplicate)', async () => {
    // Read source directly to verify no local definition
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/lib/import-parser.ts',
      'utf-8'
    )
    // Should NOT have "export function slugify" defined locally
    expect(source).not.toMatch(/export\s+function\s+slugify\s*\(/)
  })
})
