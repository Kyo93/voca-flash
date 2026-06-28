import { memo } from 'react'
import { Card } from '../../lib/srs'
import AudioButton from '../common/AudioButton'
import { useTranslation } from 'react-i18next'
import { UI_DEFAULTS } from '../../lib/constants'

interface FlashcardBackProps {
  card: Card
  isSaved: boolean
  onToggleNotebook: () => void
}

/**
 * FlashcardBack - The back face of the learning card.
 * Displays meaning, examples, and SRS metadata.
 */
const FlashcardBack = memo(({
  card,
  isSaved,
  onToggleNotebook
}: FlashcardBackProps) => {
  const { t } = useTranslation()
  const imageUrl = card.image_url || UI_DEFAULTS.FLASHCARD_FALLBACK_IMAGE
  const imagePosition = card.image_position || 'center'

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 text-left transition-all sm:p-12">
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover opacity-60 blur-[1.5px]"
        src={imageUrl}
        style={{ objectPosition: imagePosition }}
      />
      <div className="pointer-events-none absolute inset-0 bg-surface-container-lowest/55" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-surface-container-lowest/90 via-surface-container-lowest/50 to-surface-container-lowest/65" />

      <div className="relative z-10 flex h-full w-full flex-col">
        {/* Notebook Toggle (Top Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleNotebook()
          }}
          className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-outline-variant transition-all hover:text-red-500 active:scale-90"
          title={isSaved ? t('flashcard.removeFromNotebook') : t('flashcard.saveToNotebook')}
        >
          <span className={`material-symbols-outlined text-2xl transition-colors ${isSaved ? 'text-error fill-icon' : ''}`}
            style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>
            favorite
          </span>
        </button>

        {/* Word Block */}
        <div className="max-w-[78%]">
          <span className="font-label text-[10px] font-medium uppercase tracking-widest text-secondary">{t('flashcard.englishWord')}</span>
          <h2 className="mt-1 break-words font-headline text-2xl font-medium leading-tight tracking-tight text-primary sm:text-3xl">{card.front}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant">
            <span className="font-medium">/{card.front}/</span>
            <AudioButton text={card.front} variant="ghost" size="sm" className="h-9 w-9 p-0" />
            <AudioButton text={card.front} slow variant="ghost" size="sm" className="h-9 min-w-11 px-1.5 py-0" />
          </div>
        </div>

        {/* Vietnamese Meaning (Prominent) */}
        <div className="mt-7 border-l-2 border-secondary/45 pl-4">
          <span className="font-label text-[10px] font-medium uppercase tracking-widest text-secondary">{t('flashcard.meaning')}</span>
          <p className="mt-2 font-headline text-2xl font-extrabold leading-tight text-on-surface sm:text-[32px] sm:font-semibold">
            {card.back}
          </p>
        </div>

        {/* Context Sentence */}
        {card.example && (
          <div className="mt-auto rounded-xl bg-surface-container-low/90 px-4 py-3 shadow-sm backdrop-blur-sm sm:p-5">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined mt-0.5 text-base text-secondary/45">format_quote</span>
              <div className="min-w-0 space-y-1.5">
                <p className="font-body text-sm italic leading-relaxed text-on-surface-variant">
                  &ldquo;{card.example}&rdquo;
                </p>
                {card.example_vi && (
                  <p className="font-body text-sm font-medium leading-relaxed text-on-surface">
                    &ldquo;{card.example_vi}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

export default FlashcardBack
