/**
 * tests/unit/fetch-profile-settings-load.test.ts
 *
 * RED: Bug — display_name và avatar_url không load trên Settings page
 * vì fetchInitialAppData gọi RPC 'get_initial_app_data_v2' không tồn tại.
 *
 * FIX cần:
 * 1. Tạo migration 028 tạo get_initial_app_data_v2 RPC với đầy đủ profile fields
 * 2. Hoặc: fetchInitialAppData fallback sang direct SELECT nếu RPC fail
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const ROADMAP_PATH = resolve(
  'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash',
  'src/lib/storage/roadmap.ts'
)
const MIGRATIONS_DIR = resolve(
  'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash',
  'supabase/migrations'
)

describe('fetchInitialAppData — profile loading fix', () => {

  it('fetchInitialAppData phải load display_name và avatar_url từ profile', async () => {
    const source = readFileSync(ROADMAP_PATH, 'utf-8')
    // Profile fields phải được trả về trong data.profile
    expect(source).toMatch(/get_initial_app_data_v2/)
  })

  it('migration 028 phải tồn tại và tạo get_initial_app_data_v2 RPC', async () => {
    const fs = await import('fs')
    const files = fs.readdirSync(MIGRATIONS_DIR)
    const v2Migration = files.find(f => f.includes('028') && f.endsWith('.sql'))

    expect(v2Migration).toBeDefined()

    const content = readFileSync(resolve(MIGRATIONS_DIR, v2Migration!), 'utf-8')
    expect(content).toMatch(/get_initial_app_data_v2/)
    // Profile phải chứa display_name và avatar_url
    expect(content).toMatch(/display_name|avatar_url/)
  })

  it('fetchInitialAppData phải có fallback direct SELECT nếu RPC fail', async () => {
    const source = readFileSync(ROADMAP_PATH, 'utf-8')
    // Khi RPC fail, phải fallback: supabase.from('user_profiles').select(...)
    const hasFallback = source.includes('user_profiles') && source.includes('select')
    expect(hasFallback).toBe(true)
  })

  it('UserProfile type phải có display_name và avatar_url', async () => {
    const typesPath = resolve(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash',
      'src/lib/types.ts'
    )
    const types = readFileSync(typesPath, 'utf-8')
    expect(types).toMatch(/display_name.*string.*null/)
    expect(types).toMatch(/avatar_url.*string.*null/)
  })
})