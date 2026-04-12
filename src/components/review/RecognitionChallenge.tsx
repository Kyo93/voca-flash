import { Word } from '../../lib/types'
import { speakWord, cancelSpeech } from '../../lib/speech'

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
    // Combine correct answer with wrong ones and shuffle
    const all = [
      { text: word.definition, isCorrect: true },
      ...choices.slice(0, 3).map(c => ({ text: c, isCorrect: false }))
    ]
    
    // Fallback if not enough choices
    if (all.length < 4) {
       // Typically, we should fetch random words if this happens, 
       // but for now we assume 3 choices were added by admin.
    }

    setShuffled(all.sort(() => Math.random() - 0.5))
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
      <div className="text-center mb-12">
        <span className="text-primary/60 uppercase tracking-[0.3em] text-[10px] font-black block mb-4">Chọn nghĩa đúng nhất</span>
        <h2 className="text-6xl font-black text-white mb-2 tracking-tight">{word.word}</h2>
        <p className="text-white/20 italic font-medium">{word.phonetic}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {shuffled.map((item, idx) => {
          let stateClass = 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
          if (selected === idx) {
            stateClass = item.isCorrect 
              ? 'bg-primary/20 border-primary text-primary' 
              : 'bg-red-500/20 border-red-500 text-red-500'
          } else if (isLocked && item.isCorrect) {
            stateClass = 'bg-primary/10 border-primary/40 text-primary/80'
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isLocked}
              className={`w-full p-6 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${stateClass}`}
            >
              <span className="font-bold text-lg">{item.text}</span>
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-black opacity-20 uppercase tracking-widest group-hover:opacity-100 transition-opacity">Nhấn {idx + 1}</span>
                 <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${selected === idx ? 'border-current' : 'border-white/10'}`}>
                    {selected === idx && (
                      <span className="material-symbols-outlined text-sm font-black">
                        {item.isCorrect ? 'done' : 'close'}
                      </span>
                    )}
                 </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
