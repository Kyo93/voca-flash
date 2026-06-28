import { useTranslation } from 'react-i18next'
import { STUDY_SESSION_DEFAULTS } from '../../lib/constants'
import StudyChallengeShell from '../StudyChallengeShell'
import type { Word } from '../../lib/types'
import type { StudyChallengeType } from '../../lib/srs'

interface ChallengingScreenProps {
  timerSeconds: number
  currentChallengeType: StudyChallengeType
  word: Word
  precomputedChoices: string[]
  onSubmit: (isCorrect: boolean) => void
  onSkip: () => void
}

export default function ChallengingScreen({
  timerSeconds,
  currentChallengeType,
  word,
  precomputedChoices,
  onSubmit,
  onSkip
}: ChallengingScreenProps) {
  const { t } = useTranslation()
  const isWarning = timerSeconds <= STUDY_SESSION_DEFAULTS.WARNING_THRESHOLD_S
  const borderColor = isWarning ? 'var(--color-error)' : 'var(--color-secondary)'
  const borderGlow = `0 0 8px ${borderColor}`
  const timerProgress = `${(timerSeconds / STUDY_SESSION_DEFAULTS.TIMER_SECONDS) * 100}%`
  const timerTextClass = isWarning ? 'text-error animate-pulse' : 'text-secondary'

  return (
    <div className="w-full relative rounded-2xl overflow-hidden bg-surface-container-lowest shadow-lg">
      {/* Snake border — 4 edges */}
      <div className="absolute top-0 left-0 h-[3px] rounded-full transition-all duration-1000 ease-linear"
        style={{ backgroundColor: borderColor, width: timerProgress, boxShadow: borderGlow }} />
      <div className="absolute top-0 right-0 w-[3px] h-full rounded-full transition-all duration-1000 ease-linear"
        style={{ backgroundColor: borderColor, height: timerProgress, boxShadow: borderGlow }} />
      <div className="absolute bottom-0 right-0 h-[3px] rounded-full transition-all duration-1000 ease-linear"
        style={{ backgroundColor: borderColor, width: timerProgress, boxShadow: borderGlow }} />
      <div className="absolute bottom-0 left-0 w-[3px] h-full rounded-full transition-all duration-1000 ease-linear"
        style={{ backgroundColor: borderColor, height: timerProgress, boxShadow: borderGlow }} />

      {/* Timer bar */}
      <div className="flex items-center justify-between bg-surface-container-low px-4 py-2.5 sm:px-5 sm:py-3">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-xl ${timerTextClass}`}>timer</span>
          <span className={`font-headline font-semibold text-lg tabular-nums ${timerTextClass}`}>
            {timerSeconds}s
          </span>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-widest border ${
          currentChallengeType === 'cloze'
            ? 'text-primary bg-primary/8 border-primary/20'
            : currentChallengeType === 'listen'
              ? 'text-secondary bg-secondary/8 border-secondary/20'
              : 'text-tertiary bg-tertiary/8 border-tertiary/20'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {currentChallengeType === 'cloze' 
            ? t('challenges.cloze') 
            : currentChallengeType === 'listen' 
              ? t('challenges.listen') 
              : t('challenges.recognition')}
        </span>
      </div>

      {/* Challenge body */}
      <div className="bg-surface-container-lowest p-4 sm:p-6">
        <StudyChallengeShell
          type={currentChallengeType}
          word={word}
          choices={precomputedChoices}
          onSubmit={onSubmit}
        />
        <button
          onClick={onSkip}
          className="mt-4 w-full text-center text-xs font-medium uppercase tracking-widest text-outline transition-colors hover:text-primary sm:mt-6"
        >
          {t('arena.skipQuiz')}
        </button>
      </div>
    </div>
  )
}
