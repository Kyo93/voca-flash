import { useState, useCallback, useMemo, useRef } from 'react'
import { SrsRating, calculateFSRSReview, mapIntensityToRetention } from '../lib/srs'
import { fetchReviewWords, upsertSrsRecord } from '../lib/supabase-storage'
import { useAuth } from '../contexts/AuthContext'
import { Word } from '../lib/types'
import { selectQuadrant, generateChoices, type ReviewChallenge, type QuadrantType } from '../lib/challenge-logic'
import { shuffleArray } from '../lib/utils'
import { REVIEW_SESSION_CONFIG, SRS_RATINGS } from '../lib/constants'

// Re-export for backward compatibility (used by other hooks)
export type { ReviewChallenge, QuadrantType }

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
  const [challengeStartTime, setChallengeStartTime] = useState<number>(0)
  const isInitializing = useRef(false)
  const processedWordIds = useRef<Set<string>>(new Set())
  const queueRef = useRef<ReviewChallenge[]>([])

  const initialize = useCallback(async () => {
    if (!user || isInitializing.current) return
    isInitializing.current = true
    setIsLoading(true)
    setSyncError(null)
    processedWordIds.current.clear()
    queueRef.current = []
    
    try {
      const rawCards = await fetchReviewWords(user.id)
      
      const challenges: ReviewChallenge[] = rawCards.map(c => {
        // Ensure we always have the correct definition + 3 distractors
        const choices = generateChoices(c.word, c.choices)
        
        return {
          id: c.word.id,
          word: c.word,
          progress: c.progress,
          choices,
          quadrant: selectQuadrant({ ...c, choices })
        }
      })

      const shuffled = shuffleArray(challenges)
      setQueue(shuffled)
      queueRef.current = shuffled
      setChallengeStartTime(Date.now())
      setIsComplete(shuffled.length === 0)
    } catch (err) {
      console.error('[useReviewSession] Init failed:', err)
      setSyncError('Không thể tải dữ liệu ôn tập.')
    } finally {
      setIsLoading(false)
      isInitializing.current = false
    }
  }, [user])

  const submitAnswer = useCallback(async (isCorrect: boolean, isSkipped = false, ratingFallback?: SrsRating, durationMs?: number) => {
    if (currentIndex >= queue.length) return
    if (!user) return

    const current = queue[currentIndex]
    
    let rating: SrsRating = isCorrect ? SRS_RATINGS.GOOD : SRS_RATINGS.AGAIN
    if (isCorrect && current.quadrant === 'ghost_recall') rating = SRS_RATINGS.EASY
    if (ratingFallback !== undefined) rating = ratingFallback

    const isFirstAttempt = !processedWordIds.current.has(current.word.id)

    if (isFirstAttempt) {
      processedWordIds.current.add(current.word.id)
      
      const intensity = profile?.srs_intensity ?? 1.0
      const retention = mapIntensityToRetention(intensity)
      const newProgress = calculateFSRSReview(current.progress, rating, retention)

      const duration = durationMs ?? (Date.now() - challengeStartTime)

      upsertSrsRecord(user.id, current.word.id, {
        ...newProgress,
        incrementWrong: isCorrect ? 0 : 1,
        rating,
        duration
      }).catch(err => {
        console.error('[useReviewSession] sync error:', err)
        setSyncError('Lỗi đồng bộ dữ liệu. Kết quả có thể không được lưu.')
      })

      setStats(prev => {
        const updatedMistakes = isCorrect 
          ? prev.mistakes 
          : [...prev.mistakes, current.word]
        
        return {
          correct: prev.correct + (isCorrect ? 1 : 0),
          wrong: prev.wrong + (isCorrect ? 0 : 1),
          points: prev.points + (isCorrect ? (current.quadrant === 'ghost_recall' ? REVIEW_SESSION_CONFIG.POINTS_GHOST_RECALL_BONUS : REVIEW_SESSION_CONFIG.POINTS_PER_CORRECT) : 0),
          mistakes: updatedMistakes
        }
      })
    }

    setSyncError(null)

    let nextQueue = queueRef.current
    if (!isCorrect && !isSkipped) {
      nextQueue = [...queue, current]
      queueRef.current = nextQueue
      setQueue(nextQueue)
    }

    const nextQueueLength = nextQueue.length

    setCurrentIndex(prev => {
      const nextIndex = prev + 1
      if (nextIndex >= nextQueueLength) {
        setIsComplete(true)
        return prev
      }
      setChallengeStartTime(Date.now())
      return nextIndex
    })
  }, [currentIndex, queue, user, challengeStartTime])

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
