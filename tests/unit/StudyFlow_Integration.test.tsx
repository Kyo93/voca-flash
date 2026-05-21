import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFlashcard } from '../../src/hooks/useFlashcard'
import * as storage from '../../src/lib/supabase-storage'
import type { Card } from '../../src/lib/srs'

vi.mock('../../src/lib/supabase-storage', () => ({
  fetchStudyPrepData: vi.fn(),
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

  it('loads Study Prep from scoped RPC data instead of all user SRS records', async () => {
    vi.mocked(storage.fetchStudyPrepData).mockResolvedValue({
      unlearned: [...mockCards],
      learning: [],
      mastered: [],
    })
    vi.mocked(storage.fetchSrsStates).mockResolvedValue(new Map())

    const { result } = renderHook(() => useFlashcard())

    await act(async () => {
      await result.current.initialize('topic-1')
    })

    expect(result.current.prepStats?.unlearned).toHaveLength(2)
    expect(result.current.prepStats?.learning).toHaveLength(0)
    expect(storage.fetchStudyPrepData).toHaveBeenCalledWith('user-1', 'topic-1')
    expect(storage.fetchSrsStates).not.toHaveBeenCalled()
    expect(storage.fetchWords).not.toHaveBeenCalled()

    await act(async () => {
      await result.current.startSession('r1', 't1', 'new')
    })

    expect(result.current.queue).toHaveLength(2)

    await act(async () => {
      await result.current.rate(3)
    })

    vi.mocked(storage.fetchStudyPrepData).mockResolvedValue({
      unlearned: [mockCards[1]],
      learning: [mockCards[0]],
      mastered: [],
    })

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
