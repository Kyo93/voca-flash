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

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim()) return
    const isCorrect = input.trim().toLowerCase() === word.word.trim().toLowerCase()
    if (isCorrect) {
      onSubmit(true)
      setInput('')
    } else {
      setIsWrong(true)
      setTimeout(() => setIsWrong(false), 600)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-surface-container-low rounded-2xl p-6 mb-8 flex flex-col gap-2 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/8 border border-secondary/15 self-center">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          Điền từ
        </span>
      </div>

      {/* Sentence with gap */}
      <div className="w-full bg-surface-container-low rounded-2xl border-2 border-outline-variant/15 p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/40 rounded-full" />
        <div className="text-2xl font-bold font-headline text-on-surface leading-relaxed text-center">
          {gappedSentence ?? (
            <span className="text-outline italic">Không có câu ví dụ</span>
          )}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Gõ từ còn thiếu..."
            className={`w-full bg-surface-container-low rounded-2xl border-2 p-5 text-center text-2xl font-black font-headline text-primary outline-none transition-all placeholder:text-primary/20 ${
              isWrong
                ? 'border-error bg-error/5 animate-[shake_0.4s_cubic-bezier(.36,.07,.19,.97)_both]'
                : 'border-outline-variant/20 focus:border-primary shadow-sm'
            }`}
            autoComplete="off"
            spellCheck={false}
          />
          <AnimatePresence>
            {input.length > 0 && !isWrong && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-10 left-0 right-0 text-center"
              >
                <span className="text-[9px] font-bold uppercase tracking-widest text-outline bg-surface-container-high px-3 py-1 rounded-full">
                  Nhấn ENTER để xác nhận
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Meaning hint */}
      <div className="mt-8 w-full flex items-center gap-3 text-center">
        <div className="h-px flex-1 bg-outline-variant/20" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-outline shrink-0">Gợi ý nghĩa</span>
        <div className="h-px flex-1 bg-outline-variant/20" />
      </div>
      <p className="mt-3 text-center text-on-surface-variant font-body text-lg italic leading-relaxed">
        &ldquo;{word.definition}&rdquo;
      </p>
    </div>
  )
}
