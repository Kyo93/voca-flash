import { useEffect, useCallback, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFlashcard } from '../hooks/useFlashcard'
import { speak, stop } from '../lib/tts'
import { useAuth } from '../contexts/AuthContext'
import StudyPrepScreen from '../components/StudyPrepScreen'
import type { Card } from '../lib/srs'
import { SrsRating, mapTestResultToRating, computeIntervalPreviews, createInitialProgress, type StudyChallengeType, type IntervalPreview } from '../lib/srs'
import SRSButtons from '../components/SRSButtons'
import StudyChallengeShell from '../components/StudyChallengeShell'
import type { Word } from '../lib/types'

interface AudioButtonProps {
  text: string
  slow?: boolean
}

function AudioButton({ text, slow }: AudioButtonProps) {
  const [speaking, setSpeaking] = useState(false)

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    speak(text, slow)
    setSpeaking(true)
    setTimeout(() => setSpeaking(false), 1500)
  }

  return (
    <button
      onClick={handleSpeak}
      className="tactile-btn p-3 bg-surface-container-high hover:bg-surface-container-highest text-primary rounded-lg transition-all flex items-center justify-center border border-outline-variant/10 active:scale-95 group"
      title={slow ? 'Nghe chậm' : 'Phát âm'}
    >
      <span className={`material-symbols-outlined text-2xl ${speaking ? 'animate-pulse scale-110' : ''}`}>
        {slow ? 'slow_motion_video' : 'volume_up'}
      </span>
    </button>
  )
}

