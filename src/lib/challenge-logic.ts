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
 * Unified quadrant selector.
 * Supports two call signatures:
 *   (card: ChallengeCard)  — for useReviewSession (backward compat)
 *   (stability, hasExample, hasChoices?) — for useFreeStudySession
 */
export function selectQuadrant(
  cardOrStability: ChallengeCard | number,
  hasExample?: boolean,
  hasChoices?: boolean,
): QuadrantType {
  let stability: number
  let example: boolean
  let choicesAvailable: boolean

  if (typeof cardOrStability === 'number') {
    stability = cardOrStability
    example = hasExample ?? false
    choicesAvailable = hasChoices ?? false
  } else {
    stability = cardOrStability.progress?.stability ?? 0
    example = !!cardOrStability.word?.example
    choicesAvailable = (cardOrStability.choices?.length ?? 0) >= 3
  }

  if (stability < 3) {
    const options: QuadrantType[] = ['construction']
    if (choicesAvailable) options.push('recognition')
    if (example) options.push('context_gap')
    return options[Math.floor(Math.random() * options.length)]
  } else if (stability < 14) {
    const options: QuadrantType[] = ['construction', 'phonetics']
    if (example) options.push('context_gap')
    return options[Math.floor(Math.random() * options.length)]
  } else {
    if (example && Math.random() > 0.5) return 'usage_master'
    return 'ghost_recall'
  }
}