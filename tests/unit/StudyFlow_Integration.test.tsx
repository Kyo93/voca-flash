import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFlashcard } from '../../src/hooks/useFlashcard'
import * as storage from '../../src/lib/supabase-storage'
import type { Card, CardProgress } from '../../src/lib/srs'

vi.mock('../../src/lib/supabase-storage', () => ({
  fetchWords: vi.fn(),
  fetchSrsStates: vi.fn(),
  upsertSrsRecord: vi.fn(async () => ({})),
  applyUserRewardGain: vi.fn(async () => ({})),
  recordStreak: vi.fn(async () => {}),
  saveResumePointer: vi.fn(async () => {}),
}))

const refreshInitialDataMock = vi.fn(async () => {})
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    profile: { daily_target: 20, srs_intensity: 1.0 },
    refreshActiveRoadmap: vi.fn(async () => {}),
    refreshInitialData: refreshInitialDataMock,
  }),
}))

describe('Study Flow Integration - Transitions & Modes', () => {
  const mockCards: Card[] = [
    { id: 'w1', front: 'apple', back: 'tÃ¡o', topic: 'topic-1', createdAt: 0 },
    { id: 'w2', front: 'banana', back: 'chuá»‘i', topic: 'topic-1', createdAt: 0 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(storage.fetchWords).mockResolvedValue([...mockCards])
  })

  it('correctly transitions unlearned word to learning and respects selection modes', async () => {
    vi.mocked(storage.fetchSrsStates).mockResolvedValue(new Map())

    const { result } = renderHook(() => useFlashcard())

    await act(async () => {
      await result.current.initialize('topic-1')
    })

    expect(result.current.prepStats?.unlearned).toHaveLength(2)
    expect(result.current.prepStats?.learning).toHaveLength(0)

    await act(async () => {
      await result.current.startSession('r1', 't1', 'new')
    })

    expect(result.current.queue).toHaveLength(2)

    await act(async () => {
      await result.current.rate(3)
    })

    const progressMapAfterRate = new Map<string, CardProgress>()
    progressMapAfterRate.set('w1', {
      cardId: 'w1',
      stability: 1.0,
      difficulty: 5.0,
      state: 1,
      reps: 1,
      lapses: 0,
      scheduledDays: 1,
      due: Date.now(),
      lastReview: Date.now(),
    })
    vi.mocked(storage.fetchSrsStates).mockResolvedValue(progressMapAfterRate)

    await act(async () => {
      await result.current.initialize('topic-1')
    })

    expect(result.current.prepStats?.unlearned).toHaveLength(1)
    expect(result.current.prepStats?.learning).toHaveLength(1)

    await act(async () => {
      await result.current.startSession('r1', 't1', 'new')
    })

    expect(result.current.queue).toHaveLength(1)
    expect(result.current.queue[0].id).toBe('w2')

    await act(async () => {
      await result.current.initialize('topic-1')
    })

    await act(async () => {
      await result.current.startSession('r1', 't1', 'combined')
    })

    expect(result.current.queue).toHaveLength(2)
  })
})
