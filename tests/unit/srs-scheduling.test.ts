import { describe, it, expect, vi, beforeEach } from 'vitest'
import { upsertSrsRecord } from '../../src/lib/storage/session'
import { supabase } from '../../src/lib/supabase'

// Mock Supabase
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn()
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null
        }))
      })),
      upsert: vi.fn(() => ({
        error: null
      }))
    })),
    rpc: vi.fn(() => ({
      error: null
    }))
  }
}))

describe('upsertSrsRecord - Scheduling Logic', () => {
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

  it('RED: should use correctly calculated due date instead of current time (Update path)', async () => {
    // Mock existing record
    const fromSpy = vi.spyOn(supabase, 'from')
    const selectMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'rec-1', lapse_count: 0 } })
    }
    fromSpy.mockReturnValue(selectMock as any)

    const updateSpy = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    fromSpy.mockImplementation((table: string) => {
      if (table === 'user_srs_records') {
        return {
          ...selectMock,
          update: updateSpy
        } as any
      }
      return {} as any
    })

    await upsertSrsRecord(userId, cardId, mockProgress)

    // Capture the arguments sent to .update()
    const updateCall = updateSpy.mock.calls[0][0]
    
    // THIS IS THE FAILING ASSERTION
    // Currently, next_review_at is hardcoded to 'now'
    expect(new Date(updateCall.next_review_at).getTime()).toBe(futureDate)
    expect(new Date(updateCall.last_reviewed).getTime()).toBe(lastReview)
  })

  it('RED: should use correctly calculated due date instead of current time (Insert path)', async () => {
    // Mock NO existing record
    const fromSpy = vi.spyOn(supabase, 'from')
    const selectMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null })
    }
    fromSpy.mockReturnValue(selectMock as any)

    const rpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValue({ error: null })

    await upsertSrsRecord(userId, cardId, mockProgress)

    const rpcPayload = rpcSpy.mock.calls[0][1]
    
    // THIS IS THE FAILING ASSERTION
    expect(new Date(rpcPayload.p_next_review_at).getTime()).toBe(futureDate)
    expect(new Date(rpcPayload.p_last_reviewed).getTime()).toBe(lastReview)
  })
})
