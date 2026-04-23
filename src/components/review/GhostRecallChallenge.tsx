import { useEffect, useState, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Word } from '../../lib/types'
import { speak, stop } from '../../lib/tts'
import { useTextChallengeInput } from '../../hooks/useTextChallengeInput'
import ChallengeTextInput from './ChallengeTextInput'

interface GhostRecallChallengeProps {
  word: Word
  onSubmit: (isCorrect: boolean, isSkipped?: boolean) => void
}

export default memo(function GhostRecallChallengeInner({ word, onSubmit }: GhostRecallChallengeProps) {
  const { t } = useTranslation()
  const [showHint, setShowHint] = useState(false)
  const { input, setInput, isWrong, inputRef, handleSubmit } = useTextChallengeInput(
    word.word,
    (isCorrect) => onSubmit(isCorrect),
  )

  useEffect(() => {
    speak(word.word)
    return () => stop()
  }, [word.word])

  const getHintWord = () => {
    const w = word.word
    if (!showHint) return '●'.repeat(w.length)
    return w[0] + '●'.repeat(w.length - 1)
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-surface-container-low rounded-2xl p-6 mb-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/8 border border-primary/15">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {t('challenges.listen')}
          </span>
          <button
            onClick={() => speak(word.word)}
            className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary flex items-center justify-center border border-outline-variant/10 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-xl">volume_up</span>
          </button>
        </div>

        {/* Definition Blur — press and hold to reveal */}
        <div className="flex justify-center">
          <div
            className="relative w-full max-w-sm mx-auto cursor-pointer select-none"
            onMouseDown={() => setShowHint(true)}
            onMouseUp={() => setShowHint(false)}
            onMouseLeave={() => setShowHint(false)}
            onTouchStart={() => setShowHint(true)}
            onTouchEnd={() => setShowHint(false)}
          >
            <div className={`text-4xl font-black font-headline text-center transition-all duration-500 ${!showHint ? 'blur-md opacity-30' : 'blur-0 opacity-100'}`}>
              {word.definition}
            </div>
            {!showHint && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2">
                <span className="material-symbols-outlined text-primary/30 text-3xl">visibility_off</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-outline">{t('arena.holdToReveal')}</span>
              </div>
            )}
          </div>
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
          placeholder={getHintWord()}
          placeholderClassName="placeholder:font-mono"
        />
      </form>

      {/* Hint Toggle */}
      <button
        onClick={() => setShowHint(h => !h)}
        className="mt-6 text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors mb-12"
      >
        {showHint ? `▲ ${t('arena.hideHint')}` : `▼ ${t('arena.showHint')}`}
      </button>

    </div>
  )
})
