import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Word } from '../../lib/types'
import { speakWord, cancelSpeech } from '../../lib/tts'

interface GhostRecallChallengeProps {
  word: Word
  onSubmit: (isCorrect: boolean) => void
}

export default function GhostRecallChallenge({ word, onSubmit }: GhostRecallChallengeProps) {
  const [input, setInput] = useState('')
  const [isWrong, setIsWrong] = useState(false)
  const [hintLevel, setHintLevel] = useState(0) // 0: none, 1: first letter, 2: first + last
  const [showDefinition, setShowDefinition] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    speakWord(word.word)

    return () => cancelSpeech()
  }, [word])

  const handlePlayAudio = () => speakWord(word.word)

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
    } else if (e.key.toLowerCase() === 'h' && e.ctrlKey) {
      // Shortcut for hint
      e.preventDefault()
      setHintLevel(prev => Math.min(prev + 1, 2))
    }
  }

  const getHintWord = () => {
    const w = word.word
    if (hintLevel === 0) return '_'.repeat(w.length)
    if (hintLevel === 1) return w[0] + '_'.repeat(w.length - 1)
    return w[0] + '_'.repeat(w.length - 2) + w[w.length - 1]
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="text-center mb-16 w-full">
        <span className="text-red-500 font-black uppercase tracking-[0.4em] text-[10px] block mb-8 flex items-center justify-center gap-2 text-shadow-glow">
          <span className="material-symbols-outlined text-lg">skull</span>
          Ghost Recall
        </span>
        
        {/* Definition Blur Area - The "Memory Palace" logic */}
        <div className="w-full flex justify-center mb-12">
          <div 
            className="glass-arena-container px-10 py-12 cursor-help group relative overflow-hidden transition-all hover:bg-white/[0.08]"
            onMouseDown={() => setShowDefinition(true)}
            onMouseUp={() => setShowDefinition(false)}
            onMouseLeave={() => setShowDefinition(false)}
            onTouchStart={() => setShowDefinition(true)}
            onTouchEnd={() => setShowDefinition(false)}
          >
            <div className={`text-4xl font-black text-white transition-all duration-500 text-shadow-glow leading-tight ${!showDefinition ? 'blur-[30px] opacity-10 scale-95' : 'blur-0 opacity-100 scale-100'}`}>
              {word.definition}
            </div>
            {!showDefinition && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 animate-pulse">
                  <span className="material-symbols-outlined text-white/40">visibility_off</span>
                </div>
                <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] font-body bg-white/5 py-1.5 px-4 rounded-full border border-white/10 backdrop-blur-sm">Giữ để hiện nghĩa</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-6">
           <button 
             onClick={handlePlayAudio}
             className="w-16 h-16 rounded-[1.5rem] glass-arena-item text-white/40 hover:text-white flex items-center justify-center border border-white/10 shadow-xl group"
           >
             <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">volume_up</span>
           </button>
           <button 
             onClick={() => setHintLevel(prev => Math.min(prev + 1, 2))}
             disabled={hintLevel >= 2}
             className="px-8 h-16 rounded-[1.5rem] glass-arena-item text-white/40 hover:text-white flex items-center justify-center border border-white/10 font-black text-[10px] uppercase tracking-[0.2em] disabled:opacity-10 shadow-xl group"
           >
             <span className="material-symbols-outlined text-lg mr-3 group-hover:rotate-12 transition-transform">lightbulb</span>
             Cần gợi ý
           </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full relative px-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getHintWord()}
            className={`w-full bg-transparent border-0 border-b-8 text-center text-7xl font-black text-white outline-none py-8 transition-all tracking-tighter placeholder:text-white/[0.02] ${
              isWrong ? 'border-red-500 animate-shake' : 'border-white/5 focus:border-primary primary-glow'
            }`}
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
          <AnimatePresence>
            {input.length > 0 && !isWrong && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-16 left-0 right-0 text-center"
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                  <span className="text-primary font-black text-[9px] uppercase tracking-widest leading-none">Nhấn ENTER để xác nhận</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  )
}
