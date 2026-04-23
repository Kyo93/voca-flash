import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useReviewSession } from '../../src/hooks/useReviewSession'
import * as storage from '../../src/lib/supabase-storage'
import * as srs from '../../src/lib/srs'

// Mock AuthContext
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ 
    user: { id: 'user-123' },
    profile: { srs_intensity: 1.0 }
  })
}))

// Mock Supabase storage
vi.mock('../../src/lib/supabase-storage', () => ({
  fetchReviewWords: vi.fn(),
  upsertSrsRecord: vi.fn().mockResolvedValue({})
}))

// Mock SRS logic
vi.mock('../../src/lib/srs', () => ({
  calculateFSRSReview: vi.fn().mockReturnValue({}),
  mapIntensityToRetention: vi.fn().mockReturnValue(0.9),
  State: { Learning: 1, Review: 2, Relearning: 3 }
}))

// Mock utils
vi.mock('../../src/lib/utils', () => ({
  shuffleArray: (arr: any[]) => [...arr]
}))

// Mock challenge logic
vi.mock('../../src/lib/challenge-logic', () => ({
  selectQuadrant: () => 'recognition',
  generateChoices: (word: any) => ['Choice 1', 'Choice 2', 'Choice 3', word.definition]
}))

describe('useReviewSession Learning Loop (TDD)', () => {
  const mockWords = [
    { word: { id: 'w1', word: 'Hello' }, progress: {}, choices: [] },
    { word: { id: 'w2', word: 'World' }, progress: {}, choices: [] }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(storage.fetchReviewWords).mockResolvedValue(mockWords as any)
  })

  it('appends failed words to the end of the queue', async () => {
    const { result } = renderHook(() => useReviewSession())
    
    // 1. Initialize
    await act(async () => {
      await result.current.initialize()
    })

    expect(result.current.totalCount).toBe(2)

    // 2. Fail the first word
    await act(async () => {
      await result.current.submitAnswer(false) // Fail w1
    })

    // EXPECTATION: Queue should grow to 3 (w2, then retry w1)
    expect(result.current.totalCount).toBe(3)
    expect(result.current.currentIndex).toBe(1) // Moved to w2
  })

  it('only calls upsertSrsRecord for the first attempt of each word', async () => {
    const { result } = renderHook(() => useReviewSession())
    
    await act(async () => {
      await result.current.initialize()
    })

    // Fail w1
    await act(async () => {
      await result.current.submitAnswer(false) 
    })
    
    expect(storage.upsertSrsRecord).toHaveBeenCalledTimes(1)

    // Move to w2 and succeed
    await act(async () => {
      await result.current.submitAnswer(true)
    })
    expect(storage.upsertSrsRecord).toHaveBeenCalledTimes(2)

    // Now w1 (retry) should be current
    await waitFor(() => expect(result.current.currentChallenge?.id).toBe('w1'))

    // Succeed on retry w1
    await act(async () => {
      await result.current.submitAnswer(true)
    })

    // EXPECTATION: upsertSrsRecord should NOT be called again for w1
    expect(storage.upsertSrsRecord).toHaveBeenCalledTimes(2) 
  })

  it('does not mark session as complete if the last word is failed', async () => {
    const { result } = renderHook(() => useReviewSession())
    
    await act(async () => {
      await result.current.initialize()
    })

    // Succeed w1
    await act(async () => {
      await result.current.submitAnswer(true)
    })
    expect(result.current.currentIndex).toBe(1)
    expect(result.current.isComplete).toBe(false)

    // Fail w2 (the last word)
    await act(async () => {
      await result.current.submitAnswer(false)
    })

    // EXPECTATION: currentIndex should be 2, but isComplete should still be false
    expect(result.current.currentIndex).toBe(2)
    expect(result.current.totalCount).toBe(3)
    expect(result.current.isComplete).toBe(false)
  })

  it('does NOT re-queue the word if it is skipped (gave up)', async () => {
    const { result } = renderHook(() => useReviewSession())
    
    await act(async () => {
      await result.current.initialize()
    })

    // Skip the first word (Hello)
    await act(async () => {
      // We expect submitAnswer to handle a second 'isSkipped' parameter
      await (result.current.submitAnswer as any)(false, true)
    })

    // Should NOT have re-queued 'Hello'
    // totalCount should stay at 2
    expect(result.current.totalCount).toBe(2)
    expect(result.current.currentIndex).toBe(1) // Moved to 'World'
    
    // Finish 'World' correctly
    await act(async () => {
      await result.current.submitAnswer(true)
    })

    // Session should be complete now, because Hello wasn't re-queued
    expect(result.current.isComplete).toBe(true)
  })
})
