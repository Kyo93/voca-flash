import { useState, useCallback } from 'react'
import { Card, CardProgress, calculateNextReview, createInitialProgress, getDueCards, Rating } from '../lib/srs'
import { loadCards, loadProgress, saveProgress } from '../lib/storage'
import { recordStudy } from '../lib/streak'

interface FlashcardState {
  queue: Card[]
  currentIndex: number
  isFlipped: boolean
  progressMap: Map<string, CardProgress>
  isComplete: boolean
  isLoading: boolean
}

export function useFlashcard(topicFilter?: string) {
  const [state, setState] = useState<FlashcardState>({
    queue: [],
    currentIndex: 0,
    isFlipped: false,
    progressMap: new Map(),
    isComplete: false,
    isLoading: true,
  })

  const initialize = useCallback((topic?: string) => {
    const cards = loadCards()
    const progressMap = loadProgress()

    const filtered = topic
      ? cards.filter((c) => c.topic === topic)
      : cards

    const dueCards = getDueCards(filtered, progressMap)
    const newCards = filtered.filter((c) => !progressMap.has(c.id))
    const combined = [...dueCards, ...newCards].slice(0, 20) // Max 20 per session

    setState({
      queue: combined,
      currentIndex: 0,
      isFlipped: false,
      progressMap,
      isComplete: combined.length === 0,
      isLoading: false,
    })
  }, [])

  const flip = useCallback(() => {
    setState((s) => ({ ...s, isFlipped: !s.isFlipped }))
  }, [])

  const rate = useCallback((rating: Rating) => {
    setState((s) => {
      const card = s.queue[s.currentIndex]
      if (!card) return s

      const prevProgress = s.progressMap.get(card.id) || createInitialProgress(card.id)
      const newProgress = calculateNextReview(prevProgress, rating)

      const newMap = new Map(s.progressMap)
      newMap.set(card.id, newProgress)
      saveProgress(newMap)

      // Record study for streak
      recordStudy()

      const nextIndex = s.currentIndex + 1
      const isComplete = nextIndex >= s.queue.length

      return {
        ...s,
        progressMap: newMap,
        currentIndex: nextIndex,
        isFlipped: false,
        isComplete,
      }
    })
  }, [])

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
