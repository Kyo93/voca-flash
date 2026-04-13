import { useState, useCallback, useMemo, useRef } from 'react'
import { CardProgress, SrsRating, calculateFSRSReview, mapIntensityToRetention } from '../lib/srs'
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
  const { user, profile } = useAuth()
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
  const [syncError, setSyncError] = useState<string | null>(null)
  const isInitializing = useRef(false)

  /**
   * Adaptive Quadrant Selection
   * Chooses the hardest appropriate challenge for the word's current mastery level.
   */
  const selectQuadrant = (card: { word: Word; progress: CardProgress; choices: string[] }): QuadrantType => {
    const { progress, word, choices } = card
    const hasExample = !!word.example
    const hasChoices = choices.length >= 3

    // Logic based on FSRS stability (days)
    if (progress.stability < 3) {
      // Beginner: Recognition or Construction
      const options: QuadrantType[] = ['construction']
      if (hasChoices) options.push('recognition')
      if (hasExample) options.push('context_gap')
      return options[Math.floor(Math.random() * options.length)]
    } else if (progress.stability < 14) {
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
    if (!user || isInitializing.current) return
    isInitializing.current = true
    setIsLoading(true)
    setSyncError(null)
    
    try {
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
      setIsComplete(challenges.length === 0)
    } catch (err) {
      console.error('[useReviewSession] Init failed:', err)
      setSyncError('Không thể tải dữ liệu ôn tập.')
    } finally {
      setIsLoading(false)
      isInitializing.current = false
    }
  }, [user])

  const submitAnswer = useCallback(async (isCorrect: boolean, ratingFallback?: SrsRating) => {
    if (currentIndex >= queue.length) return
    if (!user) return

    const current = queue[currentIndex]
    
    // Calculate new SRS rating
    // FSRS: Again=1, Hard=2, Good=3, Easy=4
    let rating: SrsRating = isCorrect ? 3 : 1
    if (isCorrect && current.quadrant === 'ghost_recall') rating = 4 // Extra boost for Ghost Recall
    if (ratingFallback !== undefined) rating = ratingFallback

    const intensity = profile?.srs_intensity ?? 1.0
    const retention = mapIntensityToRetention(intensity)
    const newProgress = calculateFSRSReview(current.progress, rating, retention)

    // Fire-and-forget DB update with latency monitoring
    const start = performance.now()
    upsertSrsRecord(user.id, current.word.id, {
      ...newProgress,
      incrementWrong: isCorrect ? 0 : 1,
    }).then(() => {
      const duration = performance.now() - start
      if (duration > 2000) console.warn(`[useReviewSession] Slow sync: ${duration.toFixed(0)}ms`)
    }).catch(err => {
      console.error('[useReviewSession] sync error:', err)
      setSyncError('Lỗi đồng bộ dữ liệu. Kết quả có thể không được lưu.')
    })

    // Update session stats
    setStats(prev => {
      // Avoid duplicate mistakes if somehow called twice for the same word
      const updatedMistakes = isCorrect 
        ? prev.mistakes 
        : [...prev.mistakes, current.word]
      
      return {
        correct: prev.correct + (isCorrect ? 1 : 0),
        wrong: prev.wrong + (isCorrect ? 0 : 1),
        points: prev.points + (isCorrect ? (current.quadrant === 'ghost_recall' ? 20 : 10) : 0),
        mistakes: updatedMistakes
      }
    })

    // Move to next with functional update to avoid race conditions
    setCurrentIndex(prev => {
      const nextIndex = prev + 1
      if (nextIndex >= queue.length) {
        setIsComplete(true)
        return prev
      }
      return nextIndex
    })
  }, [currentIndex, queue, user])

  const currentChallenge = useMemo(() => queue[currentIndex] || null, [queue, currentIndex])

  return {
    isLoading,
    isComplete,
    currentIndex,
    totalCount: queue.length,
    currentChallenge,
    stats,
    syncError,
    initialize,
    submitAnswer
  }
}
