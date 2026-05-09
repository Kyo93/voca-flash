import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('i18n Registry Integrity', () => {
  const vi = JSON.parse(readFileSync(resolve(__dirname, '../../src/i18n/vi.json'), 'utf-8'))
  const en = JSON.parse(readFileSync(resolve(__dirname, '../../src/i18n/en.json'), 'utf-8'))

  it('must have top-level common namespace with dateLocale', () => {
    expect(vi.common).toBeDefined()
    expect(vi.common.dateLocale).toBeDefined()
    expect(en.common).toBeDefined()
    expect(en.common.dateLocale).toBeDefined()
  })

  it('admin roadmaps should be at top-level admin.roadmaps, not library.admin.roadmaps', () => {
    expect(vi.admin.roadmaps).toBeDefined()
    expect(en.admin.roadmaps).toBeDefined()

    expect(vi.library.admin).toBeUndefined()
    expect(en.library.admin).toBeUndefined()
  })

  it('must have common.edit and common.delete', () => {
    expect(vi.common.edit).toBeDefined()
    expect(vi.common.delete).toBeDefined()
    expect(en.common.edit).toBeDefined()
    expect(en.common.delete).toBeDefined()
  })
})
