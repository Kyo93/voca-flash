/**
 * SRS SM-2 Algorithm Tests
 *
 * Tests cho thuật toán SM-2 hiện tại trước khi migrate lên FSRS.
 * Dùng để verify backward compatibility và làm baseline so sánh.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { calculateNextReview, createInitialProgress, getDueCards, Card, CardProgress } from '../src/lib/srs'

// ── Test Helpers ────────────────────────────────────────────

function createCard(id: string): Card {
  return {
    id,
    front: `word-${id}`,
    back: `meaning-${id}`,
    topic: 'test',
    createdAt: Date.now(),
  }
}

function createProgress(overrides: Partial<CardProgress> = {}): CardProgress {
  return {
    cardId: 'card-1',
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: Date.now(),
    lastReview: 0,
    ...overrides,
  }
}

// ── Tests: createInitialProgress ────────────────────────────

describe('createInitialProgress', () => {
  it('should create progress with SM-2 defaults', () => {
    const before = Date.now()
    const progress = createInitialProgress('card-1')

    expect(progress.cardId).toBe('card-1')
    expect(progress.ease).toBe(2.5)
    expect(progress.interval).toBe(0)
    expect(progress.repetitions).toBe(0)
    // nextReview uses Date.now() at creation time — compare with slight buffer
    expect(progress.nextReview).toBeGreaterThanOrEqual(before)
    expect(progress.lastReview).toBe(0)
  })
})

// ── Tests: calculateNextReview — Failed Reviews ──────────────

describe('calculateNextReview — Failed Reviews (rating < 3)', () => {
  it('should reset repetitions to 0 on failed review (rating 0)', () => {
    const progress = createProgress({ repetitions: 5, interval: 30, ease: 2.6 })
    const result = calculateNextReview(progress, 0)

    expect(result.repetitions).toBe(0)
    expect(result.interval).toBe(1) // Reset to 1 day
  })

  it('should reset repetitions to 0 on failed review (rating 1)', () => {
    const progress = createProgress({ repetitions: 3, interval: 10, ease: 2.4 })
    const result = calculateNextReview(progress, 1)

    expect(result.repetitions).toBe(0)
    expect(result.interval).toBe(1)
  })

  it('should reset repetitions to 0 on failed review (rating 2)', () => {
    const progress = createProgress({ repetitions: 4, interval: 60, ease: 2.8 })
    const result = calculateNextReview(progress, 2)

    expect(result.repetitions).toBe(0)
    expect(result.interval).toBe(1)
  })

  it('should decrease ease on failed review', () => {
    const progress = createProgress({ repetitions: 3, ease: 2.5, interval: 10 })
    const result = calculateNextReview(progress, 1)

    // SM-2: ease decreases on fail
    expect(result.ease).toBeLessThan(2.5)
    expect(result.ease).toBeGreaterThanOrEqual(1.3) // Minimum ease
  })
})

// ── Tests: calculateNextReview — Successful Reviews ──────────

describe('calculateNextReview — Successful Reviews (rating >= 3)', () => {
  it('should set interval to 1 day on first successful review (repetitions=0)', () => {
    const progress = createProgress({ repetitions: 0, interval: 0 })
    const result = calculateNextReview(progress, 3)

    expect(result.repetitions).toBe(1)
    expect(result.interval).toBe(1)
  })

  it('should set interval to 6 days on second successful review (repetitions=1)', () => {
    const progress = createProgress({ repetitions: 1, interval: 1 })
    const result = calculateNextReview(progress, 3)

    expect(result.repetitions).toBe(2)
    expect(result.interval).toBe(6)
  })

  it('should multiply interval by ease on third+ successful review', () => {
    const progress = createProgress({ repetitions: 2, interval: 6, ease: 2.5 })
    const result = calculateNextReview(progress, 3)

    expect(result.repetitions).toBe(3)
    expect(result.interval).toBe(Math.round(6 * 2.5)) // 15
  })

  it('should apply intensity multiplier (relaxed: 1.4)', () => {
    const progress = createProgress({ repetitions: 2, interval: 6, ease: 2.5 })
    const result = calculateNextReview(progress, 3, 1.4)

    // interval = 6 * 2.5 = 15, then * 1.4 = 21
    expect(result.interval).toBe(21)
  })

  it('should apply intensity multiplier (frequent: 0.6)', () => {
    const progress = createProgress({ repetitions: 2, interval: 6, ease: 2.5 })
    const result = calculateNextReview(progress, 3, 0.6)

    // interval = 6 * 2.5 = 15, then * 0.6 = 9
    expect(result.interval).toBe(9)
  })

  it('should increase ease on Easy rating (rating=5)', () => {
    // SM-2 ease formula: ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    // rating 5 → q=5 → delta = 0.1 - 0 * 0.02 = +0.1
    // rating 4 → q=4 → delta = 0.1 - 1 * 0.10 = 0.0 (no change!)
    // rating 3 → q=3 → delta = 0.1 - 2 * 0.14 = -0.18 (decreases)
    const progress = createProgress({ repetitions: 1, ease: 2.5, interval: 1 })
    const result = calculateNextReview(progress, 5)

    expect(result.ease).toBeGreaterThan(2.5)
    expect(result.ease).toBeCloseTo(2.6, 1) // 2.5 + 0.1
  })

  it('should cap ease at minimum 1.3', () => {
    const progress = createProgress({ repetitions: 0, ease: 1.3, interval: 0 })
    const result = calculateNextReview(progress, 0) // Fail

    expect(result.ease).toBeGreaterThanOrEqual(1.3)
  })
})

// ── Tests: calculateNextReview — Rating Scale ────────────────

describe('calculateNextReview — Rating Scale Mapping', () => {
  // Rating 0-5 maps to SM-2 quality 1-5 via: Math.round((rating / 5) * 5)
  it('should map rating 0 → quality 0 (clamped to 1)', () => {
    const progress = createProgress({ repetitions: 0 })
    const result = calculateNextReview(progress, 0)

    // rating 0 → Math.round(0) = 0 → Math.max(1, 0) = 1 → q=1 (fail)
    expect(result.repetitions).toBe(0)
  })

  it('should map rating 5 → quality 5 (Easy) with longest interval', () => {
    // Rating 5 → q=5 (Easy in SM-2)
    // After 2 reps with interval=6, ease=2.5:
    // interval = 6 * 2.5 = 15 (same as Good for third review)
    // BUT ease changes: +0.1 - 0 = +0.14 → ease = 2.64
    const progress = createProgress({ repetitions: 2, interval: 6, ease: 2.5 })
    const result = calculateNextReview(progress, 5)

    expect(result.repetitions).toBe(3)
    expect(result.interval).toBe(15) // interval * ease
    expect(result.ease).toBeGreaterThan(2.5) // ease increased by 0.14
  })

  it('should clamp rating to 0-5 range', () => {
    const progress = createProgress({ repetitions: 0 })

    // Negative rating should not crash
    const resultNeg = calculateNextReview(progress, -1 as any)
    expect(resultNeg.repetitions).toBeDefined()

    // Over-max rating should not crash
    const resultOver = calculateNextReview(progress, 10 as any)
    expect(resultOver.repetitions).toBeDefined()
  })
})

// ── Tests: getDueCards ──────────────────────────────────────

describe('getDueCards', () => {
  it('should return all cards with no progress', () => {
    const cards = [createCard('1'), createCard('2'), createCard('3')]
    const progressMap = new Map<string, CardProgress>()

    const due = getDueCards(cards, progressMap)

    expect(due.length).toBe(3)
  })

  it('should filter out cards with future nextReview', () => {
    // Use consistent IDs (match progressMap keys)
    const cards = [createCard('card-1'), createCard('card-2'), createCard('card-3')]
    const progressMap = new Map<string, CardProgress>([
      ['card-1', createProgress({ nextReview: Date.now() + 86400000 })] // Tomorrow (not due)
    ])

    const due = getDueCards(cards, progressMap)

    expect(due.length).toBe(2)
    expect(due.find(c => c.id === 'card-1')).toBeUndefined() // card-1 is future, excluded
    expect(due.find(c => c.id === 'card-2')).toBeDefined()  // card-2 has no progress, due
    expect(due.find(c => c.id === 'card-3')).toBeDefined()  // card-3 has no progress, due
  })

  it('should include cards with past or equal nextReview', () => {
    const cards = [createCard('1'), createCard('2')]
    const progressMap = new Map<string, CardProgress>([
      ['card-1', createProgress({ nextReview: Date.now() - 1000 })] // Past
    ])

    const due = getDueCards(cards, progressMap)

    expect(due.length).toBe(2) // card-1 due (past), card-2 due (no progress)
  })

  it('should handle empty cards array', () => {
    const due = getDueCards([], new Map())
    expect(due.length).toBe(0)
  })

  it('should handle empty progress map', () => {
    const cards = [createCard('1'), createCard('2')]
    const due = getDueCards(cards, new Map())
    expect(due.length).toBe(2)
  })
})

// ── Tests: nextReview timestamp ─────────────────────────────

describe('nextReview timestamp', () => {
  it('should set nextReview to now + interval for successful review', () => {
    const before = Date.now()
    const progress = createProgress({ repetitions: 0, interval: 0 })
    const result = calculateNextReview(progress, 3)

    const expectedMin = before + result.interval * 24 * 60 * 60 * 1000
    expect(result.nextReview).toBeGreaterThanOrEqual(expectedMin)
  })

  it('should set lastReview to approximately now', () => {
    const before = Date.now()
    const progress = createProgress({ repetitions: 0 })
    const result = calculateNextReview(progress, 3)

    expect(result.lastReview).toBeGreaterThanOrEqual(before)
    expect(result.lastReview).toBeLessThanOrEqual(Date.now())
  })
})

// ── Tests: Mastered threshold ─────────────────────────────

describe('Mastered threshold (reference for FSRS migration)', () => {
  // NOTE: This is the SM-2 definition of "mastered"
  // In useFlashcard.ts: repetitions >= 5
  // In useReviewSession.ts: repetitions >= 6

  it('should reach mastered (5 reps) after 4 successful Good reviews', () => {
    let progress = createProgress({ repetitions: 0, interval: 0, ease: 2.5 })

    // Simulate 5 successful reviews
    for (let i = 0; i < 5; i++) {
      progress = calculateNextReview(progress, 3)
    }

    // After 5 successful reviews, repetitions = 5
    expect(progress.repetitions).toBe(5)
  })

  it('should reach mastered (6 reps) in review session after 6 successful reviews', () => {
    let progress = createProgress({ repetitions: 0, interval: 0, ease: 2.5 })

    for (let i = 0; i < 6; i++) {
      progress = calculateNextReview(progress, 3)
    }

    expect(progress.repetitions).toBe(6)
  })
})
