/**
 * tests/unit/upsert-srs-record-rpc-param.test.ts
 *
 * RED: Test verify rằng RPC upsert_srs_record dùng đúng parameter name.
 * p_lapse_count bị trùng semantic (truyền vào = 0, rồi increment_wrong lại cộng thêm).
 * Fix: đổi tên thành p_increment_lapse để phân biệt rõ ràng.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const SQL_PATH = resolve(
  'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash',
  'supabase/migrations/025_upsert_srs_record_rpc.sql'
)
const SESSION_TS_PATH = resolve(
  'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash',
  'src/lib/storage/session.ts'
)

describe('upsert_srs_record RPC — parameter naming', () => {

  it('RPC must NOT use p_lapse_count as input param (confusing: hardcoded 0 + increment overlap)', async () => {
    const sql = readFileSync(SQL_PATH, 'utf-8')
    // p_lapse_count là tên cũ — nên rename thành p_increment_lapse
    expect(sql).not.toMatch(/p_lapse_count/)
  })

  it('RPC must use p_increment_lapse instead of p_lapse_count', async () => {
    const sql = readFileSync(SQL_PATH, 'utf-8')
    expect(sql).toMatch(/p_increment_lapse/)
  })

  it('RPC must still increment lapse_count atomically in ON CONFLICT', async () => {
    const sql = readFileSync(SQL_PATH, 'utf-8')
    // lapse_count vẫn phải được increment trong upsert
    expect(sql).toMatch(/lapse_count.*COALESCE.*increment/)
  })

  it('session.ts must call RPC with p_increment_lapse (not p_lapse_count)', async () => {
    const ts = readFileSync(SESSION_TS_PATH, 'utf-8')
    // Không còn truyền p_lapse_count: 0
    expect(ts).not.toMatch(/p_lapse_count:\s*0/)
    // Phải có p_increment_lapse
    expect(ts).toMatch(/p_increment_lapse/)
  })
})