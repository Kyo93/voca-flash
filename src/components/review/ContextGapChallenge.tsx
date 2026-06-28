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
            <span className="mx-1 inline-flex items-center rounded-full border-2 border-primary/25 bg-primary/8 px-3 py-1.5 font-semibold text-primary animate-pulse sm:px-5">
            _____
          </span>
        )}
      </span>
    ))
  })()

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="mb-5 flex w-full flex-col gap-2 rounded-2xl bg-surface-container-low p-4 text-center sm:mb-8 sm:p-6">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-widest text-secondary bg-secondary/8 border border-secondary/15 self-center">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          {t('challenges.cloze')}
        </span>
      </div>

      {/* Sentence with gap */}
      <div className="relative mb-5 w-full overflow-hidden rounded-2xl border-2 border-outline-variant/15 bg-surface-container-low p-5 sm:mb-8 sm:p-8">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/40 rounded-full" />
        <div className="text-center font-headline text-xl font-medium leading-relaxed text-on-surface sm:text-2xl">
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
          textSize="text-xl sm:text-2xl"
        />
      </form>

      {/* Meaning hint */}
      <div className="mt-5 flex w-full items-center gap-3 text-center sm:mt-8">
        <div className="h-px flex-1 bg-outline-variant/20" />
        <span className="text-[9px] font-medium uppercase tracking-widest text-outline shrink-0">{t('arena.meaningHint')}</span>
        <div className="h-px flex-1 bg-outline-variant/20" />
      </div>
      <p className="mb-6 mt-3 text-center font-body text-base italic leading-relaxed text-on-surface-variant sm:mb-12 sm:text-lg">
        &ldquo;{word.definition}&rdquo;
      </p>

    </div>
  )
}
