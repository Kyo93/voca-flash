import { useEffect, useCallback, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFlashcard } from '../hooks/useFlashcard'
import { speak, stop } from '../lib/tts'
import { generateChoices } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import StudyPrepScreen from '../components/StudyPrepScreen'
import type { Card } from '../lib/srs'
import { SrsRating, mapTestResultToRating, computeIntervalPreviews, createInitialProgress, type StudyChallengeType, type IntervalPreview } from '../lib/srs'
import SRSButtons from '../components/SRSButtons'
import StudyChallengeShell from '../components/StudyChallengeShell'
import { useNotebook } from '../hooks/useNotebook'
import NoteDrawer from '../components/NoteDrawer'
import AudioButton from '../components/common/AudioButton'
import FlashcardFront from '../components/study/FlashcardFront'
import FlashcardBack from '../components/study/FlashcardBack'
import StudyComplete from '../components/study/StudyComplete'
import { useStudySessionMode } from '../hooks/useStudySessionMode'








type StudyPhase = 'FLIPPED' | 'READY_FOR_QUIZ' | 'CHALLENGING' | 'RATING'

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
  const [pendingWordId, setPendingWordId] = useState<string | null>(null)

  const handleToggleNotebook = useCallback(async () => {
    if (!currentCard) return
    
    // If saving (not currently saved), open drawer
    const alreadySaved = isSaved(currentCard.id)
    if (!alreadySaved) {
      setPendingWordId(currentCard.id)
      setIsDrawerOpen(true)
    }
    
    await toggle(currentCard.id)
  }, [currentCard, isSaved, toggle])

  const handleSaveNote = useCallback(async (note: string) => {
    if (!currentCard) return
    await updateNote(currentCard.id, note)
  }, [currentCard, updateNote])

  // Track initialized state to prevent redundant resets on re-renders or identity changes
  const initializedTopicRef = useRef<string | undefined>(null)

  useEffect(() => {
    // Only initialize if we haven't for this specific topic yet
    if (initializedTopicRef.current !== topic) {
      initialize(topic)
      initializedTopicRef.current = topic
    }
  }, [initialize, topic])

  useEffect(() => {
    return () => stop()
  }, [])

  // Tự động phát âm khi thẻ xuất hiện hoặc khi lật thẻ
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
    currentCard,
    currentProgress,
    srsIntensity: profile?.srs_intensity,
    onRate: rate
  })


  // ── End Study Post-Flip Challenge ────────────────────────────

  const onStartCallback = useCallback((includeMastered: boolean) => {
    startSession(roadmapId, topicId || '', includeMastered)
  }, [startSession, roadmapId, topicId])

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

  // Derive whether to show the card back (flipped)
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
              className="h-full bg-secondary-fixed-dim kinetic-pulse transition-all duration-500"
              style={{ width: `${((total - remaining) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content Area */}
        {phase === 'CHALLENGING' ? (
          // ── CHALLENGING: quiz with timer countdown + shrinking border ──
          <div
            className="w-full relative rounded-2xl overflow-hidden bg-surface-container-lowest"
            style={{ padding: '0' }}
          >
            {/* Snake border */}
            <div
              className="absolute top-0 left-0 h-[3px] rounded-full transition-all duration-1000 ease-linear"
              style={{
                backgroundColor: timerSeconds <= 10 ? 'var(--color-error, #B3261E)' : 'var(--color-secondary, #829460)',
                width: `${(timerSeconds / 30) * 100}%`,
                boxShadow: `0 0 8px ${timerSeconds <= 10 ? 'var(--color-error, #B3261E)' : 'var(--color-secondary, #829460)'}`,
              }}
            />
            <div
              className="absolute top-0 right-0 w-[3px] h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                backgroundColor: timerSeconds <= 10 ? 'var(--color-error, #B3261E)' : 'var(--color-secondary, #829460)',
                height: `${(timerSeconds / 30) * 100}%`,
                boxShadow: `0 0 8px ${timerSeconds <= 10 ? 'var(--color-error, #B3261E)' : 'var(--color-secondary, #829460)'}`,
              }}
            />
            <div
              className="absolute bottom-0 right-0 h-[3px] rounded-full transition-all duration-1000 ease-linear"
              style={{
                backgroundColor: timerSeconds <= 10 ? 'var(--color-error, #B3261E)' : 'var(--color-secondary, #829460)',
                width: `${(timerSeconds / 30) * 100}%`,
                boxShadow: `0 0 8px ${timerSeconds <= 10 ? 'var(--color-error, #B3261E)' : 'var(--color-secondary, #829460)'}`,
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-[3px] h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                backgroundColor: timerSeconds <= 10 ? 'var(--color-error, #B3261E)' : 'var(--color-secondary, #829460)',
                height: `${(timerSeconds / 30) * 100}%`,
                boxShadow: `0 0 8px ${timerSeconds <= 10 ? 'var(--color-error, #B3261E)' : 'var(--color-secondary, #829460)'}`,
              }}
            />

            {/* Timer bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-xl ${timerSeconds <= 10 ? 'text-error animate-pulse' : 'text-secondary'}`}>timer</span>
                <span className={`font-headline font-black text-lg tabular-nums ${timerSeconds <= 10 ? 'text-error animate-pulse' : 'text-secondary'}`}>
                  {timerSeconds}s
                </span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                currentChallengeType === 'cloze'
                  ? 'text-primary bg-primary/8 border-primary/20'
                  : currentChallengeType === 'listen'
                    ? 'text-secondary bg-secondary/8 border-secondary/20'
                    : 'text-tertiary bg-tertiary/8 border-tertiary/20'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {currentChallengeType === 'cloze' ? 'Điền từ' : currentChallengeType === 'listen' ? 'Nghe lại' : 'Chọn nghĩa'}
              </span>
            </div>

            {/* Challenge body */}
            <div className="bg-surface-container-lowest p-6">
              <StudyChallengeShell
                type={currentChallengeType}
                word={word!}
                choices={precomputedChoices}
                onSubmit={handleChallengeSubmit}
              />
              <button
                onClick={handleSkipChallenge}
                className="mt-6 text-center text-outline text-xs hover:text-primary transition-colors tracking-widest font-bold uppercase w-full"
              >
                Bỏ qua quiz → tự đánh giá
              </button>
            </div>
          </div>
        ) : (
          // ── CARD: front OR back ──
          <div className="group relative">
            <div
              onClick={!isFlipped ? flip : undefined}
              className={`perspective-1000 w-full aspect-[3/4] ${!isFlipped ? 'cursor-pointer' : ''}`}
            >
              <div
                className={`preserve-3d transition-all duration-700 w-full h-full relative ${
                  showCardBack ? 'rotate-y-180' : ''
                }`}
              >
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
            <div className="absolute -z-20 -bottom-4 -right-4 w-full h-full bg-primary/5 rounded-xl border border-primary/10 pointer-events-none" />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-4 mt-8">
          {!isFlipped ? (
            <>
              {/* Show Answer */}
              <button
                onClick={flip}
                className="w-full oceanic-pulse text-on-primary font-headline font-bold py-4 rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <span className="tracking-wide">Show Answer</span>
                <span className="material-symbols-outlined">visibility</span>
              </button>
              <button
                onClick={markLearned}
                className="w-full bg-secondary text-on-secondary font-headline font-bold py-4 rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <span className="tracking-wide">Mark as Learned</span>
                <span className="material-symbols-outlined">check_circle</span>
              </button>
            </>
          ) : phase === 'RATING' ? (
            // ── RATING: SRS buttons ──
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
            // ── FLIPPED ──
            <button
              onClick={handleNextToChallenge}
              className="w-full oceanic-pulse text-on-primary font-headline font-bold py-4 rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
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
        onClose={() => {
          setIsDrawerOpen(false)
          setPendingWordId(null)
        }}
        onSave={handleSaveNote}
        initialNote={currentCard ? getNote(currentCard.id) : ''}
        word={currentCard?.front || ''}
      />
    </div>
  )
}