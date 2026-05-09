import { describe, it, expect } from 'vitest'
import { readSourceFile } from './source-reader'

describe('fetchDashboardStats', () => {
  it('does not hardcode weak: 0 and orphaned: 0', () => {
    const source = readSourceFile('lib/storage/auth.ts')
    expect(source).not.toMatch(/weak:\s*0/)
    expect(source).not.toMatch(/orphaned:\s*0/)
  })

  it('delegates to getMasteryStats for real values', () => {
    expect(readSourceFile('lib/storage/auth.ts')).toMatch(/import.*getMasteryStats.*from/)
  })

  it('MasteryStats type has weak and orphaned fields', () => {
    const source = readSourceFile('lib/types.ts')
    expect(source).toMatch(/weak\??:\s*number/)
    expect(source).toMatch(/orphaned\??:\s*number/)
  })
})
