import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readSourceFile } from './source-reader'

const store: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { Object.keys(store).forEach((key) => delete store[key]) },
})

describe('streak today boundary', () => {
  beforeEach(() => { Object.keys(store).forEach((key) => delete store[key]) })

  it('streak.ts imports and uses getTodayBoundary instead of a local todayStr', () => {
    const source = readSourceFile('lib/streak.ts')
    expect(source).toMatch(/import.*getTodayBoundary.*from/s)
    expect(source).not.toMatch(/function todayStr\(\)/)
  })

  it('streak module does not define todayStr with UTC date', () => {
    expect(readSourceFile('lib/streak.ts')).not.toMatch(/todayStr.*=.*toISOString/)
  })

  it('loadStreak/saveStreak keep the same interface', async () => {
    const { loadStreak, saveStreak } = await import('../../src/lib/streak')
    const data = { currentStreak: 5, lastStudyDate: '2026-04-15', longestStreak: 10 }
    saveStreak(data)
    const loaded = loadStreak()
    expect(loaded.currentStreak).toBe(5)
    expect(loaded.lastStudyDate).toBe('2026-04-15')
    expect(loaded.longestStreak).toBe(10)
  })
})
