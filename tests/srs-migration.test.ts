/**
 * SRS Migration Tests: SM-2 → FSRS
 *
 * Tests cho việc chuyển đổi dữ liệu từ SM-2 sang FSRS.
 * Đảm bảo quá trình migration (011_fsrs_hard_migration.sql) được mô phỏng chính xác trong code.
 */

import { describe, it, expect } from 'vitest'
import { sm2ToFsrs } from '../src/lib/srs'

// ── SM-2 Data Shape (hiện tại trong DB) ────────────────────────

interface SM2Data {
  cardId: string
  ease: number        // SM-2 ease factor (default 2.5, min 1.3)
  interval: number    // Days until next review
  repetitions: number // Successful reviews in a row
  lapse_count?: number // Times forgotten
  nextReview: number  // Timestamp
  lastReview: number  // Timestamp
}

// ── Tests: sm2ToFsrs() ────────────────────────────────────────

describe('sm2ToFsrs() conversion logic', () => {
  it('should convert default SM-2 card (ease=2.5, repetitions=0) correctly', () => {
    const sm2: SM2Data = {
      cardId: 'test-card-1',
      ease: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: Date.now(),
      lastReview: Date.now(),
    }

    const fsrs = sm2ToFsrs(sm2)

    // Initial stability should be based on interval (min 0.1)
    expect(fsrs.stability).toBeGreaterThanOrEqual(0.1)
    
    // Normal difficulty mapping: 5 + (3.0 - 2.5) * 2 = 6.0
    expect(fsrs.difficulty).toBe(6.0)

    // state = 3 (Relearning) for reps=0
    expect(fsrs.state).toBe(3)
  })

  describe('state mapping', () => {
    it('should set state = 1 (Learning) for 1 repetition', () => {
      const sm2: SM2Data = {
        cardId: 'learning',
        ease: 2.5,
        interval: 1,
        repetitions: 1,
        nextReview: Date.now(),
        lastReview: Date.now(),
      }

      const fsrs = sm2ToFsrs(sm2)
      expect(fsrs.state).toBe(1)
    })

    it('should set state = 2 (Review) for 2+ repetitions', () => {
      const sm2: SM2Data = {
        cardId: 'review',
        ease: 2.5,
        interval: 6,
        repetitions: 2,
        nextReview: Date.now(),
        lastReview: Date.now(),
      }

      const fsrs = sm2ToFsrs(sm2)
      expect(fsrs.state).toBe(2)
    })
  })

  describe('repetitions and lapses', () => {
    it('should preserve repetitions count as reps', () => {
      const sm2: SM2Data = {
        cardId: 'card-5-reps',
        ease: 2.6,
        interval: 30,
        repetitions: 5,
        nextReview: Date.now(),
        lastReview: Date.now(),
      }

      const fsrs = sm2ToFsrs(sm2)
      expect(fsrs.reps).toBe(5)
    })

    it('should carry over lapse_count as lapses', () => {
      const sm2: SM2Data = {
        cardId: 'card-2-lapses',
        ease: 2.4,
        interval: 10,
        repetitions: 3,
        lapse_count: 2,
        nextReview: Date.now(),
        lastReview: Date.now(),
      }

      const fsrs = sm2ToFsrs(sm2)
      expect(fsrs.lapses).toBe(2)
    })
  })
})

// ── Tests: Edge Cases ─────────────────────────────────────────

describe('Migration Edge Cases', () => {
  it('should handle card with very long interval (legacy data)', () => {
    const sm2: SM2Data = {
      cardId: 'legacy-card',
      ease: 2.5,
      interval: 365,
      repetitions: 10,
      nextReview: Date.now(),
      lastReview: Date.now(),
    }

    const fsrs = sm2ToFsrs(sm2)

    expect(fsrs.stability).toBe(365)
    expect(fsrs.state).toBe(2)
  })

  it('should handle card with extreme low ease', () => {
    const sm2: SM2Data = {
      cardId: 'extreme-ease',
      ease: 1.3,
      interval: 100,
      repetitions: 5,
      nextReview: Date.now(),
      lastReview: Date.now(),
    }

    const fsrs = sm2ToFsrs(sm2)

    // Difficulty should be high (closer to 10)
    // 5 + (3.0 - 1.3) * 2 = 8.4
    expect(fsrs.difficulty).toBe(8.4)
  })

  it('should handle extreme high ease', () => {
    const sm2: SM2Data = {
      cardId: 'high-ease',
      ease: 5.0,
      interval: 100,
      repetitions: 15,
      nextReview: Date.now(),
      lastReview: Date.now(),
    }

    const fsrs = sm2ToFsrs(sm2)

    // Difficulty should be low (clamped to 1.0)
    // 5 + (3.0 - 5.0) * 2 = 1.0
    expect(fsrs.difficulty).toBe(1)
  })
})
