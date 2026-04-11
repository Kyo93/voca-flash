export interface Card {
  id: string
  front: string       // English word
  back: string        // Vietnamese meaning
  example?: string    // Example sentence
  example_vi?: string // Vietnamese translation of the example
  topic: string       // Topic category
  createdAt: number
}

export interface CardProgress {
  cardId: string
  ease: number        // SM-2 ease factor (default 2.5)
  interval: number     // Days until next review
  repetitions: number  // Successful reviews in a row
  nextReview: number   // Timestamp of next review
  lastReview: number  // Last review timestamp
}

export type Rating = 0 | 1 | 2 | 3 | 4 | 5

/**
 * SM-2 Spaced Repetition Algorithm
 * Quality: 0=Again, 1=Hard(hard), 2=Good, 3=Easy
 * Maps to SM-2 quality scale: 0→1, 1→2, 2→3, 3→5
 */
export function calculateNextReview(
  progress: CardProgress,
  rating: Rating
): CardProgress {
  const q = Math.max(1, Math.min(5, Math.round((rating / 5) * 5)))

  let { ease, interval, repetitions } = progress

  if (q < 3) {
    // Failed — reset
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * ease)
    }
    repetitions += 1
  }

  ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))

  const now = Date.now()
  return {
    ...progress,
    cardId: progress.cardId,
    ease,
    interval,
    repetitions,
    nextReview: now + interval * 24 * 60 * 60 * 1000,
    lastReview: now,
  }
}

export function getDueCards(cards: Card[], progressMap: Map<string, CardProgress>): Card[] {
  const now = Date.now()
  return cards.filter(card => {
    const p = progressMap.get(card.id)
    return !p || p.nextReview <= now
  })
}

export function createInitialProgress(cardId: string): CardProgress {
  return {
    cardId,
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: Date.now(),
    lastReview: 0,
  }
}