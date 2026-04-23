import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Word } from '../../lib/types'
import { shuffleArray } from '../../lib/utils'
import { CONSTRUCTION_CHALLENGE_DEFAULTS } from '../../lib/constants'

interface ConstructionChallengeProps {
  word: Word
  onSubmit: (isCorrect: boolean, isSkipped?: boolean) => void
}

interface Block {
  id: number
  char: string
  used: boolean
}

export default function ConstructionChallenge({ word, onSubmit }: ConstructionChallengeProps) {
  const { t } = useTranslation()
  const [blocks, setBlocks] = useState<Block[]>([])
  const [built, setBuilt] = useState<Block[]>([])
  const [isWrong, setIsWrong] = useState(false)

  useEffect(() => {
    const chars = word.word.split('').map((char, i) => ({
      id: i,
      char,
      used: false
    }))
    setBlocks(shuffleArray(chars))
    setBuilt([])
  }, [word])

  const handleAdd = (block: Block) => {
    if (block.used) return
    
    const newBuilt = [...built, block]
    setBuilt(newBuilt)
    setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, used: true } : b))

    if (newBuilt.length === word.word.length) {
      if (newBuilt.map(b => b.char).join('').toLowerCase() === word.word.toLowerCase()) {
         setTimeout(() => onSubmit(true), CONSTRUCTION_CHALLENGE_DEFAULTS.SUCCESS_DELAY_MS)
      } else {
         setIsWrong(true)
         // RECORD FAILURE: Call onSubmit(false) after a delay so they see the shake
         setTimeout(() => {
            setIsWrong(false)
            reset()
            onSubmit(false)
         }, CONSTRUCTION_CHALLENGE_DEFAULTS.FAILURE_DELAY_MS)
      }
    }
  }

  const reset = () => {
    setBuilt([])
    setBlocks(prev => prev.map(b => ({ ...b, used: false })))
  }

  const undo = () => {
    if (built.length === 0) return
    const lastBlock = built[built.length - 1]
    setBuilt(prev => prev.slice(0, -1))
    setBlocks(prev => prev.map(b => b.id === lastBlock.id ? { ...b, used: false } : b))
  }


  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        undo()
      } else if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault()
        reset()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [built])

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 w-full"
      >
        <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] block mb-8 text-shadow-glow">
          {t('review.construction.title')}
        </span>
        <div className="glass-arena-container p-12 mb-8 relative overflow-hidden group">
          <h2 className="text-4xl font-black text-white text-shadow-glow tracking-tight leading-relaxed px-4">
            {word.definition}
          </h2>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-primary/40 rounded-full" />
        </div>
      </motion.div>

      {/* Built Word Area */}
      <div className={`w-full flex flex-wrap justify-center gap-3 p-10 min-h-[140px] rounded-4xl border-2 transition-all duration-300 mb-16 ${
        isWrong 
          ? 'border-red-500 bg-red-500/10 animate-shake' 
          : built.length > 0 
            ? 'border-primary/40 bg-primary/5 primary-glow' 
            : 'border-white/5 bg-white/5'
      }`}>
         <AnimatePresence mode="popLayout">
            {built.map((block) => (
              <motion.div 
                key={block.id}
                layoutId={`block-${block.id}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 600, damping: 25 }}
                className="w-16 h-20 glass-arena-item text-primary text-4xl font-black rounded-2xl flex items-center justify-center shadow-2xl border-primary/20"
              >
                {block.char}
              </motion.div>
            ))}
         </AnimatePresence>
         {built.length === 0 && (
            <div className="flex flex-col items-center justify-center opacity-10">
              <span className="material-symbols-outlined text-4xl mb-2">construction</span>
              <span className="text-xs font-black uppercase tracking-[0.4em]">{t('review.construction.building')}</span>
            </div>
         )}
      </div>

      {/* Source Blocks */}
      <div className="flex flex-wrap justify-center gap-3 mb-16 px-4">
        <AnimatePresence>
          {blocks.map((block) => !block.used && (
            <motion.button
              key={block.id}
              layoutId={`block-${block.id}`}
              onClick={() => handleAdd(block)}
              disabled={isWrong}
              whileHover={{ scale: 1.15, y: -8, backgroundColor: "rgba(255,255,255,0.12)" }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="w-16 h-16 rounded-2xl glass-arena-item border-white/10 text-white text-2xl font-black shadow-xl"
            >
              {block.char.toUpperCase()}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
         <button 
           onClick={undo}
           disabled={built.length === 0 || isWrong}
           className="px-8 h-12 glass-arena-item text-white/40 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all flex items-center gap-3 disabled:opacity-5 border-white/10 shadow-lg"
         >
           <span className="material-symbols-outlined text-lg">undo</span> {t('review.construction.undo')}
         </button>
         <button 
           onClick={reset}
           disabled={built.length === 0 || isWrong}
           className="px-8 h-12 glass-arena-item text-white/40 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all flex items-center gap-3 disabled:opacity-5 border-white/10 shadow-lg"
         >
           <span className="material-symbols-outlined text-lg">refresh</span> {t('review.construction.reset')}
         </button>
         <button 
           onClick={() => onSubmit(false, true)}
           className="px-8 h-12 glass-arena-item text-primary/40 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-all flex items-center gap-3 border-primary/10 shadow-lg"
         >
           <span className="material-symbols-outlined text-lg">flag</span> {t('review.construction.give_up')}
         </button>
      </div>
    </div>
  )
}
