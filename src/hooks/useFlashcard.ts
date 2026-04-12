import { useState, useCallback, useEffect } from 'react'
import { Card, CardProgress, calculateNextReview, createInitialProgress, getDueCards, Rating } from '../lib/srs'
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

export function useFlashcard(topicFilter?: string) {
  const { user } = useAuth()

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
        if (prog.repetitions >= 5) {
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
      
      const dueLearning = getDueCards(learning, s.progressMap) // filter only due learning cards? 
      // Actually, unlearned + ALL learning is fine, or just due learning. Let's use unlearned + leaning.
      // Wait, getDueCards only gets DUE cards. Let's combine unlearned and due cards.
      let combined = [...unlearned, ...learning]
      if (includeMastered) {
        combined = [...combined, ...mastered]
      }
      
      combined = combined.slice(0, 20)

      if (user && roadmapId) {
        // Optimistically save resume state
        saveResumePointer(user.id, roadmapId, topicId).catch(err => console.error(err))
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

  const rate = useCallback(async (rating: Rating) => {
    setState((s) => {
      const card = s.queue[s.currentIndex]
      if (!card) return s

      const prevProgress = s.progressMap.get(card.id) || createInitialProgress(card.id)
      const newProgress = calculateNextReview(prevProgress, rating)

      const newMap = new Map(s.progressMap)
      newMap.set(card.id, newProgress)

      const nextIndex = s.currentIndex + 1
      const isComplete = nextIndex >= s.queue.length

      // Fire-and-forget Supabase sync (non-blocking)
      if (user) {
        const mastered = newProgress.repetitions >= 5
        const wrong = rating < 3 ? 1 : 0

        upsertSrsRecord(user.id, card.id, {
          repetitions: newProgress.repetitions,
          incrementWrong: wrong,
          mastered,
          ease: newProgress.ease,
          interval: newProgress.interval,
          nextReview: newProgress.nextReview
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
    rate(3) // Good rating
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
