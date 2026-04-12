import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Word } from '../../lib/types'
import { shuffleArray } from '../../lib/utils'

interface ConstructionChallengeProps {
  word: Word
  onSubmit: (isCorrect: boolean) => void
}

interface Block {
  id: number
  char: string
  used: boolean
}

export default function ConstructionChallenge({ word, onSubmit }: ConstructionChallengeProps) {
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
         setTimeout(() => onSubmit(true), 500)
      } else {
         setIsWrong(true)
         setTimeout(() => {
            setIsWrong(false)
            reset()
         }, 800)
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

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        undo()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [built])

  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <span className="text-primary/60 uppercase tracking-[0.3em] text-[10px] font-black block mb-4">Sắp xếp các ký tự</span>
        <h2 className="text-4xl font-black text-white mb-2">{word.definition}</h2>
      </motion.div>

      {/* Rebuilt Word Area */}
      <div className={`flex flex-wrap justify-center gap-2 mb-12 border-b-2 py-4 min-h-[80px] transition-all duration-300 ${isWrong ? 'border-red-500 bg-red-500/5' : 'border-white/10'}`}>
         <AnimatePresence mode="popLayout">
            {built.map((block) => (
              <motion.div 
                key={block.id}
                layoutId={`block-${block.id}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-12 h-14 bg-primary text-white text-3xl font-black rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
              >
                {block.char}
              </motion.div>
            ))}
         </AnimatePresence>
         {built.length === 0 && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/10 text-4xl font-black self-center tracking-widest uppercase"
            >
              Building...
            </motion.span>
         )}
      </div>

      {/* Source Blocks */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <AnimatePresence>
          {blocks.map((block) => !block.used && (
            <motion.button
              key={block.id}
              layoutId={`block-${block.id}`}
              onClick={() => handleAdd(block)}
              disabled={isWrong}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="w-12 h-12 rounded-xl bg-white/5 border-2 border-white/10 text-white text-xl font-black hover:bg-white/10 transition-colors"
            >
              {block.char}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-4">
         <motion.button 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={undo}
           disabled={built.length === 0}
           className="px-6 py-2 bg-white/5 text-white/40 rounded-full font-bold text-[10px] uppercase tracking-widest hover:text-white transition-all flex items-center gap-2 disabled:opacity-30"
         >
           <span className="material-symbols-outlined text-sm">undo</span> Quay lại
         </motion.button>
         <motion.button 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={reset}
           disabled={built.length === 0}
           className="px-6 py-2 bg-white/5 text-white/40 rounded-full font-bold text-[10px] uppercase tracking-widest hover:text-white transition-all flex items-center gap-2 disabled:opacity-30"
         >
           <span className="material-symbols-outlined text-sm">refresh</span> Reset
         </motion.button>
      </div>
    </div>
  )
}
