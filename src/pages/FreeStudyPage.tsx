import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useFreeStudySession } from '../hooks/useFreeStudySession'
import SessionSummary from '../components/review/SessionSummary'
import ChallengeManager from '../components/review/ChallengeManager'
import ArenaShell from '../components/review/ArenaShell'
import { cancelSpeech } from '../lib/tts'
import { MasteryWord } from '../lib/types'

export default function FreeStudyPage() {
  const { deckId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Read selected words from MasteryPage navigation state if available
  const stateWords = location.state?.words as MasteryWord[] | undefined
  
  const session = useFreeStudySession(deckId || 'all', stateWords)
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)

  useEffect(() => {
    session.initialize()
  }, [deckId])

  if (session.isLoading) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#0891B2] rounded-full blur-[100px] animate-pulse" />
        </div>
        <div className="text-center animate-pulse relative z-10">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin mb-8 mx-auto" />
          <p className="text-cyan-500/40 font-black tracking-[0.3em] uppercase text-[10px]">Đang chuẩn bị phòng học tập...</p>
        </div>
      </div>
    )
  }

  if (session.isComplete) {
    return <SessionSummary stats={session.stats} onRestart={session.initialize} />
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
      modeLabel="Học tập tự do"
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
