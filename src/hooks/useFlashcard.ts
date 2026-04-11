import { useState, useCallback, useEffect } from 'react'
import { Card, CardProgress, calculateNextReview, createInitialProgress, getDueCards, Rating } from '../lib/srs'
import { fetchWords, fetchUserProgress, upsertUserProgress, recordStreak } from '../lib/supabase-storage'
import { useAuth } from '../contexts/AuthContext'

interface FlashcardState {
  queue: Card[]
  currentIndex: number
  isFlipped: boolean
  progressMap: Map<string, CardProgress>
  isComplete: boolean
  isLoading: boolean
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
  })

  const initialize = useCallback(async (topic?: string) => {
    setState((s) => ({ ...s, isLoading: true }))

    // Fetch words and progress in parallel
    const [cards, progressMap] = await Promise.all([
      fetchWords(topic),
      user ? fetchUserProgress(user.id) : Promise.resolve(new Map<string, CardProgress>()),
    ])

    const dueCards = getDueCards(cards, progressMap)
    const newCards = cards.filter((c) => !progressMap.has(c.id))
    const combined = [...dueCards, ...newCards].slice(0, 20) // Max 20 per session

    setState({
      queue: combined,
      currentIndex: 0,
      isFlipped: false,
      progressMap,
      isComplete: combined.length === 0,
      isLoading: false,
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
        const correct = rating >= 3 ? 1 : 0
        const wrong = rating < 3 ? 1 : 0

        upsertUserProgress(user.id, card.id, correct, wrong, mastered).catch(
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
    flip,
    rate,
    markLearned,
  }
}
