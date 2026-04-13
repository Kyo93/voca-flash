/**
 * SRS Migration Tests: SM-2 → FSRS
 *
 * Tests cho việc chuyển đổi dữ liệu từ SM-2 sang FSRS và ngược lại.
 * Cần thiết để đảm bảo backward compatibility với dữ liệu học cũ.
 *
 * Mục tiêu:
 * - Xác định mapping giữa SM-2 fields và FSRS fields
 * - Test edge cases khi user có dữ liệu SM-2 cũ
 * - Verify dữ liệu migration không bị mất thông tin quan trọng
 */

// ── SM-2 Data Shape (hiện tại trong DB) ────────────────────────

interface SM2Data {
  cardId: string
  ease: number        // SM-2 ease factor (default 2.5, min 1.3)
  interval: number    // Days until next review
  repetitions: number // Successful reviews in a row
  nextReview: number  // Timestamp
  lastReview: number  // Timestamp
}

// ── FSRS Data Shape (target) ──────────────────────────────────

interface FSRSData {
  cardId: string
  stability: number   // Recall stability (days) — measure of how well card is memorized
  difficulty: number   // Intrinsic difficulty (0-1) — inherent difficulty of card
  state: number       // 0=New, 1=Learning, 2=Review, 3=Relearning
  repetitions: number // Total review count (persisted for analytics)
  lapses: number      // Number of times forgotten (replaces lapse_count)
  // Derived fields (can be calculated):
  // - scheduledDays: when card is next due
  // - elapsedDays: days since last review
}

// ── Conversion: SM-2 → FSRS ───────────────────────────────────

/**
 * Chuyển đổi dữ liệu SM-2 sang FSRS format.
 *
 * Strategy:
 * - stability: Ước lượng từ interval và repetitions
 *   - Interval = stability × ease × modifier
 *   - => stability ≈ interval / ease (với modifier = 1)
 * - difficulty: Ước lượng từ ease factor
 *   - ease cao = dễ nhớ = difficulty thấp
 *   - difficulty = 1 - ((ease - 1.3) / (3.0 - 1.3))
 *   - ease 2.5 => difficulty ≈ 0.76... hmm, FSRS dùng 0-1 với 0=dễ, 1=khó
 *   - => difficulty = clamp((3.0 - ease) / 2.0, 0, 1)
 * - state: Xác định từ repetitions
 *   - 0 = New (chưa học)
 *   - 1 = Learning (đang học, repetitions < 2)
 *   - 2 = Review (đã thành thạo)
 *   - 3 = Relearning (quên rồi học lại)
 * - repetitions: Giữ nguyên (cần cho analytics)
 * - lapses: = lapse_count (cần track)
 */

function sm2ToFsrs(sm2: SM2Data, lapseCount: number = 0): FSRSData {
  // Estimate stability from interval and ease
  // SM-2: interval ≈ previous_interval × ease (after repetition 2)
  // FSRS stability: expected time before forgetting
  let stability: number
  if (sm2.interval === 0 || sm2.repetitions === 0) {
    // New card or reset
    stability = 0
  } else if (sm2.repetitions === 1) {
    // First successful review → low stability
    stability = 1
  } else {
    // Estimate: stability ≈ interval / ease (approximation)
    stability = Math.max(0.1, sm2.interval / Math.max(1.3, sm2.ease))
  }

  // Estimate difficulty from ease factor
  // SM-2 ease: 1.3 (hardest) to ~3.0 (easiest)
  // FSRS difficulty: 0 (easiest) to 1 (hardest)
  // Map: ease 1.3 → difficulty 1.0, ease 2.5 → difficulty 0.25
  const difficulty = Math.max(0, Math.min(1, (3.0 - sm2.ease) / 1.7))

  // Determine state from repetitions
  let state: number
  if (sm2.repetitions === 0) {
    state = sm2.interval === 0 ? 0 : 3 // New or Relearning
  } else if (sm2.repetitions < 2) {
    state = 1 // Learning
  } else {
    state = 2 // Review
  }

  return {
    cardId: sm2.cardId,
    stability,
    difficulty,
    state,
    repetitions: sm2.repetitions,
    lapses: lapseCount,
  }
}

