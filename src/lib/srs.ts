import { fsrs, createEmptyCard, State, type Card as FSRSCard } from 'ts-fsrs'
import i18n from '../i18n'
import type { SrsRecord } from './types'
import { 
  SRS_STABILITY_LEVELS, 
  STUDY_SESSION_DEFAULTS, 
  TIME_CONSTANTS, 
  SRS_CONFIG,
  SRS_SM2_MIGRATION_CONSTANTS
} from './constants'

export { State } from 'ts-fsrs'

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
 */
export interface CardProgress {
  cardId: string
  stability: number      // Recall stability (days)
  difficulty: number     // Intrinsic difficulty (1-10)
  state: number          // 0=New, 1=Learning, 2=Review, 3=Relearning
  reps: number           // Total review count
  lapses: number         // Times forgotten
  scheduledDays: number  // Days until next review
  due: number            // Timestamp of next review (ms)
  lastReview: number     // Last review timestamp (ms)
}

/**
 * Maps SM-2 Rating (1-3) or FSRS Rating (1-4)
 */
export type SrsRating = 1 | 2 | 3 | 4

/**
 * Types for Study Challenges
 */
export type StudyChallengeType = 'cloze' | 'listen' | 'recognition'

export interface IntervalPreview {
  rating: SrsRating
  label: string
  color: string
}

/**
 * UI styles cho từng cấp độ stability của thẻ.
 * Tách thành lookup table để tránh lặp 16 chuỗi Tailwind hardcoded trong getSrsLevelConfig.
 */
const SRS_LEVEL_STYLES = {
  ROOTED: {
    text: 'text-[#F5D76E]',
    bg: 'bg-[#F5D76E]/10',
    color: 'bg-[#F5D76E]',
    glow: 'shadow-[0_0_12px_rgba(245,215,110,0.3)]',
  },
  MASTERED: {
    text: 'text-[#4ade80]',
    bg: 'bg-[#4ade80]/10',
    color: 'bg-[#4ade80]',
    glow: '',
  },
  STABLE: {
    text: 'text-[#60a5fa]',
    bg: 'bg-[#60a5fa]/10',
    color: 'bg-[#60a5fa]',
    glow: '',
  },
  FRESH: {
    text: 'text-[#94a3b8]',
    bg: 'bg-[#94a3b8]/10',
    color: 'bg-[#94a3b8]',
    glow: '',
  },
} as const

/**
 * Returns UI configuration for a given SRS stability level.
 */
export function getSrsLevelConfig(stability: number) {
  if (stability >= SRS_STABILITY_LEVELS.ROOTED) {
    return { label: i18n.t('home.status.rooted'), ...SRS_LEVEL_STYLES.ROOTED }
  }
  if (stability >= SRS_STABILITY_LEVELS.MASTERED) {
    return { label: i18n.t('flashcard.mastered'), ...SRS_LEVEL_STYLES.MASTERED }
  }
  if (stability >= SRS_STABILITY_LEVELS.LEARNING) {
    return { label: i18n.t('home.status.stable'), ...SRS_LEVEL_STYLES.STABLE }
  }
  return { label: i18n.t('home.status.fresh'), ...SRS_LEVEL_STYLES.FRESH }
}

const DEFAULT_RETENTION = SRS_CONFIG.RETENTION_DEFAULT

/** 
 * Internal FSRS Scheduler instance (Singleton)
 */
const scheduler = fsrs({
  enable_short_term: false,
  request_retention: DEFAULT_RETENTION
})

/**
 * Cache scheduler instances per retention value so non-default retentions
 * don't rebuild an FSRS scheduler on every calculateFSRSReview() call
 * (which can fire many times per review session).
 */
const schedulerCache = new Map<number, ReturnType<typeof fsrs>>()
function getScheduler(retention: number): ReturnType<typeof fsrs> {
  if (retention === DEFAULT_RETENTION) return scheduler
  let s = schedulerCache.get(retention)
  if (!s) {
    s = fsrs({ enable_short_term: false, request_retention: retention })
    schedulerCache.set(retention, s)
  }
  return s
}

/**
 * Helper: Format scheduled days into human readable interval.
 */
function formatInterval(days: number): string {
  if (days < 1) {
    const mins = Math.round(days * 24 * 60)
    return i18n.t('srs.interval.minute', { count: mins || 10 })
  }
  if (days >= 30) {
    const months = Math.round(days / 30)
    return i18n.t('srs.interval.month', { count: months })
  }
  return i18n.t('srs.interval.day', { count: Math.round(days) })
}

/**
 * Maps app-specific CardProgress to ts-fsrs Library Card type.
 */
