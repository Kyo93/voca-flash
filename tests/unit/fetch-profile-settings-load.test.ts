import { describe, it, expect } from 'vitest'
import { listProjectDir, readProjectFile, readSourceFile } from './source-reader'

const ROADMAP_PATH = 'lib/storage/roadmap.ts'
const MIGRATIONS_DIR = 'supabase/migrations'

describe('fetchInitialAppData profile loading', () => {
  it('loads display_name and avatar_url from profile data', () => {
    expect(readSourceFile(ROADMAP_PATH)).toMatch(/get_initial_app_data_v2/)
  })

  it('migration 028 creates get_initial_app_data_v2 RPC with profile fields', () => {
    const v2Migration = listProjectDir(MIGRATIONS_DIR)
      .find((file) => file.includes('028') && file.endsWith('.sql'))

    expect(v2Migration).toBeDefined()

    const content = readProjectFile(`${MIGRATIONS_DIR}/${v2Migration!}`)
    expect(content).toMatch(/get_initial_app_data_v2/)
    expect(content).toMatch(/display_name|avatar_url/)
  })

  it('fetchInitialAppData has a direct SELECT fallback if RPC fails', () => {
    const source = readSourceFile(ROADMAP_PATH)
    expect(source.includes('user_profiles') && source.includes('select')).toBe(true)
  })

  it('UserProfile type has display_name and avatar_url', () => {
    const types = readSourceFile('lib/types.ts')
    expect(types).toMatch(/display_name.*string.*null/)
    expect(types).toMatch(/avatar_url.*string.*null/)
  })
})
