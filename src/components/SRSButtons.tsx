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
              className={`flex flex-col items-center gap-1 rounded-2xl border p-4 transition-all active:scale-95 ${
                isSuggested
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 -m-0.5 ring-2 ring-primary/30'
                  : 'border-outline-variant/20 bg-surface-container-low hover:bg-surface-container transition-shadow'
              }`}
            >
              {/* Main label */}
              <span className={`text-sm font-headline font-bold tracking-tight ${
                isSuggested ? 'text-primary' : 'text-on-surface'
              }`}>
                {t(`srs.${RATING_KEYS[rating]}`)}
              </span>

              {/* Sub-label */}
              <span className="text-[10px] text-on-surface-variant opacity-60 tracking-wider uppercase">
                {t(`srs.subLabels.${RATING_KEYS[rating]}`)}
              </span>

              {/* Interval preview */}
              {preview && (
                <span className={`text-[11px] font-bold mt-1.5 px-2 py-0.5 rounded-full ${
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
