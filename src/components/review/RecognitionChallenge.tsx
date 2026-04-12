import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Word } from '../../lib/types'

interface RecognitionChallengeProps {
  word: Word
  choices: string[]
  onSubmit: (isCorrect: boolean) => void
}

export default function RecognitionChallenge({ word, choices, onSubmit }: RecognitionChallengeProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [isDone, setIsDone] = useState(false)
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')

  const handleChoice = (choice: string) => {
    if (isDone) return
    setSelected(choice)
    setIsDone(true)

    const isCorrect = choice === word.definition
    setFeedback(isCorrect ? 'correct' : 'wrong')

    setTimeout(() => {
      onSubmit(isCorrect)
    }, 1200)
  }

  // Handle keyboard shortcuts (A, B, C, D)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isDone) return
      const index = ['a', 'b', 'c', 'd'].indexOf(e.key.toLowerCase())
      if (index !== -1 && index < choices.length) {
        handleChoice(choices[index])
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [choices, isDone])

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="text-center mb-16 w-full">
        <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] block mb-8 text-shadow-glow">
          Chọn nghĩa đúng nhất
        </span>
        
        <h2 className="text-8xl font-black text-white tracking-tighter mb-8 text-shadow-glow">
          {word.word}
        </h2>
        
        <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em] mb-12">
          {word.phonetic || '/.../'} • {word.pos}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full px-4">
        {choices.map((choice, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleChoice(choice)}
            disabled={isDone}
            className={`
              glass-arena-item p-6 text-left relative overflow-hidden transition-all duration-300 min-h-[100px] flex items-center
              ${selected === choice ? (feedback === 'correct' ? 'border-primary ring-2 ring-primary/20' : 'border-red-500 ring-2 ring-red-500/20') : 'border-white/5 hover:border-white/20'}
              ${isDone && choice === word.definition && feedback === 'wrong' ? 'border-primary/50 text-primary' : ''}
              ${isDone && choice !== word.definition && selected !== choice ? 'opacity-40' : ''}
            `}
          >
            <div className="flex items-start gap-4">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs transition-colors ${selected === choice ? 'bg-white text-black' : 'bg-white/5 text-white/40'}`}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className={`text-lg font-bold leading-tight ${selected === choice ? 'text-white' : 'text-white/70'}`}>
                {choice}
              </span>
            </div>
            
            {/* Feedback Overlays */}
            <AnimatePresence>
              {selected === choice && feedback === 'correct' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-primary/10 flex items-center justify-end pr-6 pointer-events-none"
                >
                  <span className="material-symbols-outlined text-primary text-3xl font-black">check_circle</span>
                </motion.div>
              )}
              {selected === choice && feedback === 'wrong' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-red-500/10 flex items-center justify-end pr-6 pointer-events-none"
                >
                  <span className="material-symbols-outlined text-red-500 text-3xl font-black">cancel</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
