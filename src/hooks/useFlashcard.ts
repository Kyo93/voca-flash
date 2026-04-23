import { useState, useCallback } from 'react'
import { Card, CardProgress, calculateFSRSReview, createInitialProgress, isMastered, SrsRating, mapIntensityToRetention } from '../lib/srs'
import { fetchWords, fetchSrsStates, upsertSrsRecord, recordStreak, saveResumePointer } from '../lib/supabase-storage'
import { useAuth } from '../contexts/AuthContext'
import { SRS_RATINGS, TIME_CONSTANTS, SRS_CONFIG } from '../lib/constants'

interface FlashcardState {
  queue: Card[]
  currentIndex: number
  isFlipped: boolean
  progressMap: Map<string, CardProgress>
  isComplete: boolean
  isLoading: boolean
  isPrepScreen: boolean
  prepStats: { unlearned: Card[], learning: Card[], mastered: Card[] } | null
  cardStartTime: number
}

export function useFlashcard() {
  const { user, profile, refreshActiveRoadmap } = useAuth()

  const [state, setState] = useState<FlashcardState>({
    queue: [],
    currentIndex: 0,
    isFlipped: false,
    progressMap: new Map(),
    isComplete: false,
    isLoading: true,
    isPrepScreen: true,
    prepStats: null,
    cardStartTime: 0,
  })

  const initialize = useCallback(async (topic?: string) => {
    setState((s) => ({ ...s, isLoading: true }))

    // Fetch words and progress in parallel
    const [cards, progressMap] = await Promise.all([
      fetchWords(topic),
      user ? fetchSrsStates(user.id) : Promise.resolve(new Map<string, CardProgress>()),
    ])

    const unlearned: Card[] = []
    const learning: Card[] = []
    const mastered: Card[] = []

    for (const c of cards) {
      if (!progressMap.has(c.id)) {
        unlearned.push(c)
      } else {
        const prog = progressMap.get(c.id)!
        if (isMastered(prog)) {
          mastered.push(c)
        } else {
          learning.push(c)
        }
      }
    }

    setState({
      queue: [],
      currentIndex: 0,
      isFlipped: false,
      progressMap,
      isComplete: false,
      isLoading: false,
      isPrepScreen: true,
      prepStats: { unlearned, learning, mastered },
      cardStartTime: Date.now(),
    })
  }, [user])

  const startSession = useCallback(async (roadmapId: string | undefined, topicId: string, includeMastered: boolean) => {
    setState((s) => {
      if (!s.prepStats) return s
      const { unlearned, learning, mastered } = s.prepStats
      
      // Queue = unlearned words + words currently in learning phase.
      // Mastered words included only if includeMastered=true.
      let combined = [...unlearned, ...learning]
      if (includeMastered) {
        combined = [...combined, ...mastered]
      }
      
      const limit = profile?.daily_target ?? SRS_CONFIG.DEFAULT_DAILY_TARGET
      combined = combined.slice(0, limit)

      if (user && roadmapId) {
        // Optimistically save resume state
        saveResumePointer(user.id, roadmapId, topicId).then(() => {
          refreshActiveRoadmap(roadmapId)
        }).catch(err => console.error(err))
      }

      return {
        ...s,
        queue: combined,
        isPrepScreen: false,
        isComplete: combined.length === 0,
        cardStartTime: Date.now(),
      }
    })
  }, [user])

  const flip = useCallback(() => {
    setState((s) => ({ ...s, isFlipped: !s.isFlipped }))
  }, [])

  const rate = useCallback(async (rating: SrsRating) => {
    let cardToSave: Card | null = null
    let progressToSave: CardProgress | null = null
    const wrongCount = rating === SRS_RATINGS.AGAIN ? 1 : 0
    let durationMs = 0

    setState((s) => {
      const card = s.queue[s.currentIndex]
      if (!card) return s

      const prevProgress = s.progressMap.get(card.id) || createInitialProgress(card.id)
      const intensity = profile?.srs_intensity ?? SRS_CONFIG.INTENSITY_DEFAULT
      const retention = mapIntensityToRetention(intensity)
      
      const newProgress = calculateFSRSReview(prevProgress, rating, retention)

      const updatedMap = new Map(s.progressMap)
      updatedMap.set(card.id, newProgress)

      const nextIdx = s.currentIndex + 1
      const isComplete = nextIdx >= s.queue.length

      // Side effect capture
      cardToSave = card
      progressToSave = newProgress
      durationMs = Date.now() - s.cardStartTime

      return {
        ...s,
        progressMap: updatedMap,
        currentIndex: nextIdx,
        isFlipped: false,
        isComplete,
        cardStartTime: Date.now(),
      }
    })

    if (user && cardToSave && progressToSave) {
      upsertSrsRecord(user.id, (cardToSave as Card).id, {
        ...(progressToSave as CardProgress),
        incrementWrong: wrongCount,
        rating,
        duration: durationMs
      }).catch(err => console.error('[useFlashcard] sync error:', err))
      
      recordStreak(user.id).catch(err => console.error('[useFlashcard] streak error:', err))
    }
  }, [user, profile?.srs_intensity])

  const markLearned = useCallback(() => {
    // Flip the card first so user sees the answer, then defer rating
    // until after the flip animation completes (~300ms)
    flip()
    requestAnimationFrame(() => {
      setTimeout(() => rate(SRS_RATINGS.GOOD), TIME_CONSTANTS.TIMEOUT_SHORT_MS)
    })
  }, [rate])

  const currentCard = state.queue[state.currentIndex] || null
  const currentProgress = currentCard ? state.progressMap.get(currentCard.id) : null

  return {
    ...state,
    currentCard,
    currentProgress,
    total: state.queue.length,
    remaining: state.queue.length - state.currentIndex,
    initialize,
    startSession,
    flip,
    rate,
    markLearned,
  }
}
