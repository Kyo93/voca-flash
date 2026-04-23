import { useState, useCallback, useMemo, useRef } from 'react'
import { SrsRating, calculateFSRSReview, mapIntensityToRetention } from '../lib/srs'
import { fetchReviewWords, upsertSrsRecord } from '../lib/supabase-storage'
import { useAuth } from '../contexts/AuthContext'
import { Word } from '../lib/types'
import { selectQuadrant as sharedSelectQuadrant, type ReviewChallenge, type QuadrantType } from '../lib/challenge-logic'
import { shuffleArray } from '../lib/utils'

// Re-export for backward compatibility (used by other hooks)
export type { ReviewChallenge, QuadrantType }

const POINTS_PER_CORRECT = 10
const POINTS_GHOST_RECALL_BONUS = 20

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

  // C3: Delegated to shared challenge-logic.ts
  const selectQuadrant = sharedSelectQuadrant

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
      setQueue(shuffleArray(challenges))
      setChallengeStartTime(Date.now())
      setIsComplete(challenges.length === 0)
    } catch (err) {
      console.error('[useReviewSession] Init failed:', err)
      setSyncError('Không thể tải dữ liệu ôn tập.')
    } finally {
      setIsLoading(false)
      isInitializing.current = false
    }
  }, [user])

  const submitAnswer = useCallback(async (isCorrect: boolean, ratingFallback?: SrsRating, durationMs?: number) => {
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

    const duration = durationMs ?? (Date.now() - challengeStartTime)

    // Fire-and-forget DB update with latency monitoring
    upsertSrsRecord(user.id, current.word.id, {
      ...newProgress,
      incrementWrong: isCorrect ? 0 : 1,
      rating,
      duration
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
        points: prev.points + (isCorrect ? (current.quadrant === 'ghost_recall' ? POINTS_GHOST_RECALL_BONUS : POINTS_PER_CORRECT) : 0),
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
