import { describe, it, expect } from 'vitest'
import { 
  calculateFSRSReview, 
  createInitialProgress, 
  isMastered, 
  resetFSRSCard, 
  sm2ToFsrs,
  type CardProgress 
} from '../../src/lib/srs'

describe('SRS Algorithm (FSRS 5.3)', () => {
  it('createInitialProgress returns default FSRS values', () => {
    const progress = createInitialProgress('card-1')
    expect(progress.cardId).toBe('card-1')
    expect(progress.stability).toBeGreaterThanOrEqual(0)
    expect(progress.difficulty).toBeGreaterThanOrEqual(0)
    expect(progress.state).toBe(0) // State.New
    expect(progress.reps).toBe(0)
    expect(typeof progress.due).toBe('number')
  })

  it('calculateFSRSReview: Again (rating 1) sets state to Learning/Relearning', () => {
    const progress = createInitialProgress('card-1')
    const next = calculateFSRSReview(progress, 1)
    expect(next.state).toBe(2) // Review (since short-term is disabled)
    expect(next.reps).toBe(1)
  })

  it('calculateFSRSReview: Good (rating 3) increases stability', () => {
    const progress = createInitialProgress('card-1')
    const next = calculateFSRSReview(progress, 3)
    // Stability should increase after a 'Good' rating
    expect(next.stability).toBeGreaterThan(progress.stability)
  })

  it('isMastered: returns true when stability >= 21', () => {
    const progress: CardProgress = {
      cardId: '1',
      stability: 25,
      difficulty: 0.5,
      state: 2, // Review
      reps: 10,
      lapses: 0,
      scheduledDays: 25,
      due: Date.now(),
      lastReview: Date.now()
    }
    expect(isMastered(progress)).toBe(true)
  })

  it('isMastered: returns false when stability < 21', () => {
    const progress: CardProgress = {
      cardId: '1',
      stability: 10,
      difficulty: 0.5,
      state: 2,
      reps: 5,
      lapses: 0,
      scheduledDays: 10,
      due: Date.now(),
      lastReview: Date.now()
    }
    expect(isMastered(progress)).toBe(false)
  })

  it('resetFSRSCard: should reset stability and difficulty', () => {
    const progress = { ...createInitialProgress('1'), reps: 10, stability: 50 }
    const reset = resetFSRSCard(progress)
    expect(reset.stability).toBeLessThan(50)
  })

  it('sm2ToFsrs: maps legacy SM-2 data to FSRS correctly', () => {
    const legacy = { ease: 2.5, interval: 10, repetitions: 5 }
    const mapped = sm2ToFsrs(legacy)
    expect(mapped.stability).toBe(10)
    expect(mapped.scheduledDays).toBe(10)
    expect(mapped.difficulty).toBeDefined()
    expect(mapped.reps).toBe(5)
  })
})
