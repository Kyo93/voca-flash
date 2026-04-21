import { useEffect, useCallback, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFlashcard } from '../hooks/useFlashcard'
import { speak, stop } from '../lib/tts'
import { useAuth } from '../contexts/AuthContext'
import StudyPrepScreen from '../components/StudyPrepScreen'
import SRSButtons from '../components/SRSButtons'
import { useNotebook } from '../hooks/useNotebook'
import NoteDrawer from '../components/NoteDrawer'
import FlashcardFront from '../components/study/FlashcardFront'
import FlashcardBack from '../components/study/FlashcardBack'
import StudyComplete from '../components/study/StudyComplete'
import ChallengingScreen from '../components/study/ChallengingScreen'
import { useStudySessionMode } from '../hooks/useStudySessionMode'
import { DESIGN_TOKENS } from '../lib/tokens'

export default function StudyPage() {
  const { profile } = useAuth()
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
    prepStats,
    initialize,
    startSession,
    flip,
    rate,
    markLearned,
  } = useFlashcard()

  const { isSaved, toggle, getNote, updateNote } = useNotebook()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

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

  const initializedTopicRef = useRef<string | undefined>(null)

  useEffect(() => {
    if (initializedTopicRef.current !== topic) {
      initialize(topic)
      initializedTopicRef.current = topic
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

  const onStartCallback = useCallback((includeMastered: boolean) => {
    startSession(roadmapId, topicId || '', includeMastered)
  }, [startSession, roadmapId, topicId])

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
          loading={isLoading}
          onStart={onStartCallback}
          onBack={() => window.history.back()}
        />
      </div>
    )
  }

  if (isComplete || !currentCard) {
    return (
      <div className="flex flex-col items-center justify-center pt-8 min-h-[80vh]">
        <StudyComplete total={total} />
      </div>
    )
  }

  const showCardBack = isFlipped && phase !== 'CHALLENGING' && phase !== 'READY_FOR_QUIZ'

  return (
    <div className="flex flex-col items-center justify-center pt-8 min-h-[80vh] px-4 pb-12">
      <div className="max-w-md w-full space-y-8">
        
        {/* Session Progress */}
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex justify-between items-end">
            <span className="font-label text-xs uppercase tracking-widest text-secondary font-bold">Daily Mastery</span>
            <span className="font-label text-xs text-outline">{remaining} / {total} Words</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className={`h-full bg-secondary-fixed-dim kinetic-pulse transition-all duration-500`}
              style={{ width: `${((total - remaining) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content Area */}
        {phase === 'CHALLENGING' ? (
          <ChallengingScreen
            timerSeconds={timerSeconds}
            currentChallengeType={currentChallengeType}
            word={word!}
            precomputedChoices={precomputedChoices}
            onSubmit={handleChallengeSubmit}
            onSkip={handleSkipChallenge}
          />
        ) : (
          <div className="group relative">
            <div
              onClick={!isFlipped ? flip : undefined}
              className={`perspective-1000 w-full aspect-3/4 ${!isFlipped ? 'cursor-pointer' : ''}`}
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
            <div className={`absolute -z-20 -bottom-4 -right-4 w-full h-full bg-primary/5 ${DESIGN_TOKENS.RADIUS['2XL']} border border-primary/10 pointer-events-none`} />
          </div>
        )}

        {/* Actions Area */}
        <div className="flex flex-col gap-4 mt-8">
          {!isFlipped ? (
            <>
              <button
                onClick={flip}
                className={`w-full oceanic-pulse text-on-primary font-headline font-bold py-4 ${DESIGN_TOKENS.RADIUS.XL} ${DESIGN_TOKENS.SHADOW.LG} hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3`}
              >
                <span className="tracking-wide">Show Answer</span>
                <span className="material-symbols-outlined">visibility</span>
              </button>
              <button
                onClick={markLearned}
                className={`w-full bg-secondary text-on-secondary font-headline font-bold py-4 ${DESIGN_TOKENS.RADIUS.XL} ${DESIGN_TOKENS.SHADOW.MD} hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3`}
              >
                <span className="tracking-wide">Mark as Learned</span>
                <span className="material-symbols-outlined">check_circle</span>
              </button>
            </>
          ) : phase === 'RATING' ? (
            <div className="flex flex-col items-center">
              {suggestedRating !== null && (
                <p className="text-center text-primary text-xs mb-3 font-bold tracking-widest uppercase">
                  Hệ thống gợi ý
                </p>
              )}
              <SRSButtons
                onRate={handleRate}
                suggestedRating={suggestedRating}
                intervalPreviews={intervalPreviews}
              />
            </div>
          ) : showCardBack ? (
            <button
              onClick={handleNextToChallenge}
              className={`w-full oceanic-pulse text-on-primary font-headline font-bold py-4 ${DESIGN_TOKENS.RADIUS.XL} ${DESIGN_TOKENS.SHADOW.LG} hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3`}
            >
              <span className="tracking-wide">Next</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          ) : null}
        </div>
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