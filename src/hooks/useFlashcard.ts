import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Card, CardProgress, calculateFSRSReview, createInitialProgress, isMastered, SrsRating, mapIntensityToRetention } from '../lib/srs'
import { fetchWords, fetchSrsStates, upsertSrsRecord, recordStreak, saveResumePointer } from '../lib/supabase-storage'
import { useAuth } from '../contexts/AuthContext'
import { StudySessionMode } from '../lib/types'
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
  const { user, profile, refreshActiveRoadmap, refreshInitialData } = useAuth()

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

  // Mirror state in a ref so async callbacks (rate → upsert → refresh) read
  // the current value synchronously without depending on React's batching.
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

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

    for (const card of cards) {
      const progress = progressMap.get(card.id)
      if (!progress) {
        unlearned.push(card)
      } else if (isMastered(progress)) {
        mastered.push(card)
      } else {
        learning.push(card)
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

  const startSession = useCallback(async (roadmapId: string | undefined, topicId: string, mode: StudySessionMode) => {
    setState((s) => {
      if (!s.prepStats) return s
      const { unlearned, learning, mastered } = s.prepStats
      
      let combined: Card[] = []
      
      switch (mode) {
        case 'new':
          combined = [...unlearned]
          break
        case 'all':
          combined = [...unlearned, ...learning, ...mastered]
          break
        default: // 'combined'
          combined = [...unlearned, ...learning]
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
  }, [user, profile])

  const flip = useCallback(() => {
    setState((s) => ({ ...s, isFlipped: !s.isFlipped }))
  }, [])

  const rate = useCallback(async (rating: SrsRating) => {
    // Read current state via ref to avoid React 18 batching hiding values
    // from async side-effects that run after setState().
    const s = stateRef.current
    const card = s.queue[s.currentIndex]
    if (!card) return

    const prevProgress = s.progressMap.get(card.id) || createInitialProgress(card.id)
    const intensity = profile?.srs_intensity ?? SRS_CONFIG.INTENSITY_DEFAULT
    const retention = mapIntensityToRetention(intensity)
    const newProgress = calculateFSRSReview(prevProgress, rating, retention)
    const durationMs = Date.now() - s.cardStartTime

    setState((prev) => {
      const updatedMap = new Map(prev.progressMap)
      updatedMap.set(card.id, newProgress)
      
      const nextIdx = prev.currentIndex + 1
      
      // Repeat logic: If AGAIN, push card to the end of queue
      // unless we are already at the very last card and it's being repeated? 
      // No, just append it.
      let newQueue = [...prev.queue]
      if (rating === SRS_RATINGS.AGAIN) {
        newQueue.push(card)
      }

      return {
        ...prev,
        queue: newQueue,
        progressMap: updatedMap,
        currentIndex: nextIdx,
        isFlipped: false,
        isComplete: nextIdx >= newQueue.length,
        cardStartTime: Date.now(),
      }
    })

    if (user) {
      syncSrsUpdate(user.id, card.id, newProgress, rating, durationMs)
      
      // If this was the last card, refresh the dashboard data
      if (s.currentIndex + 1 >= s.queue.length && rating !== SRS_RATINGS.AGAIN) {
        refreshInitialData().catch(err => console.error('[useFlashcard] auto refresh error:', err))
      }
    }
  }, [user, profile?.srs_intensity, refreshInitialData])

  const syncSrsUpdate = useCallback(async (
    userId: string, 
    cardId: string, 
    progress: CardProgress, 
    rating: SrsRating, 
    durationMs: number
  ) => {
    try {
      await upsertSrsRecord(userId, cardId, {
        ...progress,
        incrementWrong: rating === SRS_RATINGS.AGAIN ? 1 : 0,
        rating,
        duration: durationMs,
      })
      await recordStreak(userId)
    } catch (err) {
      console.error('[useFlashcard] sync error:', err)
    }
  }, [])

  const markLearned = useCallback(() => {
    // Flip the card first so user sees the answer, then defer rating
    // until after the flip animation completes (~300ms)
    flip()
    requestAnimationFrame(() => {
      setTimeout(() => rate(SRS_RATINGS.GOOD), TIME_CONSTANTS.TIMEOUT_SHORT_MS)
    })
  }, [rate, flip])

  const resign = useCallback(() => {
    setState(prev => ({ ...prev, isComplete: true }))
    refreshInitialData().catch(err => console.error('[useFlashcard] final refresh error:', err))
  }, [refreshInitialData])

  const currentCard = state.queue[state.currentIndex] || null
  const currentProgress = currentCard ? state.progressMap.get(currentCard.id) : null

  return useMemo(() => ({
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
    resign
  }), [state, currentCard, currentProgress, initialize, startSession, flip, rate, markLearned, resign])
}
