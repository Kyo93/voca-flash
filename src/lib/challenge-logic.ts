/**
 * challenge-logic.ts — Shared challenge/quadrant selection logic
 *
 * Extracted from useReviewSession.ts and useFreeStudySession.ts to eliminate DRY violation.
 * Both hooks previously defined their own selectQuadrant() inline — now shared here.
 */

import type { Word } from './types'
import type { CardProgress } from './srs'

export type QuadrantType =
  | 'recognition'
  | 'phonetics'
  | 'context_gap'
  | 'construction'
  | 'usage_master'
  | 'ghost_recall'

export interface ChallengeCard {
  word: {
    example: string | null
  }
  progress: {
    stability: number
  }
  choices: string[]
}

export interface ReviewChallenge {
  id: string
  word: Word
  progress: CardProgress
  choices: string[]
  quadrant: QuadrantType
}

/**
 * Adaptive Quadrant Selection
 * Chooses the hardest appropriate challenge for the word's current mastery level.
 *
 * Based on FSRS stability (days):
 *   < 3  days → Beginner: Recognition, Construction, or Context Gap
 *   < 14 days → Intermediate: Phonetics, Construction, or Context Gap
 *   ≥ 14 days → Advanced: Ghost Recall or Usage Master
 */
export function selectQuadrant(card: ChallengeCard): QuadrantType {
  const { progress, word, choices } = card
  const hasExample = !!word.example
  const hasChoices = choices.length >= 3

  if (progress.stability < 3) {
    // Beginner
    const options: QuadrantType[] = ['construction']
    if (hasChoices) options.push('recognition')
    if (hasExample) options.push('context_gap')
    return options[Math.floor(Math.random() * options.length)]
  } else if (progress.stability < 14) {
    // Intermediate
    const options: QuadrantType[] = ['construction', 'phonetics']
    if (hasExample) options.push('context_gap')
    return options[Math.floor(Math.random() * options.length)]
  } else {
    // Advanced
    if (hasExample && Math.random() > 0.5) return 'usage_master'
    return 'ghost_recall'
  }
}

/**
 * Select quadrant for free study — simplified version used in useFreeStudySession.
 * Uses MasteryWord shape (stability from fsrs_stability field).
 */
export function selectQuadrantFreeStudy(
  fsrsStability: number,
  hasExample: boolean
): QuadrantType {
  if (fsrsStability < 3) {
    const options: QuadrantType[] = ['construction', 'recognition']
    if (hasExample) options.push('context_gap')
    return options[Math.floor(Math.random() * options.length)]
  } else if (fsrsStability < 14) {
    const options: QuadrantType[] = ['construction', 'phonetics']
    if (hasExample) options.push('context_gap')
    return options[Math.floor(Math.random() * options.length)]
  } else {
    if (hasExample && Math.random() > 0.5) return 'usage_master'
    return 'ghost_recall'
  }
}