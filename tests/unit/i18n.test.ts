import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

describe('i18n Sync', () => {
  it('vi.json has required keys', () => {
    const vi = JSON.parse(readFileSync('src/i18n/vi.json', 'utf-8'))
    expect(vi.app).toBeDefined()
    expect(vi.home).toBeDefined()
    expect(vi.flashcard).toBeDefined()
    expect(vi.topics).toBeDefined()
    expect(vi.nav).toBeDefined()
  })

  it('en.json has same keys as vi.json', () => {
    const vi = JSON.parse(readFileSync('src/i18n/vi.json', 'utf-8'))
    const en = JSON.parse(readFileSync('src/i18n/en.json', 'utf-8'))

    const viKeys = Object.keys(vi)
    const enKeys = Object.keys(en)

    viKeys.forEach(key => {
      expect(enKeys, `Missing key: ${key}`).toContain(key)
    })
  })

  it('vi.json has vi as primary language metadata', () => {
    const vi = JSON.parse(readFileSync('src/i18n/vi.json', 'utf-8'))
    expect(vi.app.name).toBe('VocaFlash')
  })
})
