import { useState, useCallback } from 'react'
import { Card, CardProgress, calculateFSRSReview, createInitialProgress, isMastered, SrsRating, mapIntensityToRetention } from '../lib/srs'
import { fetchWords, fetchSrsStates, upsertSrsRecord, recordStreak, saveResumePointer } from '../lib/supabase-storage'
import { useAuth } from '../contexts/AuthContext'

interface FlashcardState {
  queue: Card[]
  currentIndex: number
  isFlipped: boolean
  progressMap: Map<string, CardProgress>
  isComplete: boolean
  isLoading: boolean
  isPrepScreen: boolean
  prepStats: { unlearned: Card[], learning: Card[], mastered: Card[] } | null
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
      
      const limit = profile?.daily_target ?? 20
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
      }
    })
  }, [user])

  const flip = useCallback(() => {
    setState((s) => ({ ...s, isFlipped: !s.isFlipped }))
  }, [])

  const rate = useCallback(async (rating: SrsRating) => {
    setState((s) => {
      const card = s.queue[s.currentIndex]
      if (!card) return s

      const prevProgress = s.progressMap.get(card.id) || createInitialProgress(card.id)
      const intensity = profile?.srs_intensity ?? 1.0
      const retention = mapIntensityToRetention(intensity)
      
      const newProgress = calculateFSRSReview(prevProgress, rating, retention)

      const newMap = new Map(s.progressMap)
      newMap.set(card.id, newProgress)

      const nextIndex = s.currentIndex + 1
      const isComplete = nextIndex >= s.queue.length

      // Fire-and-forget Supabase sync (non-blocking)
      if (user) {
        // In FSRS, only Rating 1 (Again) counts as "wrong"
        const wrong = rating === 1 ? 1 : 0

        upsertSrsRecord(user.id, card.id, {
          ...newProgress,
          incrementWrong: wrong,
        }).catch(
          (err) => console.error('[useFlashcard] upsert progress error:', err)
        )
        recordStreak(user.id).catch(
          (err) => console.error('[useFlashcard] recordStreak error:', err)
        )
      }

      return {
        ...s,
        progressMap: newMap,
        currentIndex: nextIndex,
        isFlipped: false,
        isComplete,
      }
    })
  }, [user])

  const markLearned = useCallback(() => {
    // Flip the card first so user sees the answer, then defer rating
    // until after the flip animation completes (~300ms)
    flip()
    requestAnimationFrame(() => {
      setTimeout(() => rate(3), 1000)
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
