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
import { STUDY_SESSION_DEFAULTS } from '../lib/constants'
import { generateChoices } from '../lib/utils'
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
  const [timerSeconds, setTimerSeconds] = useState(STUDY_SESSION_DEFAULTS.TIMER_SECONDS)
  const [currentChallengeType, setCurrentChallengeType] = useState<StudyChallengeType>('recognition')
  const [precomputedChoices, setPrecomputedChoices] = useState<string[]>([])
  
  const challengeStartTimeRef = useRef<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerTickRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
    if (timerTickRef.current) { clearInterval(timerTickRef.current); timerTickRef.current = null }
    
    setPhase('FLIPPED')
    setSuggestedRating(null)
    setIntervalPreviews([])
    setTimerSeconds(STUDY_SESSION_DEFAULTS.TIMER_SECONDS)
    setPrecomputedChoices([])
  }, [currentCard?.id])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (timerTickRef.current) clearInterval(timerTickRef.current)
    }
  }, [])

  // Start challenge logic
  useEffect(() => {
    if (phase !== 'READY_FOR_QUIZ' || !currentCard) return

    const types: StudyChallengeType[] = ['cloze', 'listen', 'recognition']
    const picked = types[Math.floor(Math.random() * types.length)]
    setCurrentChallengeType(picked)
    
    setPrecomputedChoices(generateChoices(cardToWord(currentCard)))
    challengeStartTimeRef.current = Date.now()
    setTimerSeconds(STUDY_SESSION_DEFAULTS.TIMER_SECONDS)
    setPhase('CHALLENGING')

    timerTickRef.current = setInterval(() => {
      setTimerSeconds(s => Math.max(0, s - 1))
    }, 1000)

    timeoutRef.current = setTimeout(() => {
      handleChallengeTimeout()
    }, STUDY_SESSION_DEFAULTS.TIMEOUT_MS)

    return () => {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
      if (timerTickRef.current) { clearInterval(timerTickRef.current); timerTickRef.current = null }
    }
  }, [phase, currentCard, cardToWord])

  const handleChallengeTimeout = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
    if (timerTickRef.current) { clearInterval(timerTickRef.current); timerTickRef.current = null }

    const previews = computeIntervalPreviews(
      currentProgress ?? createInitialProgress(''),
      srsIntensity,
    )

    setSuggestedRating(2) // Hard
    setIntervalPreviews(previews)
    setPhase('RATING')
  }, [currentProgress, srsIntensity])

  const handleChallengeSubmit = useCallback((isCorrect: boolean) => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
    if (timerTickRef.current) { clearInterval(timerTickRef.current); timerTickRef.current = null }

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
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
    if (timerTickRef.current) { clearInterval(timerTickRef.current); timerTickRef.current = null }
    
    const previews = computeIntervalPreviews(
      currentProgress ?? createInitialProgress(currentCard?.id || ''),
      srsIntensity,
    )
    
    setSuggestedRating(null)
    setIntervalPreviews(previews)
    setPhase('RATING')
  }, [currentCard?.id, currentProgress, srsIntensity])

  const handleRateInternal = useCallback((rating: SrsRating) => {
    if (timerTickRef.current) { clearInterval(timerTickRef.current); timerTickRef.current = null }
    setPhase('FLIPPED')
    setSuggestedRating(null)
    setIntervalPreviews([])
    setTimerSeconds(STUDY_SESSION_DEFAULTS.TIMER_SECONDS)
    // Delay slightly to allow state to settle before next card loads
    setTimeout(() => onRate(rating), 0)
  }, [onRate])

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
