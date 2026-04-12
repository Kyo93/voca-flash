import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFreeStudySession } from '../hooks/useFreeStudySession'
import SessionSummary from '../components/review/SessionSummary'
import ChallengeManager from '../components/review/ChallengeManager'
import ConfirmExitModal from '../components/review/ConfirmExitModal'
import { cancelSpeech } from '../lib/tts'
import { MasteryWord } from '../lib/types'

export default function FreeStudyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedWords = (location.state as { words: MasteryWord[] })?.words || []
  
  const session = useFreeStudySession(selectedWords)
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)

  useEffect(() => {
    if (selectedWords.length === 0) {
      navigate('/mastery')
      return
    }
    session.initialize()
  }, [])

  if (session.isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4 mx-auto" />
          <p className="text-on-surface-variant font-black tracking-widest uppercase text-xs">Chuẩn bị đấu trường tự do...</p>
        </div>
      </div>
    )
  }

  if (session.isComplete) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* We wrap SessionSummary but customize the message */}
          <div className="mb-12 text-center">
            <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 mb-6">
              <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">Chế độ ôn tập tự do</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-2">Hoàn thành luyện tập!</h1>
            <p className="text-stone-500 font-medium">Lưu ý: Chỉ kết quả sai mới ảnh hưởng đến tiến độ SRS chính thức.</p>
          </div>
          
          <SessionSummary 
            stats={session.stats} 
            onRestart={() => navigate('/mastery')} 
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a0c] z-[9999] flex flex-col items-center overflow-hidden">
      {/* Zen Progress Bar */}
      <div className="w-full h-1.5 bg-white/5">
        <div 
          className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]" 
          style={{ width: `${((session.currentIndex) / session.totalCount) * 100}%` }}
        />
      </div>

      {/* Header Info */}
      <div className="w-full max-w-4xl px-8 flex justify-between items-center py-6 text-white/40 relative z-50">
        <button 
          onClick={() => setIsExitModalOpen(true)}
          className="flex items-center gap-2 hover:text-white transition-colors group pointer-events-auto"
        >
          <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-bold text-sm tracking-widest uppercase">Quay lại Kho</span>
        </button>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/5 py-1 px-3 rounded-full border border-white/5">
            <span className="text-primary font-black text-sm">{session.currentIndex + 1}</span>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-white/40 font-bold text-xs">{session.totalCount}</span>
          </div>
          <div className="px-3 py-1 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
            Free Study
          </div>
        </div>
      </div>

      {/* Challenge Area */}
      <div className="flex-1 w-full max-w-2xl px-8 flex flex-col justify-start items-center overflow-y-auto custom-scrollbar pt-12">
        {session.currentChallenge && (
          <ChallengeManager 
            key={session.currentChallenge.id}
            challenge={session.currentChallenge}
            onSubmit={session.submitAnswer}
          />
        )}
      </div>

      {/* Hotkey Guide */}
      <div className="py-8 text-white/10 flex gap-8 font-bold text-[10px] tracking-[0.2em] uppercase">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/5 rounded border border-white/5 min-w-[30px] text-center">SPACE</kbd>
          <span>Gợi ý</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/5 rounded border border-white/5 min-w-[30px] text-center">1-4</kbd>
          <span>Chọn đáp án</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/5 rounded border border-white/5 min-w-[30px] text-center">ENTER</kbd>
          <span>Tiếp tục</span>
        </div>
      </div>

      {/* Modals */}
      <ConfirmExitModal 
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={() => {
          cancelSpeech()
          navigate('/mastery')
        }}
      />
    </div>
  )
}
