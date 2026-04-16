/**
 * tests/unit/fetch-dashboard-stats.test.ts
 *
 * RED phase: fetchDashboardStats không nên hardcode weak=0, orphaned=0.
 * Nên gọi getMasteryStats để lấy giá trị thực từ DB.
 */

import { describe, it, expect } from 'vitest'

describe('fetchDashboardStats — RED', () => {
  it('fetchDashboardStats must NOT hardcode weak: 0 and orphaned: 0', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/storage/auth.ts',
      'utf-8'
    )
    // After fix: should NOT have weak: 0, orphaned: 0
    expect(source).not.toMatch(/weak:\s*0/)
    expect(source).not.toMatch(/orphaned:\s*0/)
  })

  it('fetchDashboardStats should delegate to getMasteryStats for real values', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/storage/auth.ts',
      'utf-8'
    )
    // After fix: should import getMasteryStats from mastery module
    expect(source).toMatch(/import.*getMasteryStats.*from/)
  })

  it('MasteryStats type must have weak and orphaned fields', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/types.ts',
      'utf-8'
    )
    expect(source).toMatch(/weak\??:\s*number/)
    expect(source).toMatch(/orphaned\??:\s*number/)
  })
})