// ── Conversion: FSRS → SM-2 (for debugging/compatibility) ─────

function fsrsToSm2(fsrs: FSRSData): SM2Data {
  // Reverse estimate for interval (approximate)
  // SM-2 interval = stability × ease × some_factor
  const estimatedEase = 3.0 - (fsrs.difficulty * 1.7)
  const estimatedInterval = fsrs.state === 0 ? 0 :
    fsrs.state === 1 ? fsrs.stability :
    Math.round(fsrs.stability * Math.max(1.3, estimatedEase))

  return {
    cardId: fsrs.cardId,
    ease: Math.max(1.3, estimatedEase),
    interval: estimatedInterval,
    repetitions: fsrs.repetitions,
    nextReview: Date.now() + estimatedInterval * 24 * 60 * 60 * 1000,
    lastReview: Date.now(),
  }
}

// ── Tests: SM-2 → FSRS Conversion ─────────────────────────────

import { describe, it, expect } from 'vitest'

describe('SM-2 → FSRS Migration', () => {

  describe('stability estimation', () => {
    it('should set stability = 0 for new cards (repetitions=0, interval=0)', () => {
      const sm2: SM2Data = {
        cardId: 'new-card',
        ease: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
        lastReview: 0,
      }

      const fsrs = sm2ToFsrs(sm2)

      expect(fsrs.stability).toBe(0)
      expect(fsrs.state).toBe(0) // New
    })

    it('should set stability = 1 for first successful review', () => {
      const sm2: SM2Data = {
        cardId: 'card-1',
        ease: 2.5,
        interval: 1,
        repetitions: 1,
        nextReview: Date.now(),
        lastReview: Date.now(),
      }

      const fsrs = sm2ToFsrs(sm2)

      expect(fsrs.stability).toBe(1) // First review = low stability
      expect(fsrs.state).toBe(1) // Learning
    })

    it('should estimate stability from interval/ease for mature cards', () => {
      const sm2: SM2Data = {
        cardId: 'card-mature',
        ease: 2.5,
        interval: 15,
        repetitions: 3,
        nextReview: Date.now(),
        lastReview: Date.now(),
      }

      const fsrs = sm2ToFsrs(sm2)

      // stability ≈ interval / ease = 15 / 2.5 = 6
      expect(fsrs.stability).toBeCloseTo(6, 0)
    })

    it('should handle high ease factor (easy card)', () => {
      const sm2: SM2Data = {
        cardId: 'card-easy',
        ease: 2.8,
        interval: 30,
        repetitions: 4,
        nextReview: Date.now(),
        lastReview: Date.now(),
      }

      const fsrs = sm2ToFsrs(sm2)

      // stability = 30 / 2.8 ≈ 10.7
      expect(fsrs.stability).toBeGreaterThan(10)
    })
  })

  describe('difficulty estimation', () => {
    it('should estimate difficulty 0 for impossible ease (edge case)', () => {
      const sm2: SM2Data = {
        cardId: 'card-edge',
        ease: 3.0,
        interval: 10,
        repetitions: 2,
        nextReview: Date.now(),
        lastReview: Date.now(),
      }

      const fsrs = sm2ToFsrs(sm2)

      // difficulty = (3.0 - 3.0) / 1.7 = 0
      expect(fsrs.difficulty).toBeCloseTo(0, 1)
    })

    it('should estimate difficulty 1.0 for minimum ease (1.3)', () => {
      const sm2: SM2Data = {
        cardId: 'card-hard',
        ease: 1.3,
        interval: 1,
        repetitions: 1,
        nextReview: Date.now(),
        lastReview: Date.now(),
      }

      const fsrs = sm2ToFsrs(sm2)

      // difficulty = (3.0 - 1.3) / 1.7 = 1.0
      expect(fsrs.difficulty).toBeCloseTo(1.0, 1)
    })

    it('should estimate difficulty ~0.25 for default ease (2.5)', () => {
      const sm2: SM2Data = {
        cardId: 'card-normal',
        ease: 2.5,
        interval: 6,
        repetitions: 2,
        nextReview: Date.now(),
        lastReview: Date.now(),
      }

      const fsrs = sm2ToFsrs(sm2)

      // difficulty = (3.0 - 2.5) / 1.7 ≈ 0.294
      expect(fsrs.difficulty).toBeGreaterThan(0.2)
      expect(fsrs.difficulty).toBeLessThan(0.4)
    })
  })

  describe('state determination', () => {
    it('should set state = 0 (New) for never-reviewed cards', () => {
      const sm2: SM2Data = {
        cardId: 'never-reviewed',
        ease: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
        lastReview: 0,
      }

      const fsrs = sm2ToFsrs(sm2)

      expect(fsrs.state).toBe(0)
    })

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

    it('should set state = 3 (Relearning) for reset card', () => {
      const sm2: SM2Data = {
        cardId: 'forgot-card',
        ease: 2.5,
        interval: 1, // Reset to 1 day
        repetitions: 0, // Reset to 0
        nextReview: Date.now(),
        lastReview: Date.now(),
      }

      const fsrs = sm2ToFsrs(sm2)

      expect(fsrs.state).toBe(3) // Relearning
    })
  })

  describe('repetitions and lapses', () => {
    it('should preserve repetitions count', () => {
      const sm2: SM2Data = {
        cardId: 'card-5-reps',
        ease: 2.6,
        interval: 30,
        repetitions: 5,
        nextReview: Date.now(),
        lastReview: Date.now(),
      }

      const fsrs = sm2ToFsrs(sm2, 0)

      expect(fsrs.repetitions).toBe(5)
    })

    it('should carry over lapse_count as lapses', () => {
      const sm2: SM2Data = {
        cardId: 'card-2-lapses',
        ease: 2.4,
        interval: 10,
        repetitions: 3,
        nextReview: Date.now(),
        lastReview: Date.now(),
      }

      const fsrs = sm2ToFsrs(sm2, 2) // 2 lapses in SM-2

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
      interval: 365, // 1 year (unlikely but possible)
      repetitions: 10,
      nextReview: Date.now(),
      lastReview: Date.now(),
    }

    const fsrs = sm2ToFsrs(sm2)

    // Should not crash, stability should be reasonable
    expect(fsrs.stability).toBeGreaterThan(0)
    expect(fsrs.state).toBe(2)
  })

  it('should handle card with extreme ease (edge case)', () => {
    const sm2: SM2Data = {
      cardId: 'extreme-ease',
      ease: 1.3, // Minimum
      interval: 100,
      repetitions: 5,
      nextReview: Date.now(),
      lastReview: Date.now(),
    }

    const fsrs = sm2ToFsrs(sm2)

    // Difficulty should be clamped to 1.0
    expect(fsrs.difficulty).toBeLessThanOrEqual(1)
    // Stability should still be reasonable
    expect(fsrs.stability).toBeGreaterThan(0)
  })

  it('should handle card with zero interval but has repetitions (data inconsistency)', () => {
    const sm2: SM2Data = {
      cardId: 'inconsistent',
      ease: 2.5,
      interval: 0,
      repetitions: 3, // Impossible in SM-2 logic
      nextReview: Date.now(),
      lastReview: Date.now(),
    }

    const fsrs = sm2ToFsrs(sm2)

    // Should not crash
    expect(fsrs.state).toBeDefined()
    expect(fsrs.stability).toBeGreaterThanOrEqual(0)
  })
})

// ── Tests: Round-trip conversion ─────────────────────────────

describe('Round-trip: SM-2 → FSRS → SM-2', () => {
  it('should approximately preserve data through round-trip', () => {
    const original: SM2Data = {
      cardId: 'roundtrip-test',
      ease: 2.5,
      interval: 15,
      repetitions: 3,
      nextReview: Date.now(),
      lastReview: Date.now(),
    }

    const fsrs = sm2ToFsrs(original)
    const recovered = fsrsToSm2(fsrs)

    // Repetitions should be exact
    expect(recovered.repetitions).toBe(original.repetitions)

    // Ease should be approximately preserved
    expect(recovered.ease).toBeCloseTo(original.ease, 1)

    // Interval will differ due to estimation — that's OK
    // The important thing is state and repetitions are preserved
    expect(recovered.cardId).toBe(original.cardId)
  })
})
