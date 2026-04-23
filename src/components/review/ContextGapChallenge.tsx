import { useTranslation } from 'react-i18next'
import { Word } from '../../lib/types'
import { useTextChallengeInput } from '../../hooks/useTextChallengeInput'
import ChallengeTextInput from './ChallengeTextInput'

interface ContextGapChallengeProps {
  word: Word
  onSubmit: (isCorrect: boolean, isSkipped?: boolean) => void
}

export default function ContextGapChallenge({ word, onSubmit }: ContextGapChallengeProps) {
  const { t } = useTranslation()
  const { input, setInput, isWrong, inputRef, handleSubmit } = useTextChallengeInput(
    word.word,
    (isCorrect) => onSubmit(isCorrect),
  )

  const gappedSentence = (() => {
    if (!word.example) return null
    const parts = word.example.split(new RegExp(`\\b${word.word}\\b`, 'gi'))
    return parts.map((part, i, arr) => (
      <span key={i} className="inline">
        {part}
        {i < arr.length - 1 && (
          <span className="inline-flex items-center mx-1 px-5 py-1.5 bg-primary/8 border-2 border-primary/25 rounded-full text-primary font-black animate-pulse">
            _____
          </span>
        )}
      </span>
    ))
  })()

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-surface-container-low rounded-2xl p-6 mb-8 flex flex-col gap-2 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/8 border border-secondary/15 self-center">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          {t('challenges.cloze')}
        </span>
      </div>

      {/* Sentence with gap */}
      <div className="w-full bg-surface-container-low rounded-2xl border-2 border-outline-variant/15 p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/40 rounded-full" />
        <div className="text-2xl font-bold font-headline text-on-surface leading-relaxed text-center">
          {gappedSentence ?? (
            <span className="text-outline italic">{t('arena.noExample')}</span>
          )}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm relative">
        <ChallengeTextInput
          ref={inputRef}
          value={input}
          onChange={setInput}
          onSubmit={() => handleSubmit()}
          isWrong={isWrong}
          placeholder={t('arena.typeMissing')}
          textSize="text-2xl"
        />
      </form>

      {/* Meaning hint */}
      <div className="mt-8 w-full flex items-center gap-3 text-center">
        <div className="h-px flex-1 bg-outline-variant/20" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-outline shrink-0">{t('arena.meaningHint')}</span>
        <div className="h-px flex-1 bg-outline-variant/20" />
      </div>
      <p className="mt-3 text-center text-on-surface-variant font-body text-lg italic leading-relaxed mb-12">
        &ldquo;{word.definition}&rdquo;
      </p>

    </div>
  )
}
