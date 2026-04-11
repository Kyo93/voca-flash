import { describe, it, expect } from 'vitest'
import { calculateNextReview, createInitialProgress, getDueCards, type Card } from '../../src/lib/srs'

describe('SRS Algorithm', () => {
  it('createInitialProgress returns default values', () => {
    const progress = createInitialProgress('card-1')
    expect(progress.cardId).toBe('card-1')
    expect(progress.ease).toBe(2.5)
    expect(progress.interval).toBe(0)
    expect(progress.repetitions).toBe(0)
    expect(progress.nextReview).toBeLessThanOrEqual(Date.now())
  })

  it('calculateNextReview: Again (rating 0) resets repetitions', () => {
    const progress = createInitialProgress('card-1')
    const next = calculateNextReview(progress, 0)
    expect(next.repetitions).toBe(0)
    expect(next.interval).toBe(1)
  })

  it('calculateNextReview: Good (rating 3) increments interval', () => {
    const progress = { ...createInitialProgress('card-1'), repetitions: 1, interval: 6 }
    const next = calculateNextReview(progress, 3)
    expect(next.repetitions).toBe(2)
    expect(next.interval).toBeGreaterThanOrEqual(6)
  })

  it('getDueCards returns cards with past due date', () => {
    const cards: Card[] = [
      { id: '1', front: 'hello', back: 'xin chao', topic: 'daily', createdAt: Date.now() },
      { id: '2', front: 'world', back: 'the gioi', topic: 'daily', createdAt: Date.now() },
    ]
    const dueCards = getDueCards(cards, new Map())
    expect(dueCards.length).toBe(2)
  })

  it('ease never goes below 1.3', () => {
    const progress = { ...createInitialProgress('card-1'), ease: 1.4 }
    const next = calculateNextReview(progress, 0)
    expect(next.ease).toBeGreaterThanOrEqual(1.3)
  })
})
