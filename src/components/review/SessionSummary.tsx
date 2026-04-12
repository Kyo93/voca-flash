import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Word } from '../../lib/types'

interface SessionSummaryProps {
  stats: {
    correct: number
    wrong: number
    points: number
    mistakes: Word[]
  }
  onRestart: () => void
}

export default function SessionSummary({ stats, onRestart }: SessionSummaryProps) {
  const [displayXP, setDisplayXP] = useState(0)
  const total = stats.correct + stats.wrong
  const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : 0

  useEffect(() => {
    // Count up animation for XP

    const end = stats.points
    const duration = 1500
    // Safeguard: Ensure stepTime is at least 20ms to prevent browser lag for high point values
    const stepTime = Math.max(Math.floor(duration / end), 20)
    
    if (end === 0) return

    const timer = setInterval(() => {
      setDisplayXP(prev => {
        if (prev >= end) {
          clearInterval(timer)
          return end
        }
        // If stepTime was capped at 20ms, we might need to increment by more than 1 to finish in 1.5s
        const increment = Math.ceil(end / (duration / stepTime))
        return Math.min(prev + increment, end)
      })
    }, stepTime)

    return () => clearInterval(timer)
  }, [stats.points])

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 rounded-[2.5rem] bg-primary/20 text-primary flex items-center justify-center mb-8 mx-auto shadow-[0_0_80px_rgba(var(--primary-rgb),0.3)] border border-primary/20"
          >
            <span className="material-symbols-outlined text-5xl">military_tech</span>
          </motion.div>
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-black text-white mb-2 tracking-tight"
          >
            Session Complete!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-on-surface-variant font-bold text-lg"
          >
            You're making incredible progress.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/[0.03] border border-white/5 p-8 rounded-[2rem] text-center backdrop-blur-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="block text-primary text-5xl font-black mb-1 relative">{displayXP}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-black relative">Total XP Earned</span>
          </motion.div>

          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/[0.03] border border-white/5 p-8 rounded-[2rem] text-center backdrop-blur-xl group"
          >
            <span className="block text-white text-5xl font-black mb-1">{accuracy}%</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Accuracy Rate</span>
          </motion.div>
        </div>

        {/* Mistakes Audit Section */}
        <AnimatePresence>
          {stats.mistakes.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Mistakes Audit</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              
              <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                {stats.mistakes.map((w, i) => (
                  <div key={`${w.id}-${i}`} className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl flex items-center justify-between group hover:bg-white/[0.05] transition-all">
                    <div>
                      <h4 className="text-white font-black group-hover:text-primary transition-colors">{w.word}</h4>
                      <p className="text-white/40 text-xs font-medium">{w.definition}</p>
                    </div>
                    <div className="text-right">
                       <span className="text-[9px] font-black text-red-500/40 uppercase tracking-widest">Retry Soon</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-4"
        >
          <button 
            onClick={onRestart}
            className="w-full py-5 bg-primary text-white font-black rounded-[1.5rem] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 group"
          >
            <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">refresh</span>
            Start Another Batch
          </button>
          <Link 
            to="/dashboard"
            className="w-full py-5 bg-white/[0.03] text-white/60 font-black rounded-[1.5rem] border border-white/5 hover:bg-white/[0.06] hover:text-white text-center transition-all"
          >
            Return to Dashboard
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
