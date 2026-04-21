/**
 * challenge-logic.ts — Shared challenge/quadrant selection logic
 *
 * Extracted from useReviewSession.ts and useFreeStudySession.ts to eliminate DRY violation.
 * Both hooks previously defined their own selectQuadrant() inline — now shared here.
 */

import type { Word } from './types'
import type { CardProgress } from './srs'
import { shuffleArray } from './utils'

const HARD_CODED_DISTRACTORS = [
  'để nhớ lại điều gì đó',
  'học thuộc một cách có hệ thống',
  'ghi nhớ thông tin quan trọng',
  'tập trung chú ý vào điều gì',
  'hiểu rõ vấn đề cốt lõi',
  'áp dụng kiến thức vào thực tế',
  'phân tích tình huống cụ thể',
  'đánh giá kết quả công việc',
]

/**
 * Generates MC choice distractors based on the word definition.
 * If word has custom distractors (wrongChoices), priority is given to them.
 */
export function generateChoices(word: Word): string[] {
  const correct = word.definition
  
  // Use custom wrong choices if available
  if (word.wrongChoices && word.wrongChoices.length > 0) {
    const choices = [correct, ...word.wrongChoices.slice(0, 3)]
    return shuffleArray(choices)
  }

  // Fallback to hardcoded distractors
  const distractors = HARD_CODED_DISTRACTORS
    .filter(d => d !== correct)
    .slice(0, 3)
  return shuffleArray([correct, ...distractors])
}

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