function mapCardProgressToFSRSCard(progress: CardProgress): FSRSCard {
  return {
    due: new Date(progress.due),
    stability: progress.stability,
    difficulty: progress.difficulty,
    elapsed_days: progress.lastReview ? Math.floor((Date.now() - progress.lastReview) / TIME_CONSTANTS.ONE_DAY_MS) : 0,
    scheduled_days: progress.scheduledDays,
    reps: progress.reps,
    lapses: progress.lapses,
    state: progress.state,
    last_review: progress.lastReview ? new Date(progress.lastReview) : undefined,
    learning_steps: 0
  }
}

/**
 * Maps DB SrsRecord to app CardProgress.
 */
export function mapSrsRecordToCardProgress(record: SrsRecord): CardProgress {
  return {
    cardId: record.word_id,
    stability: record.fsrs_stability ?? 0,
    difficulty: record.fsrs_difficulty ?? 5.0,
    state: record.fsrs_state ?? State.New,
    reps: record.fsrs_reps ?? 0,
    lapses: record.fsrs_lapses ?? 0,
    scheduledDays: record.fsrs_scheduled_days ?? 0,
    due: record.next_review_at ? new Date(record.next_review_at).getTime() : Date.now(),
    lastReview: record.last_reviewed ? new Date(record.last_reviewed).getTime() : 0
  }
}

/**
 * Calculates the next review date using FSRS algorithm.
 */
export function calculateFSRSReview(
  progress: CardProgress,
  rating: SrsRating,
  retention: number = DEFAULT_RETENTION
): CardProgress {
  const srsScheduler = getScheduler(retention)
  const currentCard = mapCardProgressToFSRSCard(progress)
  const results = srsScheduler.repeat(currentCard, new Date())
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
 */
export function isMastered(progress: CardProgress): boolean {
  return progress.stability >= SRS_STABILITY_LEVELS.MASTERED && progress.state !== State.Relearning
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
  const currentCard = mapCardProgressToFSRSCard(progress)
  currentCard.elapsed_days = 0
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
 */
export function sm2ToFsrs(sm2: { ease: number, interval: number, repetitions: number, lapse_count?: number }): Partial<CardProgress> {
  const { 
    MIN_STABILITY, MIN_DIFFICULTY, MAX_DIFFICULTY, 
    EASE_MAPPING_BASE, EASE_MAPPING_FACTOR 
  } = SRS_SM2_MIGRATION_CONSTANTS

  return {
    stability: Math.max(MIN_STABILITY, sm2.interval),
    difficulty: Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, 5 + (EASE_MAPPING_BASE - sm2.ease) * EASE_MAPPING_FACTOR)), 
    state: sm2.repetitions === 0 ? State.Relearning : (sm2.repetitions < 2 ? State.Learning : State.Review),
    reps: sm2.repetitions,
    lapses: sm2.lapse_count ?? 0,
    scheduledDays: sm2.interval
  }
}

/**
 * Maps user intensity preference to target retention rate.
 */
export function mapIntensityToRetention(intensity: number): number {
  const matching = SRS_CONFIG.INTENSITY_THRESHOLDS.find(entry => intensity <= entry.threshold)
  return matching ? matching.retention : 0.80
}

/**
 * Maps quiz results to SrsRating (1-4).
 */
export function mapTestResultToRating(isCorrect: boolean, responseTimeMs: number): SrsRating {
  if (!isCorrect) return 1 // Again
  if (responseTimeMs >= STUDY_SESSION_DEFAULTS.RATING_THRESHOLD_GOOD_MS) return 2 // Hard
  if (responseTimeMs >= STUDY_SESSION_DEFAULTS.RATING_THRESHOLD_EASY_MS) return 3 // Good
  return 4 // Easy
}

/**
 * Computes interval previews for the rating screen.
 */
export function computeIntervalPreviews(progress: CardProgress, intensity: number): IntervalPreview[] {
  const retention = mapIntensityToRetention(intensity)
  const srsScheduler = fsrs({ enable_short_term: false, request_retention: retention })
  const currentCard = mapCardProgressToFSRSCard(progress)
  const results = srsScheduler.repeat(currentCard, new Date())
  
  return [
    { rating: 1, label: formatInterval(results[1].card.scheduled_days), color: 'text-error' },
    { rating: 2, label: formatInterval(results[2].card.scheduled_days), color: 'text-warning' },
    { rating: 3, label: formatInterval(results[3].card.scheduled_days), color: 'text-success' },
    { rating: 4, label: formatInterval(results[4].card.scheduled_days), color: 'text-primary' },
  ]
}