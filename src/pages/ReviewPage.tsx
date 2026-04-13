import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReviewSession } from '../hooks/useReviewSession'
import SessionSummary from '../components/review/SessionSummary'
import ChallengeManager from '../components/review/ChallengeManager'
import ArenaShell from '../components/review/ArenaShell'
import { cancelSpeech } from '../lib/tts'

export default function ReviewPage() {
  const navigate = useNavigate()
  const session = useReviewSession()
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)

  useEffect(() => {
    session.initialize()
  }, [])

  if (session.isLoading) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center relative overflow-hidden">
        {/* Subtle Loading Blobs */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary rounded-full blur-[100px] animate-pulse" />
        </div>
        <div className="text-center animate-pulse relative z-10">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-8 mx-auto" />
          <p className="text-primary/40 font-black tracking-[0.3em] uppercase text-[10px]">Đang chuẩn bị đấu trường...</p>
        </div>
      </div>
    )
  }

  if (session.isComplete && session.stats.correct + session.stats.wrong > 0) {
    return <SessionSummary stats={session.stats} onRestart={session.initialize} />
  }

  if (session.isComplete && session.stats.correct + session.stats.wrong === 0) {
    return (
      <ArenaShell
        progress={100}
        total={0}
        currentIndex={0}
        points={0}
        onExitClick={() => navigate('/dashboard')}
        isExitModalOpen={false}
        onExitClose={() => {}}
        onExitConfirm={() => {}}
      >
        <div className="max-w-md mx-auto text-center py-20">
          <div className="w-24 h-24 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center mb-10 mx-auto border border-primary/20 shadow-2xl glass-arena-item">
            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-6 tracking-tight">Kỷ lục tuyệt vời!</h1>
          <p className="text-white/40 mb-12 font-medium leading-relaxed">Bạn đã thuộc hết từ vựng rồi. Hiện không còn từ nào cần ôn tập hôm nay. Hãy quay lại sau khi hệ thống nhắc nhở nhé!</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Quay lại Dashboard
          </button>
        </div>
      </ArenaShell>
    )
  }

  return (
    <ArenaShell
      progress={(session.currentIndex / session.totalCount) * 100}
      total={session.totalCount}
      currentIndex={session.currentIndex}
      points={session.stats.points}
      onExitClick={() => setIsExitModalOpen(true)}
      isExitModalOpen={isExitModalOpen}
      onExitClose={() => setIsExitModalOpen(false)}
      onExitConfirm={() => {
        cancelSpeech()
        navigate('/dashboard')
      }}
    >
      {session.currentChallenge && (
        <ChallengeManager 
          key={session.currentChallenge.id}
          challenge={session.currentChallenge}
          onSubmit={session.submitAnswer}
        />
      )}
    </ArenaShell>
  )
}
