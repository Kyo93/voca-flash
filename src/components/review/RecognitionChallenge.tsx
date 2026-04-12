import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Word } from '../../lib/types'
import { speakWord, cancelSpeech } from '../../lib/tts'
import { shuffleArray } from '../../lib/utils'

interface RecognitionChallengeProps {
  word: Word
  choices: string[] // Wrong choices from word_choices table
  onSubmit: (isCorrect: boolean) => void
}

export default function RecognitionChallenge({ word, choices, onSubmit }: RecognitionChallengeProps) {
  const [shuffled, setShuffled] = useState<{ text: string, isCorrect: boolean }[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    // Combine correct answer with wrong ones (filtered to be unique and not the correct answer)
    const distractors = [...new Set(choices)]
      .filter(c => c && c.toLowerCase() !== word.definition.toLowerCase())
      .slice(0, 3)

    const all = [
      { text: word.definition, isCorrect: true },
      ...distractors.map(c => ({ text: c, isCorrect: false }))
    ]
    
    setShuffled(shuffleArray(all))
    setSelected(null)
    setIsLocked(false)
    
    // Auto-play word
    speakWord(word.word)

    return () => {
      cancelSpeech()
    }
  }, [word, choices])

  // Keyboard support (1-4)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isLocked) return
      const num = parseInt(e.key)
      if (num >= 1 && num <= shuffled.length) {
        handleSelect(num - 1)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [shuffled, isLocked])

  const handleSelect = (index: number) => {
    if (isLocked) return
    setSelected(index)
    setIsLocked(true)

    // Delay slightly for visual feedback
    setTimeout(() => {
      onSubmit(shuffled[index].isCorrect)
    }, 1000)
  }

  return (
    <div className="w-full">
      <motion.div 
        key={word.word}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-12"
      >
        <span className="text-primary/60 uppercase tracking-[0.3em] text-[10px] font-black block mb-4">Chọn nghĩa đúng nhất</span>
        <h2 className="text-6xl font-black text-white mb-2 tracking-tight">{word.word}</h2>
        <p className="text-white/20 italic font-medium">{word.phonetic}</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence mode="popLayout">
          {shuffled.map((item, idx) => {
            let stateClass = 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
            let isSelected = selected === idx
            
            if (isSelected) {
              stateClass = item.isCorrect 
                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]' 
                : 'bg-red-500/20 border-red-500 text-red-500'
            } else if (isLocked && item.isCorrect) {
              stateClass = 'bg-primary/10 border-primary/40 text-primary/80'
            }

            return (
              <motion.button
                key={`${word.word}-${item.text}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: isSelected ? 1.02 : 1
                }}
                transition={{ delay: idx * 0.08 }}
                whileHover={!isLocked ? { x: 8, backgroundColor: "rgba(255,255,255,0.08)" } : {}}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
                onClick={() => handleSelect(idx)}
                disabled={isLocked}
                className={`w-full p-6 rounded-2xl border-2 text-left transition-colors flex items-center justify-between group ${stateClass}`}
              >
                <span className="font-bold text-lg">{item.text}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black opacity-20 uppercase tracking-widest group-hover:opacity-100 transition-opacity">Nhấn {idx + 1}</span>
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${isSelected ? 'border-current' : 'border-white/10'}`}>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.span 
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="material-symbols-outlined text-sm font-black"
                        >
                          {item.isCorrect ? 'done' : 'close'}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
