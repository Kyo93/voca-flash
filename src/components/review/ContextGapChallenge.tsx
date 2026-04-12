import { useState, useEffect, useRef } from 'react'
import { Word } from '../../lib/types'

interface ContextGapChallengeProps {
  word: Word
  onSubmit: (isCorrect: boolean) => void
}

export default function ContextGapChallenge({ word, onSubmit }: ContextGapChallengeProps) {
  const [input, setInput] = useState('')
  const [isWrong, setIsWrong] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Parse example to find the word and replace with gap
  // e.g. "I love learning English" -> "I love learning _____"
  const getGappedSentence = () => {
    if (!word.example) return 'No example provided.'
    
    // Simple case-insensitive replacement
    const regex = new RegExp(`\\b${word.word}\\b`, 'gi')
    return word.example.split(regex).map((part, i, arr) => (
      <span key={i}>
        {part}
        {i < arr.length - 1 && (
          <span className="inline-block border-b-2 border-primary/40 px-2 min-w-[80px] text-primary">_____</span>
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
      setInput('') // Reset for next word
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-secondary/60 uppercase tracking-[0.3em] text-[10px] font-black block mb-6">Điền vào chỗ trống</span>
        <div className="text-3xl font-bold text-white/90 leading-relaxed mb-12">
           {getGappedSentence()}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative max-w-sm mx-auto">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Gõ từ còn thiếu..."
          className={`w-full bg-white/5 border-2 rounded-2xl p-6 text-center text-3xl font-black text-white outline-none transition-all ${
            isWrong ? 'border-red-500 animate-shake' : 'border-white/10 focus:border-primary'
          }`}
          autoComplete="off"
          spellCheck="false"
        />
        <button type="submit" className="hidden" aria-hidden="true" />
        <div className="text-center mt-6">
           <p className="text-white/10 font-bold text-[10px] tracking-widest uppercase">Nhấn ENTER để xác nhận</p>
        </div>
      </form>

      <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
         <p className="text-white/40 text-sm italic">"{word.definition}"</p>
      </div>
    </div>
  )
}
