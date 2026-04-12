import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useReviewSession } from '../hooks/useReviewSession'
import SessionSummary from '../components/review/SessionSummary'
import ChallengeManager from '../components/review/ChallengeManager'
import ConfirmExitModal from '../components/review/ConfirmExitModal'
import { useState } from 'react'
import { cancelSpeech } from '../lib/speech'

export default function ReviewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const session = useReviewSession()
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)

  useEffect(() => {
    session.initialize()
  }, [])

  if (session.isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4 mx-auto" />
          <p className="text-on-surface-variant font-black tracking-widest uppercase text-xs">Chuẩn bị đấu trường...</p>
        </div>
      </div>
    )
  }

  if (session.isComplete && session.stats.correct + session.stats.wrong > 0) {
    return <SessionSummary stats={session.stats} onRestart={session.initialize} />
  }

  if (session.isComplete && session.stats.correct + session.stats.wrong === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-8 mx-auto">
            <span className="material-symbols-outlined text-5xl">auto_awesome</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Bạn đã thuộc hết từ rồi!</h1>
          <p className="text-on-surface-variant mb-12">Hiện không có từ nào cần ôn tập hôm nay. Hãy quay lại sau khi hệ thống nhắc nhở nhé.</p>
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all"
          >
            Quay lại Dashboard
          </Link>
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
          <span className="font-bold text-sm tracking-widest uppercase">Thoát</span>
        </button>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/5 py-1 px-3 rounded-full border border-white/5">
            <span className="text-primary font-black text-sm">{session.currentIndex + 1}</span>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-white/40 font-bold text-xs">{session.totalCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">workspace_premium</span>
            <span className="text-white font-black text-lg">{session.stats.points}</span>
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
          <span>Reveal Hint</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/5 rounded border border-white/5 min-w-[30px] text-center">1-4</kbd>
          <span>Select Answer</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/5 rounded border border-white/5 min-w-[30px] text-center">ENTER</kbd>
          <span>Continue</span>
        </div>
      </div>

      {/* Modals */}
      <ConfirmExitModal 
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={() => {
          cancelSpeech()
          navigate('/dashboard')
        }}
      />
    </div>
  )
}
