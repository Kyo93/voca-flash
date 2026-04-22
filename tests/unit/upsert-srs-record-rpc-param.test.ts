/**
 * tests/unit/upsert-srs-record-rpc-param.test.ts
 *
 * Verifies upsertSrsRecord calls the correct Supabase RPC/endpoint.
 * After refactor to Advanced Analytics:
 *   - Uses upsert_srs_record_v2 for both insert and update.
 *   - Passes additional analytics parameters (p_rating, p_duration_ms).
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const SESSION_TS_PATH = resolve(
  'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash',
  'src/lib/storage/session.ts'
)

describe('upsertSrsRecord — V2 RPC strategy', () => {

  it('calls upsert_srs_record_v2 RPC for all updates', async () => {
    const ts = readFileSync(SESSION_TS_PATH, 'utf-8')
    expect(ts).toMatch(/supabase\.rpc\('upsert_srs_record_v2'/)
    expect(ts).not.toMatch(/insert_srs_record/)
  })

  it('RPC payload has correct parameter names for upsert_srs_record_v2', async () => {
    const ts = readFileSync(SESSION_TS_PATH, 'utf-8')
    expect(ts).toMatch(/p_user_id/)
    expect(ts).toMatch(/p_word_id/)
    expect(ts).toMatch(/p_stability/)
    expect(ts).toMatch(/p_difficulty/)
    expect(ts).toMatch(/p_state/)
    expect(ts).toMatch(/p_reps/)
    expect(ts).toMatch(/p_lapse_count/)
    expect(ts).toMatch(/p_rating/)
    expect(ts).toMatch(/p_review_duration_ms/)
  })

  it('skips upsert when stability or difficulty is NaN', async () => {
    const ts = readFileSync(SESSION_TS_PATH, 'utf-8')
    expect(ts).toMatch(/isNaN\(update\.stability\)/)
    expect(ts).toMatch(/isNaN\(update\.difficulty\)/)
  })
})