import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import i18n from '../i18n'
import { SrsRating, calculateFSRSReview, mapIntensityToRetention } from '../lib/srs'
import { applyUserRewardGain, fetchReviewWords, fetchRewardProgress, upsertSrsRecord } from '../lib/supabase-storage'
import { useAuth } from '../contexts/AuthContext'
import { Word } from '../lib/types'
import { selectQuadrant, generateChoices, type ReviewChallenge, type QuadrantType } from '../lib/challenge-logic'
import { shuffleArray } from '../lib/utils'
import { SRS_RATINGS, SRS_CONFIG } from '../lib/constants'
import {
  applyRewardGainToStoredProgress,
  calculateReviewReward,
  createEmptyRewardProgress,
  getNewlyUnlockedRewardBadges,
  toRewardProgressView,
  type RewardBadge,
  type RewardProgressView,
} from '../lib/rewards'

// Re-export for backward compatibility (used by other hooks)
export type { ReviewChallenge, QuadrantType }

function createInitialStats() {
  return {
    correct: 0,
    wrong: 0,
    points: 0,
    mistakes: [] as Word[]
  }
}

function mergeRewardBadges(current: RewardBadge[], incoming: RewardBadge[]): RewardBadge[] {
  const merged = new Map(current.map(badge => [badge.id, badge]))
  incoming.forEach(badge => merged.set(badge.id, badge))
  return [...merged.values()]
}

export function useReviewSession() {
  const { user, profile } = useAuth()
  const [queue, setQueue] = useState<ReviewChallenge[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [stats, setStats] = useState(createInitialStats)
  const [rewardProgress, setRewardProgress] = useState<RewardProgressView>(() => (
    toRewardProgressView(createEmptyRewardProgress('anonymous'))
  ))
  const [sessionUnlockedBadges, setSessionUnlockedBadges] = useState<RewardBadge[]>([])
  const [syncError, setSyncError] = useState<string | null>(null)
  const [challengeStartTime, setChallengeStartTime] = useState<number>(0)
  const isInitializing = useRef(false)
  const processedWordIds = useRef<Set<string>>(new Set())
  const queueRef = useRef<ReviewChallenge[]>([])
  const rewardProgressRef = useRef(rewardProgress)

  useEffect(() => {
    rewardProgressRef.current = rewardProgress
  }, [rewardProgress])

  const initialize = useCallback(async () => {
    if (!user || isInitializing.current) return
    isInitializing.current = true
    setIsLoading(true)
    setSyncError(null)
    setStats(createInitialStats())
    setCurrentIndex(0)
    setSessionUnlockedBadges([])
    processedWordIds.current.clear()
    queueRef.current = []
    
    try {
      const [rawCards, rewards] = await Promise.all([
        fetchReviewWords(user.id),
        fetchRewardProgress(user.id)
      ])
      setRewardProgress(rewards)
      rewardProgressRef.current = rewards
      
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
      setSyncError(i18n.t('review.errors.loadFailed'))
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
      const rewardGain = calculateReviewReward({
        isCorrect,
        isSkipped,
        quadrant: current.quadrant,
      })
      const previousXp = rewardProgressRef.current.totalXp
      const optimisticRewards = toRewardProgressView(
        applyRewardGainToStoredProgress(rewardProgressRef.current, rewardGain)
      )
      rewardProgressRef.current = optimisticRewards
      setRewardProgress(optimisticRewards)
      setSessionUnlockedBadges(prev => mergeRewardBadges(
        prev,
        getNewlyUnlockedRewardBadges(previousXp, optimisticRewards.totalXp)
      ))
      
      const intensity = profile?.srs_intensity ?? SRS_CONFIG.INTENSITY_DEFAULT
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
        setSyncError(i18n.t('review.errors.syncFailed'))
      })

      setStats(prev => {
        const updatedMistakes = isCorrect 
          ? prev.mistakes 
          : [...prev.mistakes, current.word]
        
        return {
          correct: prev.correct + (isCorrect ? 1 : 0),
          wrong: prev.wrong + (isCorrect ? 0 : 1),
          points: prev.points + rewardGain.xp,
          mistakes: updatedMistakes
        }
      })

      applyUserRewardGain(user.id, rewardGain).then(serverRewards => {
        rewardProgressRef.current = serverRewards
        setRewardProgress(serverRewards)
        setSessionUnlockedBadges(prev => mergeRewardBadges(
          prev,
          getNewlyUnlockedRewardBadges(previousXp, serverRewards.totalXp)
        ))
      }).catch(err => {
        console.error('[useReviewSession] reward sync error:', err)
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
  }, [currentIndex, queue, user, challengeStartTime, profile?.srs_intensity])

  const currentChallenge = useMemo(() => queue[currentIndex] || null, [queue, currentIndex])

  return {
    isLoading,
    isComplete,
    currentIndex,
    totalCount: queue.length,
    currentChallenge,
    stats,
    rewardProgress,
    sessionUnlockedBadges,
    syncError,
    initialize,
    submitAnswer
  }
}
