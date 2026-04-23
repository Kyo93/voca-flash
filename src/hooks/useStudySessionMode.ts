import { useState, useCallback, useRef, useEffect } from 'react'
import { 
  SrsRating, 
  Card, 
  CardProgress,
  StudyChallengeType, 
  IntervalPreview, 
  mapTestResultToRating, 
  computeIntervalPreviews, 
  createInitialProgress 
} from '../lib/srs'
import { STUDY_SESSION_DEFAULTS, CHALLENGE_TYPES } from '../lib/constants'
import { generateChoices } from '../lib/challenge-logic'
import { Word } from '../lib/types'

export type StudyPhase = 'FLIPPED' | 'READY_FOR_QUIZ' | 'CHALLENGING' | 'RATING'

interface UseStudySessionModeProps {
  currentCard: Card | null
  currentProgress: CardProgress | null
  srsIntensity?: number
  onRate: (rating: SrsRating) => void
}

/**
 * useStudySessionMode - Orchestrates the challenge/quiz logic after a card is flipped.
 * Handles timers, challenge selection, and rating suggestions.
 */
export function useStudySessionMode({
  currentCard,
  currentProgress,
  srsIntensity = 1.0,
  onRate
}: UseStudySessionModeProps) {
  const [phase, setPhase] = useState<StudyPhase>('FLIPPED')
  const [suggestedRating, setSuggestedRating] = useState<SrsRating | null>(null)
  const [intervalPreviews, setIntervalPreviews] = useState<IntervalPreview[]>([])
  const [timerSeconds, setTimerSeconds] = useState<number>(STUDY_SESSION_DEFAULTS.TIMER_SECONDS)
  const [currentChallengeType, setCurrentChallengeType] = useState<StudyChallengeType>('recognition')
  const [precomputedChoices, setPrecomputedChoices] = useState<string[]>([])
  
  const challengeStartTimeRef = useRef<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerTickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /** Clear all active timers (timeout + interval tick) */
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
    if (timerTickRef.current) { clearInterval(timerTickRef.current); timerTickRef.current = null }
  }, [])

  // Convert Card → Word shape for challenge components
  const cardToWord = useCallback((card: Card): Word => ({
    id: card.id,
    word: card.front,
    definition: card.back,
    phonetic: card.phonetic ?? null,
    pos: null,
    difficulty: 3,
    example: card.example ?? null,
    example_vi: card.example_vi ?? null,
    image_url: card.image_url ?? null,
    image_position: card.image_position ?? null,
    created_at: '',
    updated_at: '',
  } as Word), [])

  // Reset session state when card changes
  useEffect(() => {
    clearTimers()
    
    setPhase('FLIPPED')
    setSuggestedRating(null)
    setIntervalPreviews([])
    setTimerSeconds(STUDY_SESSION_DEFAULTS.TIMER_SECONDS)
    setPrecomputedChoices([])
  }, [currentCard?.id])

  // Cleanup on unmount
  useEffect(() => {
    return clearTimers
  }, [])

  // 1. Challenge Initialization Effect: Listen for READY_FOR_QUIZ, prepare data, and flip to CHALLENGING
  useEffect(() => {
    if (phase !== 'READY_FOR_QUIZ' || !currentCard) return

    const picked = CHALLENGE_TYPES[Math.floor(Math.random() * CHALLENGE_TYPES.length)]
    setCurrentChallengeType(picked)
    
    setPrecomputedChoices(generateChoices(cardToWord(currentCard)))
    challengeStartTimeRef.current = Date.now()
    setTimerSeconds(STUDY_SESSION_DEFAULTS.TIMER_SECONDS)
    
    // Move to active challenge phase
    setPhase('CHALLENGING')
  }, [phase, currentCard, cardToWord])

  const handleChallengeTimeout = useCallback(() => {
    clearTimers()

    const previews = computeIntervalPreviews(
      currentProgress ?? createInitialProgress(''),
      srsIntensity,
    )

    setSuggestedRating(2) // Hard
    setIntervalPreviews(previews)
    setPhase('RATING')
  }, [currentProgress, srsIntensity])

  // 2. Active Challenge Timer Effect: Run setInterval/setTimeout ONLY while in CHALLENGING phase
  useEffect(() => {
    if (phase !== 'CHALLENGING') return

    timerTickRef.current = setInterval(() => {
      setTimerSeconds(s => Math.max(0, s - 1))
    }, 1000)

    timeoutRef.current = setTimeout(() => {
      handleChallengeTimeout()
    }, STUDY_SESSION_DEFAULTS.TIMEOUT_MS)

    return clearTimers
  }, [phase, handleChallengeTimeout])

  const handleChallengeSubmit = useCallback((isCorrect: boolean) => {
    clearTimers()

    const responseTime = Date.now() - challengeStartTimeRef.current
    const suggested = mapTestResultToRating(isCorrect, responseTime)
    const previews = computeIntervalPreviews(
      currentProgress ?? createInitialProgress(''),
      srsIntensity,
    )

    setSuggestedRating(suggested)
    setIntervalPreviews(previews)
    setPhase('RATING')
  }, [currentProgress, srsIntensity])

  const handleSkipChallenge = useCallback(() => {
    clearTimers()
    
    const previews = computeIntervalPreviews(
      currentProgress ?? createInitialProgress(currentCard?.id || ''),
      srsIntensity,
    )
    
    setSuggestedRating(null)
    setIntervalPreviews(previews)
    setPhase('RATING')
  }, [currentCard?.id, currentProgress, srsIntensity])

  const handleRateInternal = useCallback((rating: SrsRating) => {
    clearTimers()
    setPhase('FLIPPED')
    setSuggestedRating(null)
    setIntervalPreviews([])
    setTimerSeconds(STUDY_SESSION_DEFAULTS.TIMER_SECONDS)
    // Delay slightly to allow state to settle before next card loads
    setTimeout(() => onRate(rating), 0)
  }, [onRate, clearTimers])

  const handleNextToChallenge = useCallback(() => {
    setPhase('READY_FOR_QUIZ')
  }, [])

  return {
    phase,
    suggestedRating,
    intervalPreviews,
    timerSeconds,
    currentChallengeType,
    precomputedChoices,
    handleChallengeSubmit,
    handleSkipChallenge,
    handleRate: handleRateInternal,
    handleNextToChallenge,
    word: currentCard ? cardToWord(currentCard) : null
  }
}
