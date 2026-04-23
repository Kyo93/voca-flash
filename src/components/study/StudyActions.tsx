import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { DESIGN_TOKENS } from '../../lib/tokens'
import SRSButtons from '../SRSButtons'
import { SrsRating, IntervalPreview } from '../../lib/srs'

interface StudyActionsProps {
  isFlipped: boolean
  phase: 'FLIPPED' | 'READY_FOR_QUIZ' | 'CHALLENGING' | 'RATING'
  showCardBack: boolean
  suggestedRating: SrsRating | null
  intervalPreviews: IntervalPreview[]
  onFlip: () => void
  onMarkLearned: () => void
  onRate: (rating: SrsRating) => void
  onNextToChallenge: () => void
}

const StudyActions = memo(({
  isFlipped,
  phase,
  showCardBack,
  suggestedRating,
  intervalPreviews,
  onFlip,
  onMarkLearned,
  onRate,
  onNextToChallenge
}: StudyActionsProps) => {
  const { t } = useTranslation()

  if (!isFlipped) {
    return (
      <div className="flex flex-col gap-4 mt-8">
        <button
          onClick={onFlip}
          className={`w-full oceanic-pulse text-on-primary font-headline font-bold py-4 ${DESIGN_TOKENS.RADIUS.XL} ${DESIGN_TOKENS.SHADOW.LG} hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3`}
        >
          <span className="tracking-wide">{t('study.showAnswer')}</span>
          <span className="material-symbols-outlined">visibility</span>
        </button>
        <button
          onClick={onMarkLearned}
          className={`w-full bg-secondary text-on-secondary font-headline font-bold py-4 ${DESIGN_TOKENS.RADIUS.XL} ${DESIGN_TOKENS.SHADOW.MD} hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3`}
        >
          <span className="tracking-wide">{t('study.markLearned')}</span>
          <span className="material-symbols-outlined">check_circle</span>
        </button>
      </div>
    )
  }

  if (phase === 'RATING') {
    return (
      <div className="flex flex-col items-center mt-8">
        {suggestedRating !== null && (
          <p className="text-center text-primary text-xs mb-3 font-bold tracking-widest uppercase">
            {t('study.suggestedRating')}
          </p>
        )}
        <SRSButtons
          onRate={onRate}
          suggestedRating={suggestedRating}
          intervalPreviews={intervalPreviews}
        />
      </div>
    )
  }

  if (showCardBack) {
    return (
      <div className="mt-8">
        <button
          onClick={onNextToChallenge}
          className={`w-full oceanic-pulse text-on-primary font-headline font-bold py-4 ${DESIGN_TOKENS.RADIUS.XL} ${DESIGN_TOKENS.SHADOW.LG} hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3`}
        >
          <span className="tracking-wide">{t('common.next')}</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    )
  }

  return null
})

export default StudyActions
