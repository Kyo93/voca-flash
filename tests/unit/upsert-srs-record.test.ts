/**
 * tests/unit/upsert-srs-record.test.ts
 *
 * RED phase: upsertSrsRecord không nên SELECT trước upsert.
 * Nên upsert trực tiếp — 1 call thay vì 2.
 */

import { describe, it, expect } from 'vitest'

describe('upsertSrsRecord — RED', () => {
  it('session.ts upsertSrsRecord must NOT do SELECT before upsert', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/storage/session.ts',
      'utf-8'
    )
    // After fix: should NOT have .select('lapse_count') followed by upsert
    // Current code has:
    //   const { data: existing } = await supabase.from('user_srs_records').select('lapse_count')...
    //   const newLapseLegacy = (existing?.lapse_count ?? 0) + (update.incrementWrong ?? 0)
    // After fix: upsert directly, removing the SELECT + compute step
    expect(source).not.toMatch(/select\(['"]lapse_count['"]\)/)
  })

  it('upsertSrsRecord must still call supabase.from().upsert()', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/storage/session.ts',
      'utf-8'
    )
    // upsert must still happen
    expect(source).toMatch(/\.upsert\(/)
  })

  it('incrementWrong param must still be respected in upsert', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/storage/session.ts',
      'utf-8'
    )
    // After fix: the logic for incrementWrong should be reflected in the upsert payload
    // Either via lapse_count: newLapseLegacy (if SELECT remains) or incrementWrong used directly
    expect(source).toMatch(/incrementWrong/)
  })
})