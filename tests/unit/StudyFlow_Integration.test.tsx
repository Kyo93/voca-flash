import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFlashcard } from '../../src/hooks/useFlashcard'
import * as storage from '../../src/lib/supabase-storage'

// Mock storage layer
vi.mock('../../src/lib/supabase-storage', () => ({
  fetchWords: vi.fn(),
  fetchSrsStates: vi.fn(),
  upsertSrsRecord: vi.fn(async () => ({})),
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

describe('Study Flow Integration — Transitions & Modes', () => {
  const mockCards = [
    { id: 'w1', front: 'apple', back: 'táo' },
    { id: 'w2', front: 'banana', back: 'chuối' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (storage.fetchWords as any).mockResolvedValue([...mockCards]);
  });

  it('correctly transitions unlearned word to learning and respects selection modes', async () => {
    // 1. Initial Entry — Both cards are unlearned
    (storage.fetchSrsStates as any).mockResolvedValue(new Map());
    
    const { result } = renderHook(() => useFlashcard());

    await act(async () => {
      await result.current.initialize('topic-1');
    });

    expect(result.current.prepStats?.unlearned).toHaveLength(2);
    expect(result.current.prepStats?.learning).toHaveLength(0);

    // 2. Start session with "new_only" mode (simulated)
    // Currently startSession(roadmapId, topicId, includeMastered)
    // We want to change it to startSession(roadmapId, topicId, mode: 'new' | 'combined' | 'all')
    await act(async () => {
      // @ts-ignore - testing future API
      await result.current.startSession('r1', 't1', 'new');
    });

    // If "new" mode worked, queue should be 2 (both are new)
    expect(result.current.queue).toHaveLength(2);

    // 3. Learn 1 word (apple)
    await act(async () => {
      await result.current.rate(3); // GOOD
    });

    // 4. Simulate Re-entry — One card should now be in "learning"
    // We mock fetchSrsStates to return the new state
    const progressMapAfterRate = new Map();
    progressMapAfterRate.set('w1', { 
      word_id: 'w1', 
      stability: 1.0, 
      difficulty: 5.0, 
      elapsed_days: 0, 
      scheduled_days: 1, 
      reps: 1, 
      lapses: 0, 
      state: 1, // Learning
      last_review: new Date().toISOString() 
    });
    (storage.fetchSrsStates as any).mockResolvedValue(progressMapAfterRate);

    await act(async () => {
      await result.current.initialize('topic-1');
    });

    expect(result.current.prepStats?.unlearned).toHaveLength(1);
    expect(result.current.prepStats?.learning).toHaveLength(1);

    // 5. TEST CHOICE: Only New
    await act(async () => {
      // @ts-ignore
      await result.current.startSession('r1', 't1', 'new');
    });
    // Should ONLY load 'banana' (the unlearned one)
    expect(result.current.queue).toHaveLength(1);
    expect(result.current.queue[0].id).toBe('w2');

    // 6. TEST CHOICE: Combined (New + Learning)
    await act(async () => {
      await result.current.initialize('topic-1');
    });
    await act(async () => {
      // @ts-ignore
      await result.current.startSession('r1', 't1', 'combined');
    });
    // Should load both 'banana' (new) and 'apple' (learning)
    expect(result.current.queue).toHaveLength(2);
  });
});
