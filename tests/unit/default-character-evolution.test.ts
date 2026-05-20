import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationPath = path.join(
  process.cwd(),
  'supabase/migrations/043_default_character_evolution.sql'
)

describe('default character evolution migration', () => {
  it('allows seedling scholar to create its unlock row before evolution', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8').replace(/\r\n/g, '\n')

    expect(sql).toContain('CREATE OR REPLACE FUNCTION evolve_user_character')
    expect(sql).toContain("p_character_id = 'seedling_scholar'")
    expect(sql).toContain('INSERT INTO user_character_unlocks')
    expect(sql).toContain('ON CONFLICT (user_id, character_id) DO NOTHING')
    expect(sql.indexOf('INSERT INTO user_character_unlocks')).toBeLessThan(
      sql.indexOf('SELECT *\n  INTO v_unlock')
    )
  })
})
