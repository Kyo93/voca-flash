/**
 * tests/unit/map-srs-record.test.ts
 *
 * RED phase: srs.ts phải export hàm mapSrsRecordToCardProgress
 * để session.ts khỏi duplicate mapping logic.
 */

import { describe, it, expect, vi } from 'vitest'
import type { SrsRecord } from '../../src/lib/types'

function makeSrsRecord(overrides: Partial<SrsRecord> = {}): SrsRecord {
  return {
    id: 'r1',
    user_id: 'u1',
    word_id: 'w1',
    repetitions: 0,
    lapse_count: 0,
    ease_factor: 2.5,
    interval_days: 0,
    fsrs_stability: 0,
    fsrs_difficulty: 0.5,
    fsrs_state: 0,
    fsrs_scheduled_days: 0,
    fsrs_reps: 0,
    fsrs_lapses: 0,
    next_review_at: null,
    mastered: false,
    last_reviewed: null,
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

describe('mapSrsRecordToCardProgress — RED', () => {
  it('srs.ts must export mapSrsRecordToCardProgress', async () => {
    const mod = await import('../../src/lib/srs')
    expect(typeof mod.mapSrsRecordToCardProgress).toBe('function')
  })

  it('maps all SrsRecord fields correctly to CardProgress', async () => {
    const mod = await import('../../src/lib/srs')
    const record = makeSrsRecord({
      word_id: 'card-123',
      fsrs_stability: 5.5,
      fsrs_difficulty: 0.3,
      fsrs_state: 2,
      fsrs_reps: 4,
      fsrs_lapses: 1,
      fsrs_scheduled_days: 7,
      next_review_at: '2026-04-20T00:00:00Z',
      last_reviewed: '2026-04-13T00:00:00Z',
    })

    const result = mod.mapSrsRecordToCardProgress(record)

    expect(result.cardId).toBe('card-123')
    expect(result.stability).toBe(5.5)
    expect(result.difficulty).toBe(0.3)
    expect(result.state).toBe(2)
    expect(result.reps).toBe(4)
    expect(result.lapses).toBe(1)
    expect(result.scheduledDays).toBe(7)
    expect(result.due).toBe(new Date('2026-04-20T00:00:00Z').getTime())
    expect(result.lastReview).toBe(new Date('2026-04-13T00:00:00Z').getTime())
  })

  it('handles null next_review_at and last_reviewed', async () => {
    vi.useFakeTimers()
    const now = new Date('2026-04-20T12:00:00Z')
    vi.setSystemTime(now)
    
    const mod = await import('../../src/lib/srs')
    const record = makeSrsRecord({
      next_review_at: null,
      last_reviewed: null,
    })

    const result = mod.mapSrsRecordToCardProgress(record)

    expect(result.due).toBe(now.getTime()) // fallback to now
    expect(result.lastReview).toBe(0)   // fallback to 0
    
    vi.useRealTimers()
  })

  it('applies defaults for missing FSRS fields', async () => {
    const mod = await import('../../src/lib/srs')
    const record = makeSrsRecord({
      fsrs_stability: undefined as any,
      fsrs_difficulty: undefined as any,
    })

    const result = mod.mapSrsRecordToCardProgress(record)

    expect(result.stability).toBe(0)
    expect(result.difficulty).toBe(5.0) // default fallback (1-10 scale)
  })

  it('session.ts fetchSrsStates and fetchReviewWords must use the shared function', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/storage/session.ts',
      'utf-8'
    )
    // Both functions should call mapSrsRecordToCardProgress
    expect(source).toMatch(/mapSrsRecordToCardProgress/)
  })
})