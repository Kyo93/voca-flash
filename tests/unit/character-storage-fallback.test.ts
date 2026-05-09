// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CHARACTER_ID } from '../../src/lib/characters'
import { createEmptyRewardProgress, toRewardProgressView } from '../../src/lib/rewards'
import {
  evolveUserCharacter,
  fetchCharacterCollection,
  selectUserCharacter,
  unlockUserCharacter,
} from '../../src/lib/storage/characters'
import { fetchRewardProgress } from '../../src/lib/storage/rewards'

const supabaseMocks = vi.hoisted(() => ({
  eq: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
  select: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: supabaseMocks.from,
    rpc: supabaseMocks.rpc,
  },
}))

vi.mock('../../src/lib/storage/rewards', () => ({
  fetchRewardProgress: vi.fn(),
}))

const userId = 'user-1'
const fallbackKey = `voca-flash-characters:${userId}`

function mockUnlockFetchFailure() {
  supabaseMocks.eq.mockResolvedValue({
    data: null,
    error: { message: 'offline' },
  })
  supabaseMocks.select.mockReturnValue({ eq: supabaseMocks.eq })
  supabaseMocks.from.mockReturnValue({ select: supabaseMocks.select })
}

function mockMutationFailure() {
  supabaseMocks.rpc.mockResolvedValue({
    data: null,
    error: { message: 'offline' },
  })
}

function mockRewardProgress(totalXp: number) {
  vi.mocked(fetchRewardProgress).mockResolvedValue(
    toRewardProgressView({
      ...createEmptyRewardProgress(userId),
      totalXp,
    }),
  )
}

describe('character storage fallback', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    mockUnlockFetchFailure()
    mockMutationFailure()
    mockRewardProgress(0)
  })

  it('ignores corrupt localStorage fallback data instead of crashing', async () => {
    window.localStorage.setItem(fallbackKey, JSON.stringify({}))

    const collection = await fetchCharacterCollection(userId)

    expect(collection.unlockedCharacterIds).toEqual([DEFAULT_CHARACTER_ID])
    expect(collection.unlockedCharacterStates).toEqual([
      { characterId: DEFAULT_CHARACTER_ID, currentStage: 1, evolutionSpentXp: 0 },
    ])
    expect(collection.selectedCharacterId).toBe(DEFAULT_CHARACTER_ID)
    expect(window.localStorage.getItem(fallbackKey)).toBeNull()
  })

  it('migrates legacy fallback ids into unlock states', async () => {
    window.localStorage.setItem(fallbackKey, JSON.stringify({
      unlockedCharacterIds: ['arcane_brawler'],
      selectedCharacterId: 'arcane_brawler',
    }))

    const collection = await fetchCharacterCollection(userId)

    expect(collection.unlockedCharacterIds).toEqual([DEFAULT_CHARACTER_ID, 'arcane_brawler'])
    expect(collection.unlockedCharacterStates).toEqual([
      { characterId: DEFAULT_CHARACTER_ID, currentStage: 1, evolutionSpentXp: 0 },
      { characterId: 'arcane_brawler', currentStage: 1, evolutionSpentXp: 0 },
    ])
    expect(collection.selectedCharacterId).toBe('arcane_brawler')
  })

  it('sanitizes malformed fallback unlock states', async () => {
    window.localStorage.setItem(fallbackKey, JSON.stringify({
      unlockedCharacterIds: ['arcane_brawler', 42, ''],
      unlockedCharacterStates: [
        { characterId: 'arcane_brawler', currentStage: 3.8, evolutionSpentXp: 25.9 },
        { characterId: '', currentStage: 2, evolutionSpentXp: 5 },
        { characterId: 'playful_dog', currentStage: -2, evolutionSpentXp: -20 },
      ],
      selectedCharacterId: 'unknown_character',
    }))

    const collection = await fetchCharacterCollection(userId)

    expect(collection.unlockedCharacterIds).toEqual([
      DEFAULT_CHARACTER_ID,
      'arcane_brawler',
      'playful_dog',
    ])
    expect(collection.unlockedCharacterStates).toEqual([
      { characterId: DEFAULT_CHARACTER_ID, currentStage: 1, evolutionSpentXp: 0 },
      { characterId: 'arcane_brawler', currentStage: 3, evolutionSpentXp: 25 },
      { characterId: 'playful_dog', currentStage: 1, evolutionSpentXp: 0 },
    ])
    expect(collection.selectedCharacterId).toBe(DEFAULT_CHARACTER_ID)
  })

  it('does not unlock a character locally when the unlock RPC fails', async () => {
    mockRewardProgress(500)

    const collection = await unlockUserCharacter(userId, 'arcane_brawler', 120)

    expect(collection.unlockedCharacterIds).toEqual([DEFAULT_CHARACTER_ID])
    expect(collection.unlockedCharacterStates).toEqual([
      { characterId: DEFAULT_CHARACTER_ID, currentStage: 1, evolutionSpentXp: 0 },
    ])
    expect(collection.rewardProgress.spentXp).toBe(0)
    expect(window.localStorage.getItem(fallbackKey)).toBeNull()
  })

  it('does not evolve a character locally when the evolve RPC fails', async () => {
    mockRewardProgress(500)
    window.localStorage.setItem(fallbackKey, JSON.stringify({
      unlockedCharacterIds: [DEFAULT_CHARACTER_ID, 'arcane_brawler'],
      unlockedCharacterStates: [
        { characterId: DEFAULT_CHARACTER_ID, currentStage: 1, evolutionSpentXp: 0 },
        { characterId: 'arcane_brawler', currentStage: 1, evolutionSpentXp: 0 },
      ],
      selectedCharacterId: 'arcane_brawler',
    }))

    const collection = await evolveUserCharacter(userId, 'arcane_brawler', 2, 100)

    expect(collection.unlockedCharacterStates).toEqual([
      { characterId: DEFAULT_CHARACTER_ID, currentStage: 1, evolutionSpentXp: 0 },
      { characterId: 'arcane_brawler', currentStage: 1, evolutionSpentXp: 0 },
    ])
    expect(collection.rewardProgress.spentXp).toBe(0)
    expect(JSON.parse(window.localStorage.getItem(fallbackKey) ?? '{}')).toMatchObject({
      selectedCharacterId: 'arcane_brawler',
      unlockedCharacterStates: [
        { characterId: DEFAULT_CHARACTER_ID, currentStage: 1, evolutionSpentXp: 0 },
        { characterId: 'arcane_brawler', currentStage: 1, evolutionSpentXp: 0 },
      ],
    })
  })

  it('does not select a character locally when the select RPC fails', async () => {
    window.localStorage.setItem(fallbackKey, JSON.stringify({
      unlockedCharacterIds: [DEFAULT_CHARACTER_ID, 'arcane_brawler'],
      unlockedCharacterStates: [
        { characterId: DEFAULT_CHARACTER_ID, currentStage: 1, evolutionSpentXp: 0 },
        { characterId: 'arcane_brawler', currentStage: 1, evolutionSpentXp: 0 },
      ],
      selectedCharacterId: DEFAULT_CHARACTER_ID,
    }))

    const collection = await selectUserCharacter(userId, 'arcane_brawler')

    expect(collection.selectedCharacterId).toBe(DEFAULT_CHARACTER_ID)
    expect(JSON.parse(window.localStorage.getItem(fallbackKey) ?? '{}')).toMatchObject({
      selectedCharacterId: DEFAULT_CHARACTER_ID,
    })
  })
})
