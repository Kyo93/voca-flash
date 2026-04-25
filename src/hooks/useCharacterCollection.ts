import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  buildCharacterCollection,
  getCharacterById,
  type CharacterCollectionView,
  type CharacterUnlockState,
} from '../lib/characters'
import { REWARD_PROGRESS_UPDATED_EVENT, type RewardProgressView } from '../lib/rewards'
import {
  fetchCharacterCollection,
  evolveUserCharacter,
  selectUserCharacter,
  unlockUserCharacter,
  type StoredCharacterCollection,
} from '../lib/supabase-storage'

interface CharacterCollectionState {
  rewardProgress: RewardProgressView | null
  unlockedCharacterIds: string[]
  unlockedCharacterStates: CharacterUnlockState[]
  selectedCharacterId: string | null
}

export function useCharacterCollection(userId: string | null | undefined) {
  const [state, setState] = useState<CharacterCollectionState>({
    rewardProgress: null,
    unlockedCharacterIds: [],
    unlockedCharacterStates: [],
    selectedCharacterId: null,
  })
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false)
  const [isMutatingCharacter, setIsMutatingCharacter] = useState(false)
  const [characterError, setCharacterError] = useState<string | null>(null)

  const applyStoredCollection = useCallback((collection: StoredCharacterCollection) => {
    setState({
      rewardProgress: collection.rewardProgress,
      unlockedCharacterIds: collection.unlockedCharacterIds,
      unlockedCharacterStates: collection.unlockedCharacterStates,
      selectedCharacterId: collection.selectedCharacterId,
    })
  }, [])

  const refreshCharacters = useCallback(async () => {
    if (!userId) {
      setState({
        rewardProgress: null,
        unlockedCharacterIds: [],
        unlockedCharacterStates: [],
        selectedCharacterId: null,
      })
      return
    }

    setIsLoadingCharacters(true)
    setCharacterError(null)
    try {
      applyStoredCollection(await fetchCharacterCollection(userId))
    } catch (err) {
      console.error('[useCharacterCollection] load failed:', err)
      setCharacterError('characters.errors.loadFailed')
    } finally {
      setIsLoadingCharacters(false)
    }
  }, [applyStoredCollection, userId])

  useEffect(() => {
    refreshCharacters()
  }, [refreshCharacters])

  useEffect(() => {
    if (!userId) return

    function handleRewardProgressUpdated(event: Event) {
      const detail = (event as CustomEvent<{ userId?: string }>).detail
      if (detail?.userId === userId) {
        refreshCharacters()
      }
    }

    window.addEventListener(REWARD_PROGRESS_UPDATED_EVENT, handleRewardProgressUpdated)

    return () => {
      window.removeEventListener(REWARD_PROGRESS_UPDATED_EVENT, handleRewardProgressUpdated)
    }
  }, [refreshCharacters, userId])

  const collection = useMemo<CharacterCollectionView | null>(() => {
    if (!state.rewardProgress) return null

    return buildCharacterCollection({
      rewardProgress: state.rewardProgress,
      unlockedCharacterIds: state.unlockedCharacterIds,
      unlockedCharacterStates: state.unlockedCharacterStates,
      selectedCharacterId: state.selectedCharacterId,
    })
  }, [state])

  const unlockCharacter = useCallback(async (characterId: string) => {
    if (!userId || !collection) return false
    const character = getCharacterById(characterId)
    if (!character) return false

    const item = collection.items.find(entry => entry.character.id === characterId)
    if (!item || item.unlocked || !item.affordable) return false

    setIsMutatingCharacter(true)
    setCharacterError(null)
    try {
      applyStoredCollection(await unlockUserCharacter(userId, characterId, character.costXp))
      return true
    } catch (err) {
      console.error('[useCharacterCollection] unlock failed:', err)
      setCharacterError('characters.errors.unlockFailed')
      return false
    } finally {
      setIsMutatingCharacter(false)
    }
  }, [applyStoredCollection, collection, userId])

  const selectCharacter = useCallback(async (characterId: string) => {
    if (!userId || !collection) return false
    const item = collection.items.find(entry => entry.character.id === characterId)
    if (!item?.unlocked) return false

    setIsMutatingCharacter(true)
    setCharacterError(null)
    try {
      applyStoredCollection(await selectUserCharacter(userId, characterId))
      return true
    } catch (err) {
      console.error('[useCharacterCollection] select failed:', err)
      setCharacterError('characters.errors.selectFailed')
      return false
    } finally {
      setIsMutatingCharacter(false)
    }
  }, [applyStoredCollection, collection, userId])

  const evolveCharacter = useCallback(async (characterId: string) => {
    if (!userId || !collection) return false
    const item = collection.items.find(entry => entry.character.id === characterId)
    if (!item?.canEvolve || !item.nextStageDefinition) return false

    setIsMutatingCharacter(true)
    setCharacterError(null)
    try {
      applyStoredCollection(await evolveUserCharacter(
        userId,
        characterId,
        item.nextStageDefinition.stage,
        item.nextStageDefinition.costXp
      ))
      return true
    } catch (err) {
      console.error('[useCharacterCollection] evolve failed:', err)
      setCharacterError('characters.errors.evolveFailed')
      return false
    } finally {
      setIsMutatingCharacter(false)
    }
  }, [applyStoredCollection, collection, userId])

  return {
    collection,
    isLoadingCharacters,
    isMutatingCharacter,
    characterError,
    refreshCharacters,
    unlockCharacter,
    selectCharacter,
    evolveCharacter,
  }
}
