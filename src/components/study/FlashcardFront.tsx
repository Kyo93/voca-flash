import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '../../lib/srs'
import { UI_DEFAULTS } from '../../lib/constants'
import AudioButton from '../common/AudioButton'

interface FlashcardFrontProps {
  card: Card
}

/**
 * FlashcardFront - The front face of the learning card.
 * Displays the word, phonetic, images, and audio controls.
 */
const FlashcardFront = memo(({ card }: FlashcardFrontProps) => {
  const { t } = useTranslation()
  const imageUrl = card.image_url || UI_DEFAULTS.FLASHCARD_FALLBACK_IMAGE
  const imagePosition = card.image_position || 'center'

  return (
    <div className="w-full h-full bg-surface-container-lowest rounded-xl shadow-[0px_12px_32px_rgba(26,27,33,0.06)] overflow-hidden flex flex-col border border-outline-variant/10 relative">
      {/* 4:3 Visual Context Image */}
      <div className="aspect-4/3 w-full overflow-hidden bg-surface-container-low relative">
        <img
          alt={card.front}
          className="w-full h-full object-cover"
          src={imageUrl}
          style={{ objectPosition: imagePosition }}
        />
      </div>

      {/* Content Section */}
      <div className="p-8 space-y-6 grow flex flex-col justify-start">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight">{card.front}</h1>
            {(() => {
              const basePhonetic = card.phonetic || card.front;
              const formattedPhonetic = basePhonetic.startsWith('/') ? basePhonetic : `/${basePhonetic}/`;
              return <p className="text-secondary font-medium tracking-wide text-lg">{formattedPhonetic}</p>;
            })()}
          </div>
          <div className="flex gap-2">
            <AudioButton text={card.front} variant="tactile" size="md" />
            <AudioButton text={card.front} slow variant="tactile" size="md" />
          </div>
        </div>

        {/* Asymmetric Divider */}
        <div className="w-12 h-1 bg-secondary-fixed rounded-full shrink-0" />

        {/* Contextual Usage */}
        {card.example && (
          <div className="space-y-3">
            <span className="font-label text-[10px] uppercase tracking-widest text-outline font-bold block">
              {t('flashcard.contextUsage')}
            </span>
            <blockquote className="text-on-surface-variant leading-relaxed text-lg italic border-l-2 border-surface-container-highest pl-4 py-1 text-left">
              &ldquo;{card.example}&rdquo;
            </blockquote>
          </div>
        )}
      </div>
    </div>
  )
})

export default FlashcardFront
