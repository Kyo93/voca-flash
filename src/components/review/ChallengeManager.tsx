import { useTranslation } from 'react-i18next'
import RecognitionChallenge from './RecognitionChallenge'
import GhostRecallChallenge from './GhostRecallChallenge'
import ContextGapChallenge from './ContextGapChallenge'
import ConstructionChallenge from './ConstructionChallenge'
import { ReviewChallenge } from '../../hooks/useReviewSession'

interface ChallengeManagerProps {
  challenge: ReviewChallenge
  onSubmit: (isCorrect: boolean) => void
}

export default function ChallengeManager({ challenge, onSubmit }: ChallengeManagerProps) {
  const { t } = useTranslation()
  return (
    <div key={challenge.id} className="w-full flex justify-center py-12">
      {renderQuadrant(challenge, onSubmit, t)}
    </div>
  )
}

function renderQuadrant(challenge: ReviewChallenge, onSubmit: (isCorrect: boolean) => void, t: (key: string, opts?: Record<string, string>) => string) {
  switch (challenge.quadrant) {
    case 'recognition':
      return (
        <RecognitionChallenge
          word={challenge.word}
          choices={challenge.choices}
          onSubmit={onSubmit}
        />
      )

    case 'ghost_recall':
      return (
        <GhostRecallChallenge
          word={challenge.word}
          onSubmit={onSubmit}
        />
      )

    case 'context_gap':
    case 'usage_master':
      return (
        <ContextGapChallenge
          word={challenge.word}
          onSubmit={onSubmit}
        />
      )

    case 'construction':
    case 'phonetics':
      return (
        <ConstructionChallenge
          word={challenge.word}
          onSubmit={onSubmit}
        />
      )

    default:
      return (
        <div className="text-center text-white/20">
          <p className="uppercase tracking-widest text-xs font-black mb-4">{t('arena.debugSimulation')}: {challenge.quadrant}</p>
          <h2 className="text-6xl font-black text-white mb-8">{challenge.word.word}</h2>
          <button
            onClick={() => onSubmit(true)}
            className="px-12 py-4 bg-primary text-white font-black rounded-2xl"
          >
            {t('arena.debugConfirm')}
          </button>
        </div>
      )
  }
}
