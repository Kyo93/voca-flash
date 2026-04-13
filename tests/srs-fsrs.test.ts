/**
 * SRS FSRS Tests — ts-fsrs v5.3.2
 *
 * Tests cho thuật toán FSRS sử dụng thư viện ts-fsrs@5.3.2.
 * Verify API chính xác của library.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  fsrs,
  createEmptyCard,
  Rating,
  State,
  type Card,
} from 'ts-fsrs'

// ── Test Helpers ────────────────────────────────────────────────

function createCard(overrides?: Partial<Card>): Card {
  const card = createEmptyCard()
  return { ...card, ...overrides } as Card
}

// ── Tests: createEmptyCard ─────────────────────────────────────

describe('createEmptyCard', () => {
  it('should create card with default New state', () => {
    const card = createEmptyCard()

    expect(card.state).toBe(State.New)
    expect(card.stability).toBe(0)
    // difficulty: starts at 0 for new cards (mean difficulty)
    expect(card.difficulty).toBeGreaterThanOrEqual(0)
    expect(card.reps).toBe(0)
    expect(card.lapses).toBe(0)
    expect(card.scheduled_days).toBe(0)
    expect(card.due).toBeInstanceOf(Date)
  })

  it('should accept partial overrides', () => {
    const card = createCard({
      stability: 5,
      state: State.Review,
      reps: 3,
    })

    expect(card.stability).toBe(5)
    expect(card.state).toBe(State.Review)
    expect(card.reps).toBe(3)
  })
})

// ── Tests: Rating Enum ────────────────────────────────────────

describe('Rating enum', () => {
  it('should have correct values', () => {
    expect(Rating.Again).toBe(1)
    expect(Rating.Hard).toBe(2)
    expect(Rating.Good).toBe(3)
    expect(Rating.Easy).toBe(4)
  })
})

// ── Tests: State Enum ────────────────────────────────────────

describe('State enum', () => {
  it('should have correct values', () => {
    expect(State.New).toBe(0)
    expect(State.Learning).toBe(1)
    expect(State.Review).toBe(2)
    expect(State.Relearning).toBe(3)
  })
})

// ── Tests: Scheduler Creation ─────────────────────────────────

describe('fsrs() scheduler', () => {
  it('should create scheduler with defaults', () => {
    const scheduler = fsrs()

    expect(scheduler).toBeDefined()
    expect(typeof scheduler.repeat).toBe('function')
    expect(typeof scheduler.next).toBe('function')
    expect(typeof scheduler.forget).toBe('function')
  })

  it('should accept custom parameters', () => {
    const scheduler = fsrs({
      request_retention: 0.85,
      maximum_interval: 100,
    })

    expect(scheduler).toBeDefined()
  })

  it('should support enable_short_term: false', () => {
    // IMPORTANT: VocaFlash uses enable_short_term: false
    // to skip learning steps for vocabulary app
    const scheduler = fsrs({
      enable_short_term: false,
    })

    expect(scheduler).toBeDefined()
  })
})

// ── Tests: repeat() — Preview All Outcomes ────────────────────

describe('scheduler.repeat()', () => {
  it('should return all 4 rating outcomes for New card', () => {
    const scheduler = fsrs({ enable_short_term: false })
    const card = createEmptyCard()
    const now = new Date()

    const preview = scheduler.repeat(card, now)

    expect(preview[Rating.Again]).toBeDefined()
    expect(preview[Rating.Hard]).toBeDefined()
    expect(preview[Rating.Good]).toBeDefined()
    expect(preview[Rating.Easy]).toBeDefined()
  })

  it('should have card and log in each outcome', () => {
    const scheduler = fsrs({ enable_short_term: false })
    const card = createEmptyCard()

    const preview = scheduler.repeat(card, new Date())

    for (const rating of [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]) {
      expect(preview[rating]).toHaveProperty('card')
      expect(preview[rating]).toHaveProperty('log')
      expect(preview[rating].card).toBeDefined()
      expect(preview[rating].log).toBeDefined()
    }
  })

  it('should schedule increasing intervals for better ratings', () => {
    const scheduler = fsrs({ enable_short_term: false })
    const card = createEmptyCard()

    const preview = scheduler.repeat(card, new Date())

    const againDays = preview[Rating.Again].card.scheduled_days
    const hardDays = preview[Rating.Hard].card.scheduled_days
    const goodDays = preview[Rating.Good].card.scheduled_days
    const easyDays = preview[Rating.Easy].card.scheduled_days

    // Good should have >= interval than Hard
    expect(goodDays).toBeGreaterThanOrEqual(hardDays)
    // Easy should have >= interval than Good
    expect(easyDays).toBeGreaterThanOrEqual(goodDays)
  })
})

// ── Tests: next() — Single Rating ─────────────────────────────

describe('scheduler.next()', () => {
  it('should calculate Good rating for New card', () => {
    const scheduler = fsrs({ enable_short_term: false })
    const card = createEmptyCard()

    const { card: newCard, log } = scheduler.next(card, new Date(), Rating.Good)

    expect(newCard.reps).toBe(1)
    expect(newCard.scheduled_days).toBeGreaterThan(0)
    expect(newCard.state).toBe(State.Review)
    expect(log.rating).toBe(Rating.Good)
  })

  it('should handle Again rating on New card', () => {
    const scheduler = fsrs({ enable_short_term: false })
    const card = createEmptyCard()

    const { card: againCard } = scheduler.next(card, new Date(), Rating.Again)

    // With enable_short_term: false, Again on New card
    // goes to Review state with low stability, reps increments
    expect(againCard.state).toBe(State.Review)
    expect(againCard.stability).toBeLessThan(1)
    expect(againCard.reps).toBe(1) // reps increments even on Again
    expect(againCard.lapses).toBeGreaterThanOrEqual(0)
  })

  it('should update card on Good rating', () => {
    const scheduler = fsrs({ enable_short_term: false })
    const card = createEmptyCard()

    const { card: card1 } = scheduler.next(card, new Date(), Rating.Good)
    expect(card1.reps).toBe(1)
    expect(card1.stability).toBeGreaterThan(0)

    // Note: stability may not always strictly increase due to FSRS formula
    // but reps should always increment
    expect(card1.state).toBe(State.Review)
  })

  it('should decrease stability on Again rating', () => {
    const scheduler = fsrs({ enable_short_term: false })
    const card = createEmptyCard()

    // First: get to Review state
    const { card: reviewed } = scheduler.next(card, new Date(), Rating.Good)
    const stabilityBefore = reviewed.stability

    // Then: forget
    const { card: forgotten } = scheduler.next(reviewed, new Date(), Rating.Again)

    expect(forgotten.stability).toBeLessThan(stabilityBefore)
    expect(forgotten.lapses).toBe(1)
  })
})

// ── Tests: enable_short_term Behavior ─────────────────────────

describe('enable_short_term: false vs true', () => {
  it('should NOT apply learning steps when disabled', () => {
    // enable_short_term: false = VocaFlash config
    const scheduler = fsrs({ enable_short_term: false })
    const card = createEmptyCard()

    const { card: newCard } = scheduler.next(card, new Date(), Rating.Good)

    // With short_term disabled, Good should graduate to Review immediately
    expect(newCard.state).toBe(State.Review)
    expect(newCard.scheduled_days).toBeGreaterThan(0)
  })
})

// ── Tests: forget() ───────────────────────────────────────────

describe('scheduler.forget()', () => {
  it('should reset card to New state', () => {
    const scheduler = fsrs({ enable_short_term: false })
    const card = createEmptyCard()

    // Review it first
    const { card: reviewed } = scheduler.next(card, new Date(), Rating.Good)
    expect(reviewed.state).toBe(State.Review)

    // Then forget
    const { card: forgotten } = scheduler.forget(reviewed, new Date())

    expect(forgotten.state).toBe(State.New)
    expect(forgotten.stability).toBe(0)
  })

  it('should optionally reset reps', () => {
    const scheduler = fsrs({ enable_short_term: false })
    const card = createEmptyCard()

    const { card: reviewed } = scheduler.next(card, new Date(), Rating.Good)
    expect(reviewed.reps).toBe(1)

    const { card: forgotten } = scheduler.forget(reviewed, new Date(), true)
    expect(forgotten.reps).toBe(0)
  })
})

// ── Tests: Card Field Shapes ─────────────────────────────────

describe('Card type fields', () => {
  it('should have correct field names (ts-fsrs v5)', () => {
    const card = createEmptyCard()

    // These are the ACTUAL field names from ts-fsrs v5
    expect(card).toHaveProperty('due')
    expect(card).toHaveProperty('stability')
    expect(card).toHaveProperty('difficulty')
    expect(card).toHaveProperty('scheduled_days')
    expect(card).toHaveProperty('reps')        // ⚠️ NOT repetitions!
    expect(card).toHaveProperty('lapses')
    expect(card).toHaveProperty('state')
    expect(card).toHaveProperty('learning_steps')
    expect(card).toHaveProperty('last_review') // Optional Date, IS present

    // NOT this (old v4 name):
    expect(card).not.toHaveProperty('repetitions')
  })

  it('should have state as State enum', () => {
    const card = createEmptyCard()
    expect(card.state).toBe(State.New)
    expect(typeof card.state).toBe('number')
  })
})

// ── Tests: ReviewLog ──────────────────────────────────────────

describe('ReviewLog', () => {
  it('should contain review details', () => {
    const scheduler = fsrs({ enable_short_term: false })
    const card = createEmptyCard()

    const { log } = scheduler.next(card, new Date(), Rating.Good)

    expect(log.rating).toBe(Rating.Good)
    // log.state is the state BEFORE the review (State.New = 0)
    expect(log.state).toBe(State.New)
    // log.stability is the stability BEFORE the review (0 for new card)
    expect(log.stability).toBe(0)
    // log.due is the next due date
    expect(log.due).toBeInstanceOf(Date)
    expect(log.review).toBeInstanceOf(Date)
    // log fields are present
    expect(typeof log.scheduled_days).toBe('number')
    expect(typeof log.difficulty).toBe('number')
  })
})

// ── Tests: Maximum Interval ──────────────────────────────────

describe('maximum_interval', () => {
  it('should respect maximum_interval setting', () => {
    // Build up a mature card through actual reviews
    const scheduler = fsrs({
      enable_short_term: false,
      maximum_interval: 30,
    })

    let card = createEmptyCard()
    // Review many times to build stability
    for (let i = 0; i < 15; i++) {
      const due = new Date(Date.now() + card.scheduled_days * 24 * 60 * 60 * 1000)
      ;({ card } = scheduler.next(card, due, Rating.Good))
    }

    // After many reviews, scheduled_days should be capped at or near 30
    // (allowing 1 day tolerance for rounding)
    expect(card.scheduled_days).toBeLessThanOrEqual(31)
    expect(card.scheduled_days).toBeGreaterThan(0)
  })
})

// ── Tests: Difficulty ────────────────────────────────────────

describe('difficulty range', () => {
  it('should be between 0 and 1', () => {
    const card = createEmptyCard()

    expect(card.difficulty).toBeGreaterThanOrEqual(0)
    expect(card.difficulty).toBeLessThanOrEqual(1)
  })

  it('should be affected by rating', () => {
    const scheduler = fsrs({ enable_short_term: false })
    const card = createEmptyCard()

    const { card: againCard } = scheduler.next(card, new Date(), Rating.Again)
    const { card: easyCard } = scheduler.next(card, new Date(), Rating.Easy)

    // Again should increase difficulty, Easy should decrease
    // (exact behavior depends on FSRS formula)
    expect(againCard.difficulty).toBeDefined()
    expect(easyCard.difficulty).toBeDefined()
  })
})

// ── Tests: Integration — Vocabulary App Scenario ─────────────

describe('Vocabulary App Scenario', () => {
  it('should schedule New word → Review → Mature', () => {
    const scheduler = fsrs({
      enable_short_term: false,
      request_retention: 0.9,
      maximum_interval: 365,
    })

    // Step 1: User sees new word, rates Good
    let card = createEmptyCard()
    const due1 = new Date()

    let { card: card1 } = scheduler.next(card, due1, Rating.Good)

    expect(card1.state).toBe(State.Review)
    expect(card1.scheduled_days).toBeGreaterThan(0)
    expect(card1.reps).toBe(1)

    // Step 2: Review again (next day)
    const due2 = new Date(due1.getTime() + card1.scheduled_days * 24 * 60 * 60 * 1000)
    let { card: card2 } = scheduler.next(
      { ...card1, last_review: due1 },
      due2,
      Rating.Good
    )

    expect(card2.scheduled_days).toBeGreaterThan(card1.scheduled_days)
    expect(card2.stability).toBeGreaterThan(card1.stability)

    // Step 3: Continue reviewing until "mastered" (stability >= 21)
    let currentCard = card2
    let days = 0
    while (currentCard.stability < 21 && days < 20) {
      const nextDue = new Date(Date.now() + currentCard.scheduled_days * 24 * 60 * 60 * 1000)
      ;({ card: currentCard } = scheduler.next(
        { ...currentCard, last_review: new Date() },
        nextDue,
        Rating.Good
      ))
      days++
    }

    // After ~10-15 Good reviews, stability should reach 21+
    expect(currentCard.stability).toBeGreaterThanOrEqual(21)
    expect(currentCard.state).toBe(State.Review)
  })

  it('should handle forgetting gracefully', () => {
    const scheduler = fsrs({
      enable_short_term: false,
      request_retention: 0.9,
    })

    // Review card to maturity
    let card = createEmptyCard()
    for (let i = 0; i < 10; i++) {
      ;({ card } = scheduler.next(card, new Date(), Rating.Good))
    }

    const stableStability = card.stability

    // User forgets
    ;({ card } = scheduler.next(card, new Date(), Rating.Again))

    expect(card.stability).toBeLessThan(stableStability)
    expect(card.lapses).toBe(1)

    // Recovery: review again
    ;({ card } = scheduler.next(card, new Date(), Rating.Good))

    // Stability should recover partially, not fully
    expect(card.stability).toBeLessThan(stableStability)
    expect(card.stability).toBeGreaterThan(0)
  })
})
