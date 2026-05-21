import { memo } from 'react'
import { Card } from '../../lib/srs'
import AudioButton from '../common/AudioButton'
import { useTranslation } from 'react-i18next'

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
  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 text-center shadow-sm transition-all sm:p-12">
      {/* Background Texture (Subtle) */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-oceanic-deep) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 w-full h-full flex flex-col">
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

        {/* English Word (Small, Above) */}
        <div className="mb-3 mt-1 flex flex-col items-center sm:mb-4 sm:mt-2">
          <span className="mb-1 font-label text-[10px] font-bold uppercase tracking-widest text-secondary">{t('flashcard.englishWord')}</span>
          <h2 className="break-words font-headline text-2xl font-bold leading-tight tracking-tight text-primary sm:text-3xl">{card.front}</h2>
          <div className="mt-1 text-outline text-xs">
            <div className="flex items-center justify-center gap-3">
              <span>/{card.front}/</span>
              <div className="flex items-center gap-1.5 ml-1">
                <AudioButton text={card.front} variant="ghost" size="sm" className="h-11 w-11 p-0" />
                <AudioButton text={card.front} slow variant="ghost" size="sm" className="h-11 w-11 p-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Spacer Line */}
        <div className="oceanic-pulse mx-auto mb-6 h-1 w-12 rounded-full sm:mb-10"></div>

        {/* Vietnamese Meaning (Prominent) */}
        <div className="grow flex flex-col items-center">
          <span className="text-secondary font-label font-bold tracking-widest text-[10px] uppercase mb-2">{t('flashcard.meaning')}</span>
          <p className="mb-5 font-headline text-2xl font-extrabold leading-tight text-on-surface sm:mb-8 sm:text-[32px] sm:font-black">
            {card.back}
          </p>

          {/* Context Sentence */}
          {card.example && (
            <div className="mb-3 mt-auto w-full rounded-xl bg-surface-container-low p-4 text-left sm:mb-4 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-lg mt-0.5 opacity-40">format_quote</span>
                <div className="space-y-2">
                  <p className="text-on-surface-variant font-body text-sm italic leading-relaxed">
                    &ldquo;{card.example}&rdquo;
                  </p>
                  {card.example_vi && (
                    <p className="text-on-surface-variant font-body text-xs leading-relaxed border-t border-outline-variant/10 pt-2 oceanic-pulse oceanic-glow opacity-70">
                      &ldquo;{card.example_vi}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer / Metadata */}
        <div className="mt-auto flex items-center justify-between border-t border-outline-variant/15 pt-4 text-[10px] font-bold uppercase tracking-widest text-outline sm:pt-6">
          <span className="text-stone-300 italic">{card.topic || t('flashcard.noTopic')}</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            {t('flashcard.srsReady')}
          </span>
        </div>
      </div>
    </div>
  )
})

export default FlashcardBack
