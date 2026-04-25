import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReviewSession } from '../hooks/useReviewSession'
import SessionSummary from '../components/review/SessionSummary'
import ChallengeManager from '../components/review/ChallengeManager'
import ArenaShell from '../components/review/ArenaShell'
import ArenaLoading from '../components/review/ArenaLoading'
import { cancelSpeech } from '../lib/tts'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useCharacterCollection } from '../hooks/useCharacterCollection'
import CharacterReactionAvatar from '../components/characters/CharacterReactionAvatar'
import type { CharacterAnimationState } from '../lib/character-assets'

export default function ReviewPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const session = useReviewSession()
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)
  const [mascotReaction, setMascotReaction] = useState<CharacterAnimationState>('idle')
  const { collection: characterCollection } = useCharacterCollection(user?.id)

  useEffect(() => {
    session.initialize()
  }, [])

  const handleMascotReactionEnd = useCallback(() => {
    setMascotReaction('idle')
  }, [])

  const handleReviewSubmit = useCallback((isCorrect: boolean, isSkipped?: boolean) => {
    setMascotReaction(isCorrect && !isSkipped ? 'correct' : 'wrong')
    session.submitAnswer(isCorrect, isSkipped)
  }, [session.submitAnswer])

  if (session.isLoading) {
    return <ArenaLoading />
  }

  if (session.isComplete && session.stats.correct + session.stats.wrong > 0) {
    return (
      <SessionSummary
        stats={session.stats}
        rewardProgress={session.rewardProgress}
        unlockedBadges={session.sessionUnlockedBadges}
        onRestart={session.initialize}
        mascot={
          <CharacterReactionAvatar
            collection={characterCollection}
            animationState="celebrate"
            animated
            size="md"
          />
        }
      />
    )
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
        onExitClose={() => { }}
        onExitConfirm={() => { }}
      >
        <div className="max-w-md mx-auto text-center py-20">
          <div className="w-24 h-24 rounded-4xl bg-primary/10 text-primary flex items-center justify-center mb-10 mx-auto border border-primary/20 shadow-2xl glass-arena-item">
            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-6 tracking-tight">{t('arena.recordTitle')}</h1>
          <p className="text-white/40 mb-12 font-medium leading-relaxed">{t('arena.recordSubtitle')}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            {t('arena.backToDashboard')}
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
      rewardProgress={session.rewardProgress}
      onExitClick={() => setIsExitModalOpen(true)}
      isExitModalOpen={isExitModalOpen}
      onExitClose={() => setIsExitModalOpen(false)}
      onExitConfirm={() => {
        cancelSpeech()
        navigate('/dashboard')
      }}
      syncError={session.syncError}
      mascot={
        <CharacterReactionAvatar
          collection={characterCollection}
          animationState={mascotReaction}
          animated
          size="sm"
          onReactionEnd={handleMascotReactionEnd}
        />
      }
    >
      {session.currentChallenge && (
        <ChallengeManager
          key={session.currentChallenge.id}
          challenge={session.currentChallenge}
          onSubmit={handleReviewSubmit}
        />
      )}
    </ArenaShell>
  )
}
