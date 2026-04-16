/**
 * tests/unit/upsert-srs-record-rpc-param.test.ts
 *
 * Verifies upsertSrsRecord calls the correct Supabase RPC/endpoint.
 * After refactor:
 *   - Existing record: direct REST PATCH (RLS USING check passes)
 *   - New record: RPC insert_srs_record (SECURITY DEFINER — bypasses RLS)
 *   - Old upsert_srs_record RPC is no longer called
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const SESSION_TS_PATH = resolve(
  'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash',
  'src/lib/storage/session.ts'
)
const INSERT_FUNC_SQL_PATH = resolve(
  'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash',
  'supabase/migrations/030_insert_srs_record_func.sql'
)

describe('upsertSrsRecord — RPC vs direct REST strategy', () => {

  it('calls insert_srs_record RPC for new records (not upsert_srs_record)', async () => {
    const ts = readFileSync(SESSION_TS_PATH, 'utf-8')
    // insert_srs_record is the SECURITY DEFINER RPC for INSERT
    expect(ts).toMatch(/supabase\.rpc\('insert_srs_record'/)
    // Old RPC is no longer called
    expect(ts).not.toMatch(/upsert_srs_record/)
  })

  it('for existing records: uses direct PATCH update (not RPC)', async () => {
    const ts = readFileSync(SESSION_TS_PATH, 'utf-8')
    // When record exists, we .update() directly — no RPC
    // Find the .update( call that comes after the existing record check
    const updateCall = ts.match(/existing\)\s*\{[\s\S]*?\.update\(/)?.[0] ?? ''
    expect(updateCall).toMatch(/\.update\(/)
    expect(updateCall).not.toMatch(/rpc\('/)
  })

  it('RPC payload has correct parameter names for insert_srs_record', async () => {
    const ts = readFileSync(SESSION_TS_PATH, 'utf-8')
    expect(ts).toMatch(/p_user_id/)
    expect(ts).toMatch(/p_word_id/)
    expect(ts).toMatch(/p_fsrs_stability/)
    expect(ts).toMatch(/p_fsrs_difficulty/)
    expect(ts).toMatch(/p_fsrs_state/)
    expect(ts).toMatch(/p_fsrs_reps/)
    expect(ts).toMatch(/p_fsrs_lapses/)
    // No old confusing p_lapse_count
    expect(ts).not.toMatch(/p_lapse_count/)
  })

  it('insert_srs_record SQL is SECURITY DEFINER (bypasses RLS)', async () => {
    const sql = readFileSync(INSERT_FUNC_SQL_PATH, 'utf-8')
    expect(sql).toMatch(/SECURITY DEFINER/)
  })

  it('insert_srs_record SQL uses ON CONFLICT DO NOTHING (no duplicate errors)', async () => {
    const sql = readFileSync(INSERT_FUNC_SQL_PATH, 'utf-8')
    expect(sql).toMatch(/ON CONFLICT.*DO NOTHING/s)
  })

  it('upsertSrsRecord checks record existence before choosing INSERT vs UPDATE', async () => {
    const ts = readFileSync(SESSION_TS_PATH, 'utf-8')
    // Must SELECT first to know if record exists
    expect(ts).toMatch(/select\('id, lapse_count'\)/)
    // Branch on existing record
    expect(ts).toMatch(/if \(existing\)/)
    // Branch on new record
    expect(ts).toMatch(/else\s*{[\s\S]*?rpc\('insert_srs_record'/)
  })

  it('skips upsert when stability or difficulty is NaN', async () => {
    const ts = readFileSync(SESSION_TS_PATH, 'utf-8')
    expect(ts).toMatch(/isNaN\(update\.stability\)/)
    expect(ts).toMatch(/isNaN\(update\.difficulty\)/)
  })
})