function FlashcardFront({ card }: { card: Card }) {
  const imageUrl = card.image_url || `https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80`
  const imagePosition = card.image_position || 'center'

  return (
    <div className="w-full h-full bg-surface-container-lowest rounded-xl shadow-[0px_12px_32px_rgba(26,27,33,0.06)] overflow-hidden flex flex-col border border-outline-variant/10 relative">
      {/* 4:3 Visual Context Image */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-surface-container-low relative">
        <img
          alt={card.front}
          className="w-full h-full object-cover"
          src={imageUrl}
          style={{ objectPosition: imagePosition }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/40 to-transparent" />
      </div>

      {/* Content Section */}
      <div className="p-8 space-y-6 flex-grow flex flex-col justify-start">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight">{card.front}</h1>
            <p className="text-secondary font-medium tracking-wide text-lg">/{card.front}/</p>
          </div>
          <div className="flex gap-2">
            <AudioButton text={card.front} />
            <AudioButton text={card.front} slow />
          </div>
        </div>

        {/* Asymmetric Divider */}
        <div className="w-12 h-1 bg-secondary-fixed rounded-full shrink-0" />

        {/* Contextual Usage */}
        {card.example && (
          <div className="space-y-3">
            <span className="font-label text-[10px] uppercase tracking-widest text-outline font-bold block">
              Contextual usage
            </span>
            <blockquote className="text-on-surface-variant leading-relaxed text-lg italic border-l-2 border-surface-container-highest pl-4 py-1">
              &ldquo;{card.example}&rdquo;
            </blockquote>
          </div>
        )}
      </div>
    </div>
  )
}

function FlashcardBack({ card }: { card: Card }) {
  return (
    <div className="relative w-full h-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col items-center text-center p-12 transition-all border border-outline-variant/10">
      {/* Background Texture (Subtle) */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #00236f 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 w-full h-full flex flex-col">
        {/* English Word (Small, Above) */}
        <div className="flex flex-col items-center mt-2 mb-4">
          <span className="text-secondary font-label font-bold tracking-widest text-[10px] uppercase mb-1">English Word</span>
          <h2 className="text-primary font-headline text-3xl font-bold tracking-tight">{card.front}</h2>
          <div className="mt-1 text-outline text-xs">
            <div className="flex items-center justify-center gap-3">
              <span>/{card.front}/</span>
              <div className="flex items-center gap-1.5 ml-1">
                <AudioButton text={card.front} />
                <AudioButton text={card.front} slow />
              </div>
            </div>
          </div>
        </div>

        {/* Spacer Line */}
        <div className="w-12 h-1 oceanic-pulse rounded-full mx-auto mb-10"></div>

        {/* Vietnamese Meaning (Prominent) - Center heavily */}
        <div className="flex-grow flex flex-col items-center">
          <span className="text-secondary font-label font-bold tracking-widest text-[10px] uppercase mb-2">Meaning</span>
          <p className="text-on-surface font-headline text-[32px] font-black leading-tight mb-8">
            {card.back}
          </p>

          {/* Context Sentence */}
          {card.example && (
            <div className="bg-surface-container-low p-6 rounded-xl text-left w-full mt-auto mb-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-lg mt-0.5 opacity-40">format_quote</span>
                <div className="space-y-2">
                  <p className="text-on-surface-variant font-body text-sm italic leading-relaxed">
                    &ldquo;{card.example}&rdquo;
                  </p>
                  {card.example_vi && (
                    <p className="text-on-surface-variant font-body text-xs leading-relaxed border-t border-outline-variant/10 pt-2 oceanic-pulse oceanic-glow opacity-70">
                      &ldquo;{card.example_vi}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer / Metadata */}
        <div className="mt-auto pt-6 border-t border-outline-variant/15 flex justify-between items-center text-outline text-[10px] font-bold uppercase tracking-widest">
          <span className="text-stone-300 italic">Không có chủ đề</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            SRS READY
          </span>
        </div>
      </div>
    </div>
  )
}

function StudyComplete({ total }: { total: number }) {
  const [searchParams] = useSearchParams()

  // Preserve current topic/roadmap context
  const currentQuery = searchParams.toString()
  const studyLink = currentQuery ? `/study?${currentQuery}` : '/study'

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="w-32 h-32 rounded-full bg-secondary-container flex items-center justify-center mb-8 shadow-xl">
        <span className="material-symbols-outlined text-6xl text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
      </div>
      <h2 className="text-4xl font-black text-on-surface mb-4">Hoàn thành!</h2>
      <p className="text-xl text-on-surface-variant mb-2">Bạn đã ôn tập {total} từ vựng</p>
      <p className="text-on-surface-variant mb-10">Hãy quay lại sau để ôn tập thêm!</p>
      <div className="flex gap-4">
        <a href="/dashboard" className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all">
          Về Dashboard
        </a>
        <a href={studyLink} className="px-8 py-4 bg-secondary text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all">
          Học thêm
        </a>
      </div>
    </div>
  )
}

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

  useEffect(() => {
    initialize(topic)
    return () => stop()
  }, [initialize, topic])

  // Tự động phát âm khi thẻ xuất hiện hoặc khi lật thẻ
  useEffect(() => {
    if (currentCard && !isLoading && !isComplete) {
      if (profile?.auto_play_audio !== false) {
        speak(currentCard.front)
      }
    }
  }, [currentCard?.id, isFlipped, isLoading, isComplete, profile?.auto_play_audio])

  // ── Study Post-Flip Challenge state ──────────────────────────
  const [phase, setPhase] = useState<StudyPhase>('FLIPPED')
  const [suggestedRating, setSuggestedRating] = useState<SrsRating | null>(null)
  const [intervalPreviews, setIntervalPreviews] = useState<IntervalPreview[]>([])
  const challengeStartTimeRef = useRef<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Convert Card (useFlashcard) → Word shape for challenge components
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardToWord = (card: Card): Word => ({
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
  } as Word)

  // Reset phase when card changes
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setPhase('FLIPPED')
    setSuggestedRating(null)
    setIntervalPreviews([])
  }, [currentCard?.id])

  // READY_FOR_QUIZ → auto-start challenge after card back is briefly shown
  useEffect(() => {
    if (phase !== 'READY_FOR_QUIZ' || !currentCard) return

    challengeStartTimeRef.current = Date.now()
    setPhase('CHALLENGING')

    timeoutRef.current = setTimeout(() => {
      handleChallengeTimeout()
    }, 30_000)
  }, [phase])

  // Handle challenge completion
  const handleChallengeSubmit = useCallback((isCorrect: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    const responseTime = Date.now() - challengeStartTimeRef.current
    const suggested = mapTestResultToRating(isCorrect, responseTime)
    const previews = computeIntervalPreviews(
      currentProgress ?? createInitialProgress(''),
      profile?.srs_intensity ?? 1.0,
    )

    setSuggestedRating(suggested)
    setIntervalPreviews(previews)
    setPhase('RATING')
  }, [currentProgress, profile?.srs_intensity])

  // Timeout → auto-challenging with Hard suggestion
  const handleChallengeTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    const previews = computeIntervalPreviews(
      currentProgress ?? createInitialProgress(''),
      profile?.srs_intensity ?? 1.0,
    )

    // Hard suggestion (rating=2) on timeout
    const hardPreview = previews.find(p => p.rating === 2)

    setSuggestedRating(2)
    setIntervalPreviews(previews)
    setPhase('RATING')
    void hardPreview // used via display, not needed as separate var
  }, [currentProgress, profile?.srs_intensity])

  // Skip → flashcard back with NO suggestion (user self-rates)
  const handleSkipChallenge = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setSuggestedRating(null)
    setIntervalPreviews([])
    setPhase('RATING')
  }, [])

  // User clicks rating → rate card + next card
  const handleRate = useCallback((rating: SrsRating) => {
    setPhase('FLIPPED')
    setSuggestedRating(null)
    setIntervalPreviews([])
    setTimeout(() => rate(rating), 0)
  }, [rate])

  // User clicks "Next" on flipped card → start challenge
  const handleNextToChallenge = useCallback(() => {
    setPhase('READY_FOR_QUIZ')
  }, [])

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
          // ── CHALLENGING: quiz REPLACES flashcard ──
          <div className="w-full flex flex-col">
            {(() => {
              const challengeType = (['cloze', 'listen', 'recognition'][Math.floor(Math.random() * 3)] as StudyChallengeType)
              return (
                <StudyChallengeShell
                  type={challengeType}
                  word={cardToWord(currentCard)}
                  onSubmit={handleChallengeSubmit}
                />
              )
            })()}
            <button
              onClick={handleSkipChallenge}
              className="mt-6 text-center text-outline text-xs hover:text-primary transition-colors tracking-widest font-bold uppercase"
            >
              Bỏ qua quiz → tự đánh giá
            </button>
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
                  <FlashcardBack card={currentCard} />
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
            // ── RATING: SRS buttons with suggestion (or self-rate if skip) ──
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
            // ── FLIPPED (card back shown, waiting for user to click Next) ──
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
    </div>
  )
}