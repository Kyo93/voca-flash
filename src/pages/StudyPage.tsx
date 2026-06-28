import { useEffect, useCallback, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFlashcard } from '../hooks/useFlashcard'
import { speak, stop } from '../lib/tts'
import { useAuth } from '../contexts/AuthContext'
import StudyPrepScreen from '../components/StudyPrepScreen'
import { useNotebook } from '../hooks/useNotebook'
import NoteDrawer from '../components/NoteDrawer'
import FlashcardFront from '../components/study/FlashcardFront'
import FlashcardBack from '../components/study/FlashcardBack'
import StudyComplete from '../components/study/StudyComplete'
import ChallengingScreen from '../components/study/ChallengingScreen'
import { useStudySessionMode } from '../hooks/useStudySessionMode'
import { DESIGN_TOKENS } from '../lib/tokens'
import StudyActions from '../components/study/StudyActions'
import { useCharacterCollection } from '../hooks/useCharacterCollection'
import CharacterReactionAvatar from '../components/characters/CharacterReactionAvatar'
import type { CharacterAnimationState } from '../lib/character-assets'
import type { SrsRating } from '../lib/srs'
import { SRS_RATINGS } from '../lib/constants'

export default function StudyPage() {
  const { user, profile, activeRoadmapSlug } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const topic = searchParams.get('topic') || undefined
  const topicId = searchParams.get('topicId') || undefined
  const roadmapId = searchParams.get('roadmapId') || undefined

  const {
    currentCard,
    currentProgress,
    total,
    remaining,
    isFlipped,
    isComplete,
    isLoading,
    isPrepScreen,
    prepError,
    prepStats,
    initialize,
    startSession,
    flip,
    rate,
    markLearned,
    resign,
  } = useFlashcard()

  const { isSaved, toggle, getNote, updateNote } = useNotebook()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [mascotReaction, setMascotReaction] = useState<CharacterAnimationState>('idle')
  const { collection: characterCollection } = useCharacterCollection(user?.id)

  const handleToggleNotebook = useCallback(async () => {
    if (!currentCard) return
    const alreadySaved = isSaved(currentCard.id)
    if (!alreadySaved) setIsDrawerOpen(true)
    await toggle(currentCard.id)
  }, [currentCard, isSaved, toggle])

  const handleSaveNote = useCallback(async (note: string) => {
    if (!currentCard) return
    await updateNote(currentCard.id, note)
  }, [currentCard, updateNote])

  const initializedTopicRef = useRef<string | null>(null)

  useEffect(() => {
    const initializedTopicKey = topic ?? 'all'
    if (initializedTopicRef.current !== initializedTopicKey) {
      initialize(topic)
      initializedTopicRef.current = initializedTopicKey
    }
  }, [initialize, topic])

  useEffect(() => {
    return () => stop()
  }, [])

  useEffect(() => {
    if (currentCard && !isLoading && !isComplete) {
      if (profile?.auto_play_audio !== false) {
        speak(currentCard.front)
      }
    }
  }, [currentCard?.id, isFlipped, isLoading, isComplete, profile?.auto_play_audio])

  const {
    phase,
    suggestedRating,
    intervalPreviews,
    timerSeconds,
    currentChallengeType,
    precomputedChoices,
    handleChallengeSubmit,
    handleSkipChallenge,
    handleRate,
    handleNextToChallenge,
    word
  } = useStudySessionMode({
    currentCard: currentCard ?? null,
    currentProgress: currentProgress ?? null,
    srsIntensity: profile?.srs_intensity,
    onRate: rate
  })

  const onStartCallback = useCallback((mode: 'new' | 'combined' | 'all') => {
    startSession(roadmapId, topicId || '', mode)
  }, [startSession, roadmapId, topicId])

  const handleExitPrep = useCallback(() => {
    navigate(activeRoadmapSlug ? `/library/${activeRoadmapSlug}` : '/library')
  }, [activeRoadmapSlug, navigate])

  const handleMascotReactionEnd = useCallback(() => {
    setMascotReaction('idle')
  }, [])

  const handleStudyChallengeSubmit = useCallback((isCorrect: boolean) => {
    setMascotReaction(isCorrect ? 'correct' : 'wrong')
    handleChallengeSubmit(isCorrect)
  }, [handleChallengeSubmit])

  const handleStudySkipChallenge = useCallback(() => {
    setMascotReaction('wrong')
    handleSkipChallenge()
  }, [handleSkipChallenge])

  const handleStudyRate = useCallback((rating: SrsRating) => {
    setMascotReaction(rating === SRS_RATINGS.AGAIN ? 'wrong' : 'correct')
    handleRate(rating)
  }, [handleRate])

  const handleStudyMarkLearned = useCallback(() => {
    setMascotReaction('correct')
    markLearned()
  }, [markLearned])

  // --- Guard Clauses for Loading/Prep/Completion ---

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
      </div>
    )
  }

  if (isPrepScreen) {
    return (
      <div className="flex flex-col flex-1">
        <StudyPrepScreen
          stats={prepStats}
          errorKey={prepError}
          loading={isLoading}
          onStart={onStartCallback}
          onBack={handleExitPrep}
        />
      </div>
    )
  }

  if (isComplete || !currentCard) {
    return (
      <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 pb-6 pt-4 sm:min-h-[80vh] sm:pt-8">
        <CharacterReactionAvatar
          collection={characterCollection}
          animationState="celebrate"
          animated
          size="md"
          className="pointer-events-none absolute right-6 top-8 hidden xl:block"
        />
        <StudyComplete total={total} />
      </div>
    )
  }

  const showCardBack = isFlipped && phase !== 'CHALLENGING' && phase !== 'READY_FOR_QUIZ'

  return (
    <div data-mobile-study-session className="relative flex min-h-[100dvh] flex-col items-center justify-start px-4 pt-4 sm:pt-8 pb-6 sm:min-h-[80vh] sm:pb-12">
      <CharacterReactionAvatar
        collection={characterCollection}
        animationState={mascotReaction}
        animated
        size="sm"
        className="pointer-events-none absolute right-6 top-24 hidden xl:block"
        onReactionEnd={handleMascotReactionEnd}
      />
      <div className="w-full max-w-md space-y-4 sm:space-y-8">
        {/* Header with Exit */}
        <div className="flex items-center justify-between">
          <button
            onClick={resign}
            className="flex min-h-11 min-w-11 items-center justify-center text-on-surface-variant transition-colors hover:text-primary"
            aria-label={t('study.resign')}
            title={t('study.resign')}
          >
            <span className="material-symbols-outlined text-xl leading-none">close</span>
          </button>
          
          <span className="font-label text-xs font-medium text-on-surface-variant">{t('study.wordsCount', { remaining, total })}</span>
        </div>

        <div className="pt-1 sm:pt-8">
          {/* Session Progress */}
          <div className="mb-3 flex flex-col gap-2 sm:mb-8">
            <div className="flex items-center justify-between">
              <span className="font-label text-[10px] font-medium uppercase tracking-wide text-secondary">{t('study.dailyMastery')}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
              <div
                className="h-full bg-secondary-fixed-dim kinetic-pulse transition-all duration-500"
                style={{ width: `${((total - remaining) / total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {phase === 'CHALLENGING' ? (
          <ChallengingScreen
            timerSeconds={timerSeconds}
            currentChallengeType={currentChallengeType}
            word={word!}
            precomputedChoices={precomputedChoices}
            onSubmit={handleStudyChallengeSubmit}
            onSkip={handleStudySkipChallenge}
          />
        ) : (
          <div className="group relative">
            <div
              onClick={!isFlipped ? flip : undefined}
              className={`perspective-1000 w-full h-[min(49dvh,30rem)] min-h-[20rem] sm:h-auto sm:aspect-3/4 ${!isFlipped ? 'cursor-pointer' : ''}`}
            >
              <div className={`preserve-3d transition-all duration-700 w-full h-full relative ${showCardBack ? 'rotate-y-180' : ''}`}>

                {/* Front */}
                <div className="backface-hidden w-full h-full absolute inset-0">
                  <FlashcardFront card={currentCard} />
                </div>

                {/* Back */}
                <div className="backface-hidden w-full h-full absolute inset-0 rotate-y-180">
                  <FlashcardBack
                    card={currentCard}
                    isSaved={isSaved(currentCard.id)}
                    onToggleNotebook={handleToggleNotebook}
                  />
                </div>
              </div>
            </div>

            {/* Aesthetic accent shadow */}
            <div className={`absolute -z-20 bottom-0 right-0 hidden h-full w-full bg-primary/5 sm:-bottom-4 sm:-right-4 sm:block ${DESIGN_TOKENS.RADIUS['2XL']} border border-primary/10 pointer-events-none`} />
          </div>
        )}

        <StudyActions
          isFlipped={isFlipped}
          phase={phase}
          showCardBack={showCardBack}
          suggestedRating={suggestedRating}
          intervalPreviews={intervalPreviews}
          onFlip={flip}
          onMarkLearned={handleStudyMarkLearned}
          onRate={handleStudyRate}
          onNextToChallenge={handleNextToChallenge}
        />
      </div>

      {/* Notebook Note Drawer */}
      <NoteDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveNote}
        initialNote={currentCard ? getNote(currentCard.id) : ''}
        word={currentCard?.front || ''}
      />
    </div>
  )
}
