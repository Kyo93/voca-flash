/**
 * tests/unit/streak-today-boundary.test.ts
 *
 * RED phase: streak.ts recordStudy() phải dùng 4 AM boundary
 * như getTodayBoundary() trong storage/session.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mocks localStorage
const store: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v },
  removeItem: (k: string) => { delete store[k] },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) },
})

describe('streak today boundary — RED', () => {
  beforeEach(() => { Object.keys(store).forEach(k => delete store[k]) })

  it('streak.ts must import and use getTodayBoundary instead of todayStr', async () => {
    // streak.ts phải import getTodayBoundary từ supabase-storage
    // chứ không tự định nghĩa todayStr() với UTC
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/streak.ts',
      'utf-8'
    )
    // Phải có getTodayBoundary, KHÔNG có function todayStr() riêng
    expect(source).toMatch(/import.*getTodayBoundary.*from/s)
    expect(source).not.toMatch(/function todayStr\(\)/)
  })

  it('streak module must NOT define todayStr with UTC date', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/streak.ts',
      'utf-8'
    )
    // todayStr = () => new Date().toISOString().split('T')[0] là BUG
    // Nó dùng UTC date thay vì 4 AM local boundary
    expect(source).not.toMatch(/todayStr.*=.*toISOString/)
  })

  it('loadStreak/saveStreak still work after refactor (interface unchanged)', async () => {
    const { loadStreak, saveStreak } = await import('../../src/lib/streak')
    const data = { currentStreak: 5, lastStudyDate: '2026-04-15', longestStreak: 10 }
    saveStreak(data)
    const loaded = loadStreak()
    expect(loaded.currentStreak).toBe(5)
    expect(loaded.lastStudyDate).toBe('2026-04-15')
    expect(loaded.longestStreak).toBe(10)
  })
})