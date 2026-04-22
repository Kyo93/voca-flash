import { describe, it, expect, vi, beforeEach } from 'vitest'
import { upsertSrsRecord } from '../../src/lib/storage/session'
import { supabase } from '../../src/lib/supabase'

// Mock Supabase
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(() => ({
      data: null,
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    }))
  }
}))

describe('upsertSrsRecord - Scheduling Logic (V2 RPC)', () => {
  const userId = 'user-123'
  const cardId = 'card-123'
  const futureDate = new Date('2026-04-30T10:00:00Z').getTime()
  const lastReview = new Date('2026-04-20T10:00:00Z').getTime()

  const mockProgress = {
    cardId,
    stability: 5.0,
    difficulty: 0.3,
    state: 2,
    reps: 5,
    lapses: 0,
    scheduledDays: 5,
    due: futureDate,
    lastReview: lastReview
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('RED: should pass correctly calculated due date and last reviewed to RPC', async () => {
    const rpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValue({ 
      data: null, 
      error: null, 
      count: null, 
      status: 200, 
      statusText: 'OK' 
    } as any)

    // Provide default 0 values for rating and duration inside mockProgress
    await upsertSrsRecord(userId, cardId, { ...mockProgress, rating: 0, duration: 0 })

    // Ensure rpc was called
    expect(rpcSpy).toHaveBeenCalled()

    const rpcArgs = rpcSpy.mock.calls[0]
    expect(rpcArgs[0]).toBe('upsert_srs_record_v2')

    const rpcPayload = rpcArgs[1] as any
    
    // Assert scheduling logic
    expect(new Date(rpcPayload.p_next_review_at).getTime()).toBe(futureDate)
    expect(new Date(rpcPayload.p_last_reviewed).getTime()).toBe(lastReview)
  })
})
