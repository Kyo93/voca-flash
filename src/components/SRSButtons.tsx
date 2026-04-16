import type { SrsRating, IntervalPreview } from '../lib/srs'

interface SRSButtonsProps {
  onRate: (rating: SrsRating) => void
  suggestedRating?: SrsRating | null
  intervalPreviews?: IntervalPreview[]
}

const RATING_LABELS: Record<SrsRating, string> = { 1: 'Quên', 2: 'Khó', 3: 'Vừa', 4: 'Dễ' }
const RATING_SUB_LABELS: Record<SrsRating, string> = { 1: 'Lại', 2: 'Trễ', 3: 'Chuẩn', 4: 'Sớm' }

export default function SRSButtons({
  onRate,
  suggestedRating,
  intervalPreviews,
}: SRSButtonsProps) {
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
                {RATING_LABELS[rating]}
              </span>

              {/* Sub-label */}
              <span className="text-[10px] text-outline tracking-wider uppercase">
                {RATING_SUB_LABELS[rating]}
              </span>

              {/* Interval preview */}
              {preview && (
                <span className={`text-[9px] font-medium mt-1 ${
                  isSuggested ? 'text-primary' : 'text-outline'
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
