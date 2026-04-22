import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useFreeStudySession } from '../hooks/useFreeStudySession'
import SessionSummary from '../components/review/SessionSummary'
import ChallengeManager from '../components/review/ChallengeManager'
import ArenaShell from '../components/review/ArenaShell'
import ArenaLoading from '../components/review/ArenaLoading'
import { cancelSpeech } from '../lib/tts'
import { useTranslation } from 'react-i18next'
import { MasteryWord } from '../lib/types'

export default function FreeStudyPage() {
  const { t } = useTranslation()
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
    return <ArenaLoading message={t('arena.preparingStudy')} colorClass="cyan-500" />
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
      modeLabel={t('arena.freeStudyLabel')}
      syncError={session.syncError}
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
