import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useFlashcard } from '../hooks/useFlashcard'
import { speak, stop } from '../lib/tts'
import Sidebar from '../components/Sidebar'
import type { Card } from '../lib/srs'

interface AudioButtonProps {
  text: string
  slow?: boolean
}

function AudioButton({ text, slow }: AudioButtonProps) {
  const [speaking, setSpeaking] = useState(false)

  const handleSpeak = () => {
    speak(text, slow)
    setSpeaking(true)
    setTimeout(() => setSpeaking(false), 1500)
  }

  return (
    <button
      onClick={handleSpeak}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors shadow-sm active:scale-95 group"
      title={slow ? 'Nghe chậm' : 'Phát âm'}
    >
      <span className="material-symbols-outlined text-[18px] text-primary">
        {slow ? 'slow_motion_video' : 'volume_up'}
      </span>
    </button>
  )
}

function FlashcardFront({ card }: { card: Card }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0px_12px_32px_rgba(26,27,33,0.06)] overflow-hidden flex flex-col border border-outline-variant/10">
      {/* Visual area */}
      <div className="w-full aspect-[4/3] overflow-hidden bg-surface-container-low relative">
        <img
          alt={card.front}
          className="w-full h-full object-cover"
          src={`https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-8 space-y-6">
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

        {/* Asymmetric divider */}
        <div className="w-12 h-1 bg-secondary-fixed rounded-full" />

        {/* Example */}
        {card.example && (
          <div className="space-y-3">
            <span className="font-label text-[10px] uppercase tracking-widest text-outline font-bold block">
              Contextual Usage
            </span>
            <blockquote className="text-on-surface-variant leading-relaxed text-lg italic border-l-2 border-surface-container-highest pl-4 py-1">
              "{card.example}"
            </blockquote>
          </div>
        )}
      </div>

      {/* Aesthetic accent */}
      <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full bg-secondary/5 rounded-xl border border-secondary/10" />
    </div>
  )
}

function FlashcardBack({ card }: { card: Card }) {
  return (
    <div className="w-full max-w-md aspect-[3/4] bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col items-center text-center p-8 transition-all border border-outline-variant/10 relative">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #00236f 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 w-full h-full flex flex-col">
        {/* English Word */}
        <div className="flex flex-col items-center mb-8">
          <span className="text-secondary font-label font-bold tracking-widest text-xs uppercase mb-2">English Word</span>
          <h2 className="text-primary font-headline text-2xl font-bold tracking-tight">{card.front}</h2>
          <div className="mt-2 text-outline text-sm flex items-center justify-center gap-3">
            <span>/{card.front}/</span>
            <div className="flex items-center gap-1.5 ml-2">
              <AudioButton text={card.front} />
              <AudioButton text={card.front} slow />
            </div>
          </div>
        </div>

        {/* Oceanic divider */}
        <div className="w-12 h-1 oceanic-gradient rounded-full mx-auto mb-8" />

        {/* Vietnamese meaning */}
        <div className="flex-grow flex flex-col justify-center">
          <p className="text-on-surface font-headline text-3xl font-extrabold leading-tight mb-6">
            {card.back}
          </p>

          {/* Context sentence */}
          {card.example && (
            <div className="bg-surface-container-low p-6 rounded-lg text-left">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-lg mt-1">format_quote</span>
                <div className="space-y-3">
                  <p className="text-on-surface-variant font-body text-sm italic leading-relaxed">
                    "{card.example}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card footer */}
        <div className="mt-8 pt-6 border-t border-outline-variant/15 flex justify-between items-center text-outline text-[10px] font-bold uppercase tracking-widest">
          <span>Deck: {card.topic}</span>
        </div>
      </div>
    </div>
  )
}

function SRSButtons({ onRate }: { onRate: (rating: 1 | 2 | 3) => void }) {
  const { t } = useTranslation()

  return (
    <div className="w-full max-w-md grid grid-cols-3 gap-4 px-2">
      {/* Hard */}
      <button
        onClick={() => onRate(1)}
        className="group flex flex-col items-center gap-2"
      >
        <div className="w-full py-4 bg-error-container text-on-error-container font-headline font-bold rounded-lg border border-error/10 group-active:scale-95 transition-all flex items-center justify-center">
          {t('srs.hard')}
        </div>
        <span className="text-outline text-[10px] font-bold uppercase tracking-tighter">{t('srs.interval1d')}</span>
      </button>

      {/* Good */}
      <button
        onClick={() => onRate(2)}
        className="group flex flex-col items-center gap-2"
      >
        <div className="w-full py-4 bg-primary text-on-primary font-headline font-bold rounded-lg group-active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-primary/20">
          {t('srs.good')}
        </div>
        <span className="text-outline text-[10px] font-bold uppercase tracking-tighter">{t('srs.interval4d')}</span>
      </button>

      {/* Easy */}
      <button
        onClick={() => onRate(3)}
        className="group flex flex-col items-center gap-2"
      >
        <div className="w-full py-4 bg-secondary-fixed text-on-secondary-fixed font-headline font-bold rounded-lg group-active:scale-95 transition-all flex items-center justify-center border border-secondary/10">
          {t('srs.easy')}
        </div>
        <span className="text-outline text-[10px] font-bold uppercase tracking-tighter">{t('srs.interval7d')}</span>
      </button>
    </div>
  )
}

function StudyComplete({ total }: { total: number }) {
  const { t } = useTranslation()

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
        <a href="/study" className="px-8 py-4 bg-secondary text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all">
          Học thêm
        </a>
      </div>
    </div>
  )
}

export default function StudyPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const topic = searchParams.get('topic') || undefined

  const {
    currentCard,
    total,
    remaining,
    isFlipped,
    isComplete,
    isLoading,
    initialize,
    flip,
    rate,
  } = useFlashcard()

  useEffect(() => {
    initialize(topic)
    return () => stop()
  }, [initialize, topic])

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-surface">
        <Sidebar />
        <main className="ml-64 flex-1 flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
        </main>
      </div>
    )
  }

  if (isComplete || !currentCard) {
    return (
      <div className="flex min-h-screen bg-surface">
        <Sidebar />
        <main className="ml-64 flex-1">
          <StudyComplete total={total} />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="ml-64 flex-grow flex flex-col items-center justify-center pb-24 px-4 sm:px-6">
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

          {/* Flashcard — flips between front and back */}
          <div className="group relative mb-4">
            <div
              onClick={!isFlipped ? flip : undefined}
              className={`perspective-1000 cursor-pointer ${isFlipped ? '' : 'cursor-pointer'}`}
            >
              <div
                className={`preserve-3d transition-all duration-500 ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front */}
                <div className={`backface-hidden ${isFlipped ? 'hidden' : 'block'}`}>
                  <FlashcardFront card={currentCard} />
                </div>

                {/* Back */}
                <div className={`backface-hidden ${isFlipped ? 'block' : 'hidden'}`}>
                  <FlashcardBack card={currentCard} />
                </div>
              </div>
            </div>

            {/* Aesthetic accent */}
            <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full bg-secondary/5 rounded-xl border border-secondary/10" />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 mt-8">
            {!isFlipped ? (
              <button
                onClick={flip}
                className="w-full oceanic-gradient text-on-primary font-headline font-bold py-4 rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <span className="tracking-wide">{t('flashcard.showAnswer')}</span>
                <span className="material-symbols-outlined">visibility</span>
              </button>
            ) : (
              <SRSButtons onRate={(rating) => rate((rating as 1 | 2 | 3) as 1 | 2 | 3)} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
