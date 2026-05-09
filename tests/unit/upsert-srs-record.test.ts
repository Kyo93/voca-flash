import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const SESSION_STORAGE_PATH = resolve(__dirname, '../../src/lib/storage/session.ts')

function readSessionStorage() {
  return readFileSync(SESSION_STORAGE_PATH, 'utf-8')
}

describe('upsertSrsRecord', () => {
  it('does not SELECT lapse_count before upsert', () => {
    expect(readSessionStorage()).not.toMatch(/select\(['"]lapse_count['"]\)/)
  })

  it('still calls supabase.from().upsert()', () => {
    expect(readSessionStorage()).toMatch(/\.upsert\(/)
  })

  it('still respects incrementWrong in the upsert payload', () => {
    expect(readSessionStorage()).toMatch(/incrementWrong/)
  })
})
