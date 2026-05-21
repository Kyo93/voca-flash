import { useTranslation } from 'react-i18next'
import type { SrsRating, IntervalPreview } from '../lib/srs'

interface SRSButtonsProps {
  onRate: (rating: SrsRating) => void
  suggestedRating?: SrsRating | null
  intervalPreviews?: IntervalPreview[]
}

const RATING_KEYS: Record<SrsRating, string> = { 1: 'again', 2: 'hard', 3: 'good', 4: 'easy' }

export default function SRSButtons({
  onRate,
  suggestedRating,
  intervalPreviews,
}: SRSButtonsProps) {
  const { t } = useTranslation()
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2">
        {([1, 2, 3, 4] as SrsRating[]).map(rating => {
          const preview = intervalPreviews?.find(p => p.rating === rating)
          const isSuggested = rating === suggestedRating

          return (
            <button
              key={rating}
              onClick={() => onRate(rating)}
              className={`flex min-h-16 flex-col items-center gap-1 rounded-2xl border p-2.5 sm:p-4 transition-all active:scale-95 ${
                isSuggested
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 -m-0.5 ring-2 ring-primary/30'
                  : 'border-outline-variant/20 bg-surface-container-low hover:bg-surface-container transition-shadow'
              }`}
            >
              {/* Main label */}
              <span className={`font-headline text-xs font-bold tracking-tight sm:text-sm ${
                isSuggested ? 'text-primary' : 'text-on-surface'
              }`}>
                {t(`srs.${RATING_KEYS[rating]}`)}
              </span>

              {/* Sub-label */}
              <span className="text-[9px] uppercase tracking-wider text-on-surface-variant opacity-60 sm:text-[10px]">
                {t(`srs.subLabels.${RATING_KEYS[rating]}`)}
              </span>

              {/* Interval preview */}
              {preview && (
                <span className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold sm:mt-1.5 sm:text-[11px] ${
                  isSuggested 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-surface-container-highest/50 text-on-surface-variant'
                }`}>
                  {preview.label}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
