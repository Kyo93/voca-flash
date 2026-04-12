import { useState, useEffect, useRef } from 'react'
import { Word } from '../../lib/types'
import { speakWord, cancelSpeech } from '../../lib/speech'

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

    return () => {
      cancelSpeech()
    }
  }, [word])

  const handlePlayAudio = () => {
    speakWord(word.word)
  }

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

  const getHintWord = () => {
    const w = word.word
    if (hintLevel === 0) return '_'.repeat(w.length)
    if (hintLevel === 1) return w[0] + '_'.repeat(w.length - 1)
    return w[0] + '_'.repeat(w.length - 2) + w[w.length - 1]
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-12">
        <span className="text-red-500/60 uppercase tracking-[0.3em] text-[10px] font-black block mb-4 flex items-center justify-center gap-2">
           <span className="material-symbols-outlined text-xs">skull</span>
           Ghost Recall
        </span>
        
        {/* Definition Blur Area */}
        <div 
           className="relative inline-block mb-12 cursor-help group"
           onMouseDown={() => setShowDefinition(true)}
           onMouseUp={() => setShowDefinition(false)}
           onMouseLeave={() => setShowDefinition(false)}
        >
          <div className={`text-4xl font-black text-white transition-all duration-300 ${!showDefinition ? 'blur-xl opacity-20 scale-95' : 'blur-0 opacity-100 scale-100'}`}>
            {word.definition}
          </div>
          {!showDefinition && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white/20 text-[10px] font-black uppercase tracking-widest bg-white/5 py-1 px-3 rounded-full">Giữ chuột để hiện nghĩa</span>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 mb-12">
           <button 
            onClick={handlePlayAudio}
            className="w-12 h-12 rounded-2xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center border border-white/5"
           >
             <span className="material-symbols-outlined">volume_up</span>
           </button>
           <button 
            onClick={() => setHintLevel(prev => Math.min(prev + 1, 2))}
            disabled={hintLevel >= 2}
            className="px-6 h-12 rounded-2xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center border border-white/5 font-black text-[10px] uppercase tracking-widest disabled:opacity-20"
           >
             Cần gợi ý (H)
           </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getHintWord()}
          className={`w-full bg-transparent border-0 border-b-4 text-center text-5xl font-black text-white outline-none py-4 transition-all tracking-wide placeholder:text-white/5 ${
            isWrong ? 'border-red-500 animate-shake' : 'border-white/10 focus:border-primary'
          }`}
          autoFocus
          autoComplete="off"
          spellCheck="false"
        />
        <button type="submit" className="hidden" aria-hidden="true" />
        <div className="text-center mt-6">
           <p className="text-white/10 font-bold text-[10px] tracking-widest uppercase">Nhấn ENTER để xác nhận</p>
        </div>
      </form>
    </div>
  )
}
