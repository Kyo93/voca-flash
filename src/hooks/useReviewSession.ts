import { useState, useCallback, useMemo } from 'react'
import { CardProgress, Rating, calculateNextReview } from '../lib/srs'
import { fetchReviewWords, upsertSrsRecord } from '../lib/supabase-storage'
import { useAuth } from '../contexts/AuthContext'
import { Word } from '../lib/types'

export type QuadrantType = 'recognition' | 'phonetics' | 'context_gap' | 'construction' | 'usage_master' | 'ghost_recall'

export interface ReviewChallenge {
  id: string
  word: Word
  progress: CardProgress
  choices: string[]
  quadrant: QuadrantType
}

export function useReviewSession() {
  const { user } = useAuth()
  const [queue, setQueue] = useState<ReviewChallenge[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [stats, setStats] = useState({ 
    correct: 0, 
    wrong: 0, 
    points: 0, 
    mistakes: [] as Word[] 
  })

  /**
   * Adaptive Quadrant Selection
   * Chooses the hardest appropriate challenge for the word's current mastery level.
   */
  const selectQuadrant = (card: { word: Word; progress: CardProgress; choices: string[] }): QuadrantType => {
    const { progress, word, choices } = card
    const hasExample = !!word.example
    const hasChoices = choices.length >= 3

    // Logic based on SM-2 repetitions
    if (progress.repetitions < 2) {
      // Beginner: Recognition or Construction
      const options: QuadrantType[] = ['construction']
      if (hasChoices) options.push('recognition')
      if (hasExample) options.push('context_gap')
      return options[Math.floor(Math.random() * options.length)]
    } else if (progress.repetitions < 4) {
      // Intermediate: Phonetics, Construction or Context Gap
      const options: QuadrantType[] = ['construction', 'phonetics']
      if (hasExample) options.push('context_gap')
      return options[Math.floor(Math.random() * options.length)]
    } else {
      // Advanced: Ghost Recall or Usage Master
      if (hasExample && Math.random() > 0.5) return 'usage_master'
      return 'ghost_recall'
    }
  }

  const initialize = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    
    const rawCards = await fetchReviewWords(user.id)
    
    const challenges: ReviewChallenge[] = rawCards.map(c => ({
      id: c.word.id,
      word: c.word,
      progress: c.progress,
      choices: c.choices,
      quadrant: selectQuadrant(c)
    }))

    // Shuffle the final queue
    setQueue(challenges.sort(() => Math.random() - 0.5))
    setIsLoading(false)
    setIsComplete(challenges.length === 0)
  }, [user])

  const submitAnswer = useCallback(async (isCorrect: boolean, ratingFallback?: Rating) => {
    if (currentIndex >= queue.length) return
    if (!user) return

    const current = queue[currentIndex]
    
    // Calculate new SRS rating
    // If correct in hard mode (ghost_recall), give higher rating
    let rating: Rating = isCorrect ? 4 : 1
    if (isCorrect && current.quadrant === 'ghost_recall') rating = 5
    if (ratingFallback !== undefined) rating = ratingFallback

    const newProgress = calculateNextReview(current.progress, rating)

    // Fire-and-forget DB update
    upsertSrsRecord(user.id, current.word.id, {
      repetitions: newProgress.repetitions,
      incrementWrong: isCorrect ? 0 : 1,
      mastered: newProgress.repetitions >= 6, // Global master threshold
      ease: newProgress.ease,
      interval: newProgress.interval,
      nextReview: newProgress.nextReview
    }).catch(err => console.error('[useReviewSession] sync error:', err))

    // Update session stats
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      points: prev.points + (isCorrect ? (current.quadrant === 'ghost_recall' ? 20 : 10) : 0),
      mistakes: isCorrect ? prev.mistakes : [...prev.mistakes, current.word]
    }))

    // Move to next
    const nextIndex = currentIndex + 1
    if (nextIndex >= queue.length) {
      setIsComplete(true)
    } else {
      setCurrentIndex(nextIndex)
    }
  }, [currentIndex, queue, user])

  const currentChallenge = useMemo(() => queue[currentIndex] || null, [queue, currentIndex])

  return {
    isLoading,
    isComplete,
    currentIndex,
    totalCount: queue.length,
    currentChallenge,
    stats,
    initialize,
    submitAnswer
  }
}
