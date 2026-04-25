/**
 * Bug: Sau khi học từ mới trong StudyPage, Dashboard "Nhiệm vụ hôm nay" vẫn 0/20.
 *
 * Root cause: useFlashcard.rate() gọi upsertSrsRecord() (cập nhật DB), nhưng
 * không trigger refreshInitialData(). useDashboard đọc
 * `initialData.health.new_today` được cache tại auth boot — không bao giờ
 * tự refresh, nên counter đứng yên cho đến khi reload trang.
 *
 * Behavior: Sau khi rate 1 card LẦN ĐẦU (state mới = Learning, reps = 1),
 * useFlashcard phải gọi refreshInitialData() để Dashboard sync với DB.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFlashcard } from '../../src/hooks/useFlashcard'

// Mock storage layer
vi.mock('../../src/lib/supabase-storage', () => ({
  fetchWords: vi.fn(async () => [
    { id: 'w1', front: 'apple', back: 'táo' },
    { id: 'w2', front: 'banana', back: 'chuối' },
  ]),
  fetchSrsStates: vi.fn(async () => new Map()),
  upsertSrsRecord: vi.fn(async () => {}),
  applyUserRewardGain: vi.fn(async () => ({})),
  recordStreak: vi.fn(async () => {}),
  saveResumePointer: vi.fn(async () => {}),
}))

// Mock auth context
const refreshInitialDataMock = vi.fn(async () => {})
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    profile: { daily_target: 20, srs_intensity: 1.0 },
    refreshActiveRoadmap: vi.fn(async () => {}),
    refreshInitialData: refreshInitialDataMock,
  }),
}))

describe('useFlashcard.rate — refreshes initialData after first-time learn', () => {
  beforeEach(() => {
    refreshInitialDataMock.mockClear()
  })

  it('calls refreshInitialData after successfully rating a never-seen card', async () => {
    const { result } = renderHook(() => useFlashcard())

    await act(async () => {
      await result.current.initialize('topic-x')
    })
    await act(async () => {
      await result.current.startSession(undefined, 'topic-x', false)
    })

    // Rate both cards to complete the session and trigger refresh
    await act(async () => {
      await result.current.rate(3)
    })
    await act(async () => {
      await result.current.rate(3)
    })

    // Allow background promises (upsert + refresh) to flush
    await act(async () => {
      await new Promise(r => setTimeout(r, 100))
    })

    expect(refreshInitialDataMock).toHaveBeenCalledTimes(1)
  })
})
