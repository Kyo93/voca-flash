// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applyUserRewardGain, fetchRewardProgress } from '../../src/lib/storage/rewards'

const supabaseMocks = vi.hoisted(() => ({
  eq: vi.fn(),
  from: vi.fn(),
  maybeSingle: vi.fn(),
  rpc: vi.fn(),
  select: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: supabaseMocks.from,
    rpc: supabaseMocks.rpc,
  },
}))

function fallbackKey(userId: string): string {
  return `voca-flash-rewards:${userId}`
}

function mockRewardFetchFailure() {
  supabaseMocks.maybeSingle.mockResolvedValue({
    data: null,
    error: { message: 'offline' },
  })
  supabaseMocks.eq.mockReturnValue({ maybeSingle: supabaseMocks.maybeSingle })
  supabaseMocks.select.mockReturnValue({ eq: supabaseMocks.eq })
  supabaseMocks.from.mockReturnValue({ select: supabaseMocks.select })
}

function mockRewardMutationFailure() {
  supabaseMocks.rpc.mockResolvedValue({
    data: null,
    error: { message: 'offline' },
  })
}

describe('reward storage fallback', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    mockRewardFetchFailure()
    mockRewardMutationFailure()
  })

  it('ignores malformed localStorage fallback data instead of casting it through', async () => {
    const userId = 'malformed-user'
    window.localStorage.setItem(fallbackKey(userId), JSON.stringify({}))

    const progress = await fetchRewardProgress(userId)

    expect(progress.userId).toBe(userId)
    expect(progress.totalXp).toBe(0)
    expect(progress.availableXp).toBe(0)
    expect(progress.selectedCharacterId).toBeNull()
    expect(window.localStorage.getItem(fallbackKey(userId))).toBeNull()
  })

  it('sanitizes fallback reward progress values', async () => {
    const userId = 'sanitize-user'
    window.localStorage.setItem(fallbackKey(userId), JSON.stringify({
      userId: 'other-user',
      totalXp: 12.9,
      studyXp: -4,
      reviewXp: 'bad',
      spentXp: 99,
      arenaSessions: 2.8,
      selectedCharacterId: 42,
      updatedAt: false,
    }))

    const progress = await fetchRewardProgress(userId)

    expect(progress.userId).toBe(userId)
    expect(progress.totalXp).toBe(12)
    expect(progress.studyXp).toBe(0)
    expect(progress.reviewXp).toBe(0)
    expect(progress.spentXp).toBe(12)
    expect(progress.availableXp).toBe(0)
    expect(progress.arenaSessions).toBe(2)
    expect(progress.selectedCharacterId).toBeNull()
    expect(progress.updatedAt).toBeNull()
  })

  it('saves sanitized fallback progress after offline reward gains', async () => {
    const userId = 'gain-user'
    window.localStorage.setItem(fallbackKey(userId), JSON.stringify({
      userId,
      totalXp: 'bad',
      studyXp: 1.9,
      reviewXp: -10,
      spentXp: 0,
      arenaSessions: 0,
    }))

    const progress = await applyUserRewardGain(userId, {
      source: 'study',
      reason: 'new_word',
      xp: 15,
    })

    expect(progress.totalXp).toBe(15)
    expect(progress.studyXp).toBe(16)
    expect(progress.reviewXp).toBe(0)
    expect(JSON.parse(window.localStorage.getItem(fallbackKey(userId)) ?? '{}')).toMatchObject({
      userId,
      totalXp: 15,
      studyXp: 16,
      reviewXp: 0,
      spentXp: 0,
      arenaSessions: 0,
      selectedCharacterId: null,
      updatedAt: expect.any(String),
    })
  })
})
