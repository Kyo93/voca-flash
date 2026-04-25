import { describe, expect, it } from 'vitest'
import {
  CHARACTER_CATALOG,
  DEFAULT_CHARACTER_ID,
  buildCharacterCollection,
  getCharacterById,
  getNextCharacterStage,
} from '../../src/lib/characters'
import { createEmptyRewardProgress, toRewardProgressView } from '../../src/lib/rewards'

function rewardProgress(totalXp: number, spentXp = 0) {
  return toRewardProgressView({
    ...createEmptyRewardProgress('user-1'),
    totalXp,
    spentXp,
  })
}

describe('character collection domain', () => {
  it('has a free default character for every learner', () => {
    const defaultCharacter = getCharacterById(DEFAULT_CHARACTER_ID)

    expect(defaultCharacter).toBeDefined()
    expect(defaultCharacter?.costXp).toBe(0)
  })

  it('derives unlocked, selected, and affordable states from reward progress', () => {
    const collection = buildCharacterCollection({
      rewardProgress: rewardProgress(260),
      unlockedCharacterIds: [DEFAULT_CHARACTER_ID],
      selectedCharacterId: DEFAULT_CHARACTER_ID,
    })

    const defaultItem = collection.items.find(item => item.character.id === DEFAULT_CHARACTER_ID)
    const affordableLockedItem = collection.items.find(item => !item.unlocked && item.affordable)

    expect(collection.availableXp).toBe(260)
    expect(defaultItem?.unlocked).toBe(true)
    expect(defaultItem?.selected).toBe(true)
    expect(affordableLockedItem).toBeDefined()
  })

  it('does not make lifetime level regress after XP is spent', () => {
    const collection = buildCharacterCollection({
      rewardProgress: rewardProgress(500, 250),
      unlockedCharacterIds: [DEFAULT_CHARACTER_ID, 'memory_archivist'],
      selectedCharacterId: 'memory_archivist',
    })

    expect(collection.totalXp).toBe(500)
    expect(collection.spentXp).toBe(250)
    expect(collection.availableXp).toBe(250)
    expect(collection.selectedCharacter?.id).toBe('memory_archivist')
  })

  it('includes the quiz alchemist as a rare four-stage recall character', () => {
    const character = getCharacterById('quiz_alchemist')

    expect(character).toBeDefined()
    expect(character?.rarity).toBe('rare')
    expect(character?.costXp).toBe(0)
    expect(character?.evolutionStages).toHaveLength(4)
    expect(character?.nameKey).toBe('characters.items.quiz_alchemist.name')
  })

  it('includes the arcane brawler as a rare four-stage OBJ-backed character', () => {
    const character = getCharacterById('arcane_brawler')

    expect(character).toBeDefined()
    expect(character?.rarity).toBe('rare')
    expect(character?.costXp).toBe(0)
    expect(character?.evolutionStages).toHaveLength(4)
    expect(character?.nameKey).toBe('characters.items.arcane_brawler.name')
  })

  it('includes the sunlit scholar as a rare four-stage OBJ-backed character', () => {
    const character = getCharacterById('sunlit_scholar')

    expect(character).toBeDefined()
    expect(character?.rarity).toBe('rare')
    expect(character?.costXp).toBe(0)
    expect(character?.evolutionStages).toHaveLength(4)
    expect(character?.nameKey).toBe('characters.items.sunlit_scholar.name')
  })

  it('does not include removed flashcard fighter or lexical invoker characters', () => {
    expect(getCharacterById('flashcard_fighter')).toBeNull()
    expect(getCharacterById('lexical_invoker')).toBeNull()
    expect(CHARACTER_CATALOG.map(character => character.id)).not.toContain('flashcard_fighter')
    expect(CHARACTER_CATALOG.map(character => character.id)).not.toContain('lexical_invoker')
  })

  it('falls back to the default character when selected id is unavailable', () => {
    const collection = buildCharacterCollection({
      rewardProgress: rewardProgress(0),
      unlockedCharacterIds: [],
      selectedCharacterId: 'missing-character',
    })

    expect(collection.selectedCharacter?.id).toBe(DEFAULT_CHARACTER_ID)
    expect(collection.items).toHaveLength(CHARACTER_CATALOG.length)
  })

  it('defines evolution stages for every character based on rarity', () => {
    for (const character of CHARACTER_CATALOG) {
      const expectedStages = character.rarity === 'rare' || character.rarity === 'epic' ? 4 : 3

      expect(character.evolutionStages).toHaveLength(expectedStages)
      expect(character.evolutionStages[0].stage).toBe(1)
      expect(character.evolutionStages[0].costXp).toBe(0)
    }
  })

  it('derives current and next evolution stages for unlocked characters', () => {
    const collection = buildCharacterCollection({
      rewardProgress: rewardProgress(900, 450),
      unlockedCharacterIds: [DEFAULT_CHARACTER_ID, 'memory_archivist'],
      unlockedCharacterStates: [
        { characterId: 'memory_archivist', currentStage: 2, evolutionSpentXp: 180 },
      ],
      selectedCharacterId: 'memory_archivist',
    })

    const item = collection.items.find(entry => entry.character.id === 'memory_archivist')

    expect(item?.currentStage).toBe(2)
    expect(item?.currentStageDefinition.stage).toBe(2)
    expect(item?.nextStageDefinition?.stage).toBe(3)
    expect(item?.canEvolve).toBe(true)
    expect(item?.maxed).toBe(false)
  })

  it('marks maxed characters and prevents evolution beyond the final stage', () => {
    const character = getCharacterById('lexical_sage')
    const finalStage = character?.evolutionStages.at(-1)?.stage ?? 1
    const collection = buildCharacterCollection({
      rewardProgress: rewardProgress(3000, 1600),
      unlockedCharacterIds: ['lexical_sage'],
      unlockedCharacterStates: [
        { characterId: 'lexical_sage', currentStage: finalStage, evolutionSpentXp: 500 },
      ],
      selectedCharacterId: 'lexical_sage',
    })

    const item = collection.items.find(entry => entry.character.id === 'lexical_sage')

    expect(getNextCharacterStage(character, finalStage)).toBeNull()
    expect(item?.nextStageDefinition).toBeNull()
    expect(item?.canEvolve).toBe(false)
    expect(item?.maxed).toBe(true)
  })

  it('allows free evolution progression when next stage has zero cost', () => {
    const collection = buildCharacterCollection({
      rewardProgress: rewardProgress(500, 450),
      unlockedCharacterIds: ['arena_guardian'],
      selectedCharacterId: 'arena_guardian',
    })

    const item = collection.items.find(entry => entry.character.id === 'arena_guardian')

    expect(collection.availableXp).toBe(50)
    expect(item?.nextStageDefinition).toBeDefined()
    expect(item?.canEvolve).toBe(true)
    expect(item?.remainingXpForEvolution).toBe(0)
  })
})
