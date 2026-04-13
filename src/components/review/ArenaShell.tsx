import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import ConfirmExitModal from './ConfirmExitModal'

interface ArenaShellProps {
  progress: number
  total: number
  currentIndex: number
  points: number
  onExitClick: () => void
  isExitModalOpen: boolean
  onExitClose: () => void
  onExitConfirm: () => void
  children: ReactNode
  hotkeys?: { key: string; label: string }[]
  modeLabel?: string
  syncError?: string | null
}

export default function ArenaShell({
  progress,
  total,
  currentIndex,
  points,
  onExitClick,
  isExitModalOpen,
  onExitClose,
  onExitConfirm,
  children,
  hotkeys = [
    { key: 'SPACE', label: 'Hiện gợi ý' },
    { key: '1-4', label: 'Chọn đáp án' },
    { key: 'ENTER', label: 'Tiếp tục' }
  ],
  modeLabel,
  syncError
}: ArenaShellProps) {
  return (
    <div className="fixed inset-0 bg-[#060608] z-[9999] flex flex-col items-center overflow-hidden font-body">
      {/* Error Alert Overlay */}
      {syncError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-xl px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl">
            <span className="material-symbols-outlined text-red-500 text-sm animate-pulse">cloud_off</span>
            <p className="text-red-500/80 font-black text-[10px] uppercase tracking-widest">{syncError}</p>
          </div>
        </div>
      )}

      {/* Background Stage - Vibrant Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D35400]/20 rounded-full blur-[120px] animate-blob filter" />
        <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-[#0891B2]/20 rounded-full blur-[120px] animate-blob [animation-delay:2s] filter" />
        <div className="absolute bottom-[-10%] left-[10%] w-[45%] h-[45%] bg-[#1E293B]/40 rounded-full blur-[100px] animate-blob [animation-delay:4s] filter" />
        <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[80px] animate-blob [animation-delay:6s] filter" />
      </div>

      {/* Zen Progress Bar */}
      <div className="w-full h-1 bg-white/5 relative z-50">
        <motion.div 
          className="h-full bg-primary primary-glow"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Header Info */}
      <div className="w-full max-w-5xl px-8 flex justify-between items-center py-8 text-white/40 relative z-50">
        <button 
          onClick={onExitClick}
          className="flex items-center gap-2 hover:text-white transition-all group px-4 py-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-black text-[10px] tracking-[0.2em] uppercase">Thoát</span>
        </button>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 bg-white/5 py-1.5 px-4 rounded-full border border-white/10 backdrop-blur-md">
            <span className="text-primary font-black text-xs">{currentIndex + 1}</span>
            <span className="text-white/20 text-[10px]">/</span>
            <span className="text-white/40 font-black text-xs">{total}</span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <span className="material-symbols-outlined text-lg font-black" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            <span className="font-black text-sm">{points}</span>
          </div>

          {modeLabel && (
            <div className="hidden md:block px-3 py-1 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/20">
              {modeLabel}
            </div>
          )}
        </div>
      </div>

      {/* Main Container - The Glass Stage */}
      <div className="flex-1 w-full max-w-4xl px-8 flex flex-col justify-start items-center overflow-y-auto custom-scrollbar pt-4 relative z-10">
        <div className="w-full">
          {children}
        </div>
      </div>

      {/* Footer Hotkeys */}
      <div className="py-10 text-white/20 flex flex-wrap justify-center gap-8 font-black text-[9px] tracking-[0.2em] uppercase relative z-50">
        {hotkeys.map((hk, i) => (
          <div key={i} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
            <kbd className="px-2 py-1 bg-white/5 rounded-lg border border-white/10 min-w-[32px] text-center text-white/40">{hk.key}</kbd>
            <span>{hk.label}</span>
          </div>
        ))}
      </div>

      {/* Shared Exit Modal */}
      <ConfirmExitModal 
        isOpen={isExitModalOpen}
        onClose={onExitClose}
        onConfirm={onExitConfirm}
      />
    </div>
  )
}
