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
    const end = stats.points
    const duration = 1500
    const stepTime = Math.max(Math.floor(duration / end), 20)
    
    if (end === 0) return

    const timer = setInterval(() => {
      setDisplayXP(prev => {
        if (prev >= end) {
          clearInterval(timer)
          return end
        }
        const increment = Math.ceil(end / (duration / stepTime))
        return Math.min(prev + increment, end)
      })
    }, stepTime)

    return () => clearInterval(timer)
  }, [stats.points])

  return (
    <div className="fixed inset-0 bg-[#060608] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Stage - Vibrant Blobs (Same as ArenaShell for continuity) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D35400]/20 rounded-full blur-[120px] animate-blob filter" />
        <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-[#0891B2]/20 rounded-full blur-[120px] animate-blob [animation-delay:2s] filter" />
        <div className="absolute bottom-[-10%] left-[10%] w-[45%] h-[45%] bg-[#1E293B]/40 rounded-full blur-[100px] animate-blob [animation-delay:4s] filter" />
        <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[80px] animate-blob [animation-delay:6s] filter" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 rounded-[2.5rem] bg-primary/20 text-primary flex items-center justify-center mb-8 mx-auto shadow-[0_0_80px_rgba(var(--primary-rgb),0.3)] border border-primary/20"
          >
            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          </motion.div>
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-black text-white mb-2 tracking-tight text-shadow-glow"
          >
            Hoàn thành buổi học!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/40 font-bold text-lg"
          >
            Bạn đang có những bước tiến tuyệt vời.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-arena-item p-8 rounded-[2rem] text-center border-white/10 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="block text-primary text-5xl font-black mb-1 relative text-shadow-glow">{displayXP}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black relative">Điểm kinh nghiệm</span>
          </motion.div>

          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass-arena-item p-8 rounded-[2rem] text-center border-white/10 group"
          >
            <span className="block text-white text-5xl font-black mb-1 relative text-shadow-glow">{accuracy}%</span>
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black relative">Tỷ lệ chính xác</span>
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
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Cần lưu ý lại</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              
              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                {stats.mistakes.map((w, i) => (
                  <div key={`${w.id}-${i}`} className="glass-arena-item p-4 rounded-3xl flex items-center justify-between group border-white/5 hover:border-primary/20 transition-all">
                    <div>
                      <h4 className="text-white text-lg font-black group-hover:text-primary transition-colors">{w.word}</h4>
                      <p className="text-white/40 text-sm font-medium">{w.definition}</p>
                    </div>
                    <div className="text-right">
                       <span className="text-[8px] font-black text-red-500/60 uppercase tracking-widest bg-red-500/5 px-2 py-1 rounded-full border border-red-500/10">Ôn lại sớm</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-4"
        >
          <button 
            onClick={onRestart}
            className="w-full py-5 bg-primary text-white font-black rounded-[1.5rem] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl primary-glow flex items-center justify-center gap-3 group"
          >
            <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-700">refresh</span>
            Bắt đầu đợt mới
          </button>
          <Link 
            to="/dashboard"
            className="w-full py-5 glass-arena-item text-white/60 font-black rounded-[1.5rem] border border-white/10 hover:bg-white/10 hover:text-white text-center transition-all tracking-[0.1em]"
          >
            Quay lại Dashboard
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
