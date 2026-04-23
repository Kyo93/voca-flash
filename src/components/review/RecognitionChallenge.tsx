import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Word } from '../../lib/types'

interface RecognitionChallengeProps {
  word: Word
  choices: string[]
  onSubmit: (isCorrect: boolean, isSkipped?: boolean) => void
}

const CHOICE_LABELS = ['A', 'B', 'C', 'D']

export default function RecognitionChallenge({ word, choices, onSubmit }: RecognitionChallengeProps) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<string | null>(null)
  const [isDone, setIsDone] = useState(false)
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')

  const handleChoice = (choice: string) => {
    if (isDone) return
    setSelected(choice)
    setIsDone(true)
    const isCorrect = choice === word.definition
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setTimeout(() => onSubmit(isCorrect), 1000)
  }

  // Keyboard shortcuts A/B/C/D
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isDone) return
      const idx = ['a', 'b', 'c', 'd'].indexOf(e.key.toLowerCase())
      if (idx !== -1 && idx < choices.length) handleChoice(choices[idx])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [choices, isDone])

  const stateOf = (choice: string) => {
    if (!isDone) return 'idle'
    if (choice === word.definition) {
      if (feedback === 'wrong') return 'reveal-correct'
      return 'correct'
    }
    if (choice === selected && feedback === 'wrong') return 'wrong'
    if (choice !== selected && choice !== word.definition) return 'dimmed'
    return 'idle'
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-surface-container-low rounded-2xl p-6 mb-8 flex flex-col gap-3 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/8 border border-secondary/15 self-center">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          {t('challenges.recognition')}
        </span>
        <h2 className="text-4xl font-black font-headline text-primary tracking-tight">{word.word}</h2>
        {word.phonetic && (
          <p className="text-secondary font-medium text-sm tracking-wide">/{word.phonetic}/</p>
        )}
      </div>

      {/* Choices */}
      <div className="w-full max-w-sm space-y-3">
        {choices.map((choice, i) => {
          const state = stateOf(choice)
          return (
            <motion.button
              key={i}
              onClick={() => handleChoice(choice)}
              disabled={isDone}
              whileHover={!isDone ? { scale: 1.01 } : {}}
              whileTap={!isDone ? { scale: 0.98 } : {}}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${state === 'correct'
                  ? 'bg-primary/10 border-primary shadow-md'
                  : state === 'wrong'
                    ? 'bg-error/8 border-error'
                    : state === 'reveal-correct'
                      ? 'bg-primary/5 border-primary/40'
                      : state === 'dimmed'
                        ? 'opacity-40 border-outline-variant/15'
                        : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/30 hover:bg-surface-container'
                }`}
            >
              {/* Letter badge */}
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm transition-colors ${state === 'correct'
                  ? 'bg-primary text-white'
                  : state === 'wrong'
                    ? 'bg-error text-white'
                    : 'bg-surface-container-high text-secondary'
                }`}>
                {CHOICE_LABELS[i]}
              </span>

              <span className={`font-bold font-headline leading-tight flex-1 ${state === 'correct' ? 'text-primary' : state === 'wrong' ? 'text-error' : 'text-on-surface'
                }`}>
                {choice}
              </span>

              {/* Feedback icon */}
              <AnimatePresence>
                {state === 'correct' && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="material-symbols-outlined text-primary text-2xl font-black"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </motion.span>
                )}
                {state === 'wrong' && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="material-symbols-outlined text-error text-2xl font-black"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    cancel
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

    </div>
  )
}
