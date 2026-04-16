import { fsrs, createEmptyCard, State, type Card as FSRSCard } from 'ts-fsrs'
import type { SrsRecord } from './types'

export interface Card {
  id: string
  front: string
  back: string
  phonetic?: string
  example?: string
  example_vi?: string
  image_url?: string
  image_position?: string
  topic: string
  createdAt: number
}

/** 
 * FSRS Card Progress — Unified Interface 
 * This replaces the legacy SM-2 CardProgress.
 */
export interface CardProgress {
  cardId: string
  stability: number      // Recall stability (days)
  difficulty: number     // Intrinsic difficulty (0-1)
  state: number          // 0=New, 1=Learning, 2=Review, 3=Relearning
  reps: number           // Total review count
  lapses: number         // Times forgotten
  scheduledDays: number  // Days until next review
  due: number            // Timestamp of next review (ms)
  lastReview: number     // Last review timestamp (ms)
}

/** 
 * Internal FSRS Scheduler instance (Singleton) 
 * request_retention default is 0.9 (90% retention)
 * enable_short_term=false ensures we don't have sub-day intervals
 */
const scheduler = fsrs({ 
  enable_short_term: false,
  request_retention: 0.9 
})

/**
 * Maps SM-2 Rating (1-3) or FSRS Rating (1-4)
 * SM-2 Quality: 0=Again, 1=Hard, 2=Good, 3=Easy
 * FSRS Rating: 1=Again, 2=Hard, 3=Good, 4=Easy
 */
export type SrsRating = 1 | 2 | 3 | 4

/**
 * Calculates the next review date using FSRS algorithm.
 */
export function calculateFSRSReview(
  progress: CardProgress,
  rating: SrsRating,
  retention: number = 0.9
): CardProgress {
  // 1. Create/Configure scheduler with user retention preference
  const s = retention === 0.9 ? scheduler : fsrs({ enable_short_term: false, request_retention: retention })
  
  // 2. Map Progress to FSRS Card
  const currentCard: FSRSCard = {
    due: new Date(progress.due),
    stability: progress.stability,
    difficulty: progress.difficulty,
    elapsed_days: progress.lastReview ? Math.floor((Date.now() - progress.lastReview) / (24 * 60 * 60 * 1000)) : 0,
    scheduled_days: progress.scheduledDays,
    reps: progress.reps,
    lapses: progress.lapses,
    state: progress.state,
    last_review: progress.lastReview ? new Date(progress.lastReview) : undefined,
    learning_steps: 0
  }

  // 3. Repeat (Calculate all 4 options, then pick the rated one)
  const results = s.repeat(currentCard, new Date())
  const selected = results[rating]
  const newCard = selected.card

  return {
    cardId: progress.cardId,
    stability: newCard.stability,
    difficulty: newCard.difficulty,
    state: newCard.state,
    reps: newCard.reps,
    lapses: newCard.lapses,
    scheduledDays: newCard.scheduled_days,
    due: newCard.due.getTime(),
    lastReview: Date.now()
  }
}

/**
 * Unified check for "Mastered" status.
 * FSRS Criteria: Stability is at least 21 days AND not in Relearning state.
 */
export function isMastered(progress: CardProgress): boolean {
  return progress.stability >= 21 && progress.state !== State.Relearning
}

/**
 * Creates initial progress for a newly encountered card.
 */
export function createInitialProgress(cardId: string): CardProgress {
  const empty = createEmptyCard()
  return {
    cardId,
    stability: empty.stability,
    difficulty: empty.difficulty,
    state: empty.state,
    reps: empty.reps,
    lapses: empty.lapses,
    scheduledDays: empty.scheduled_days,
    due: empty.due.getTime(),
    lastReview: 0
  }
}

/**
 * Resets a card (used when user fails in Free Study).
 */
export function resetFSRSCard(progress: CardProgress): CardProgress {
  const currentCard: FSRSCard = {
    due: new Date(progress.due),
    stability: progress.stability,
    difficulty: progress.difficulty,
    elapsed_days: 0,
    scheduled_days: progress.scheduledDays,
    reps: progress.reps,
    lapses: progress.lapses,
    state: progress.state,
    last_review: progress.lastReview ? new Date(progress.lastReview) : undefined,
    learning_steps: 0
  }

  const { card: reset } = scheduler.forget(currentCard, new Date())
  
  return {
    cardId: progress.cardId,
    stability: reset.stability,
    difficulty: reset.difficulty,
    state: reset.state,
    reps: reset.reps,
    lapses: reset.lapses,
    scheduledDays: reset.scheduled_days,
    due: reset.due.getTime(),
    lastReview: Date.now()
  }
}

/**
 * Conversion helper: SM-2 to FSRS (used by migration tests).
 * Logic matches the SQL migration script.
 */
export function sm2ToFsrs(sm2: { ease: number, interval: number, repetitions: number, lapse_count?: number }): Partial<CardProgress> {
  return {
    stability: Math.max(0.1, sm2.interval),
    difficulty: Math.max(0, Math.min(1, (3.0 - sm2.ease) / 1.7)),
    state: sm2.repetitions === 0 ? 3 : (sm2.repetitions < 2 ? 1 : 2),
    reps: sm2.repetitions,
    lapses: sm2.lapse_count ?? 0,
    scheduledDays: sm2.interval
  }
}

/**
 * Mapping helper: SM-2 Intensity to FSRS Retention.
 * SM-2 Intensity 0.6 (High) -> 1.4 (Low)
 * FSRS Retention 0.70 -> 0.97
 */
export function mapIntensityToRetention(intensity: number): number {
  if (intensity <= 0.6) return 0.95
  if (intensity <= 0.8) return 0.93
  if (intensity <= 1.0) return 0.90
  if (intensity <= 1.2) return 0.85
  return 0.8 // Relaxed
}

// ── SrsRecord → CardProgress mapping ─────────────────────────
// Single source of truth for mapping DB records to in-memory CardProgress.
// Used by fetchSrsStates, fetchReviewWords in storage/session.ts.
export function mapSrsRecordToCardProgress(record: SrsRecord): CardProgress {
  return {
    cardId: record.word_id,
    stability: record.fsrs_stability ?? 0,
    difficulty: record.fsrs_difficulty ?? 0.5,
    state: record.fsrs_state ?? 0,
    reps: record.fsrs_reps ?? 0,
    lapses: record.fsrs_lapses ?? 0,
    scheduledDays: record.fsrs_scheduled_days ?? 0,
    due: record.next_review_at ? new Date(record.next_review_at).getTime() : Date.now(),
    lastReview: record.last_reviewed ? new Date(record.last_reviewed).getTime() : 0,
  }
}