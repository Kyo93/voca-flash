import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Word } from '../../lib/types'

interface ContextGapChallengeProps {
  word: Word
  onSubmit: (isCorrect: boolean) => void
}

export default function ContextGapChallenge({ word, onSubmit }: ContextGapChallengeProps) {
  const [input, setInput] = useState('')
  const [isWrong, setIsWrong] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const getGappedSentence = () => {
    if (!word.example) return 'No example provided.'
    
    const regex = new RegExp(`\\b${word.word}\\b`, 'gi')
    return word.example.split(regex).map((part, i, arr) => (
      <span key={i} className="inline">
        {part}
        {i < arr.length - 1 && (
          <span className="inline-flex items-center mx-2 px-6 py-1 bg-white/5 border border-white/20 rounded-full text-primary font-black shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)] animate-pulse">
            _____
          </span>
        )}
      </span>
    ))
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim()) return

    const target = word.word.trim().toLowerCase()
    const userVal = input.trim().toLowerCase()
    const isCorrect = userVal === target
    
    if (isCorrect) {
      onSubmit(true)
      setInput('')
    } else {
      setIsWrong(true)
      setTimeout(() => setIsWrong(false), 500)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="text-center mb-16 w-full">
        <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] block mb-8 text-shadow-glow">
          Điền vào chỗ trống
        </span>
        
        <div className="glass-arena-container p-12 mb-12 relative overflow-hidden group">
          <div className="text-3xl font-black text-white leading-[1.6] text-shadow-glow">
             {getGappedSentence()}
          </div>
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full relative px-4 max-w-md">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Gõ từ còn thiếu..."
            className={`w-full glass-arena-item border-2 rounded-[2rem] p-8 text-center text-3xl font-black text-white outline-none transition-all placeholder:text-white/10 ${
              isWrong ? 'border-red-500 animate-shake bg-red-500/10' : 'border-white/10 focus:border-primary primary-glow'
            }`}
            autoComplete="off"
            spellCheck="false"
          />
          <AnimatePresence>
            {input.length > 0 && !isWrong && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-14 left-0 right-0 text-center"
              >
                <span className="text-primary font-black text-[9px] uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">Nhấn ENTER để xác nhận</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      <div className="mt-24 w-full">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-white/20 font-black text-[9px] uppercase tracking-widest leading-none shrink-0">Gợi ý nghĩa</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="px-8 py-4 text-center">
          <p className="text-white/50 text-xl font-medium tracking-tight leading-relaxed italic">
            "{word.definition}"
          </p>
        </div>
      </div>
    </div>
  )
}
