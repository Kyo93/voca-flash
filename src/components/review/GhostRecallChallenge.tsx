import { useState, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Word } from '../../lib/types'
import { speak, stop } from '../../lib/tts'

interface GhostRecallChallengeProps {
  word: Word
  onSubmit: (isCorrect: boolean) => void
}

export default memo(function GhostRecallChallengeInner({ word, onSubmit }: GhostRecallChallengeProps) {
  const [input, setInput] = useState('')
  const [isWrong, setIsWrong] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    speak(word.word)
    return () => stop()
  }, [word.word])

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
            Nghe lại
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
            <div className={`text-4xl font-black font-headline text-center transition-all duration-500 ${!showHint ? 'blur-[12px] opacity-30' : 'blur-0 opacity-100'}`}>
              {word.definition}
            </div>
            {!showHint && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2">
                <span className="material-symbols-outlined text-primary/30 text-3xl">visibility_off</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-outline">Giữ để hiện nghĩa</span>
              </div>
            )}
          </div>
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
            placeholder={getHintWord()}
            className={`w-full bg-surface-container-low rounded-2xl border-2 p-5 text-center text-3xl font-black font-headline text-primary outline-none transition-all placeholder:font-mono placeholder:text-primary/20 ${
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

      {/* Hint Toggle */}
      <button
        onClick={() => setShowHint(h => !h)}
        className="mt-6 text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors"
      >
        {showHint ? '▲ Ẩn gợi ý chữ' : '▼ Hiện gợi ý chữ'}
      </button>
    </div>
  )
})
