import { useState, useEffect } from 'react'
import { Word } from '../../lib/types'

interface ConstructionChallengeProps {
  word: Word
  onSubmit: (isCorrect: boolean) => void
}

export default function ConstructionChallenge({ word, onSubmit }: ConstructionChallengeProps) {
  const [blocks, setBlocks] = useState<{ id: number, char: string, used: boolean }[]>([])
  const [built, setBuilt] = useState<string[]>([])
  const [isWrong, setIsWrong] = useState(false)

  useEffect(() => {
    // Scramble characters
    const chars = word.word.split('').map((char, i) => ({
      id: i,
      char,
      used: false
    }))
    setBlocks(chars.sort(() => Math.random() - 0.5))
    setBuilt([])
  }, [word])

  const handleAdd = (block: { id: number, char: string, used: boolean }) => {
    if (block.used) return
    
    const newBuilt = [...built, block.char]
    setBuilt(newBuilt)
    setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, used: true } : b))

    // Check if finished
    if (newBuilt.length === word.word.length) {
      if (newBuilt.join('').toLowerCase() === word.word.toLowerCase()) {
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
    const lastChar = built[built.length - 1]
    setBuilt(prev => prev.slice(0, -1))
    
    // Mark one matching used block as unused (earliest first)
    let found = false
    setBlocks(prev => prev.map(b => {
      if (!found && b.used && b.char === lastChar) {
        found = true
        return { ...b, used: false }
      }
      return b
    }))
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-12">
        <span className="text-primary/60 uppercase tracking-[0.3em] text-[10px] font-black block mb-4">Sắp xếp các ký tự</span>
        <h2 className="text-4xl font-black text-white mb-2">{word.definition}</h2>
      </div>

      {/* Rebuilt Word Area */}
      <div className={`flex flex-wrap justify-center gap-2 mb-12 border-b-2 py-4 min-h-[80px] transition-all ${isWrong ? 'border-red-500 animate-shake' : 'border-white/10'}`}>
         {built.map((char, i) => (
           <div key={i} className="w-12 h-14 bg-primary text-white text-3xl font-black rounded-xl flex items-center justify-center animate-in zoom-in-50 duration-200">
             {char}
           </div>
         ))}
         {built.length === 0 && (
           <span className="text-white/10 text-4xl font-black self-center tracking-widest uppercase">Building...</span>
         )}
      </div>

      {/* Source Blocks */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {blocks.map((block) => (
          <button
            key={block.id}
            onClick={() => handleAdd(block)}
            disabled={block.used || isWrong}
            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-black transition-all ${
              block.used 
                ? 'opacity-0 scale-50 pointer-events-none' 
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:-translate-y-1 active:scale-90'
            }`}
          >
            {block.char}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-4">
         <button 
           onClick={undo}
           className="px-6 py-2 bg-white/5 text-white/40 rounded-full font-bold text-[10px] uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
         >
           <span className="material-symbols-outlined text-sm">undo</span> Quay lại
         </button>
         <button 
           onClick={reset}
           className="px-6 py-2 bg-white/5 text-white/40 rounded-full font-bold text-[10px] uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
         >
           <span className="material-symbols-outlined text-sm">refresh</span> Reset
         </button>
      </div>
    </div>
  )
}
