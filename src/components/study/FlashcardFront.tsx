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
    <div className="w-full h-full bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col border border-outline-variant/20 relative">
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
      <div className="flex grow flex-col justify-start space-y-4 p-5 sm:space-y-6 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="break-words font-headline text-3xl font-extrabold leading-tight tracking-tight text-primary sm:text-4xl">{card.front}</h1>
            {(() => {
              const basePhonetic = card.phonetic || card.front;
              const formattedPhonetic = basePhonetic.startsWith('/') ? basePhonetic : `/${basePhonetic}/`;
              return <p className="text-base font-medium tracking-wide text-secondary sm:text-lg">{formattedPhonetic}</p>;
            })()}
          </div>
          <div className="flex gap-2">
            <AudioButton text={card.front} variant="tactile" size="md" className="h-11 w-11 p-0" />
            <AudioButton text={card.front} slow variant="tactile" size="md" className="h-11 w-11 p-0" />
          </div>
        </div>

        {/* Asymmetric Divider */}
        <div className="w-12 h-1 bg-secondary-fixed rounded-full shrink-0" />

        {/* Contextual Usage */}
        {card.example && (
          <div className="space-y-2 sm:space-y-3">
            <span className="font-label text-[10px] uppercase tracking-widest text-outline font-medium block">
              {t('flashcard.contextUsage')}
            </span>
            <blockquote className="border-l-2 border-surface-container-highest py-1 pl-4 text-left text-sm italic leading-6 text-on-surface-variant sm:text-lg sm:leading-relaxed">
              &ldquo;{card.example}&rdquo;
            </blockquote>
          </div>
        )}
      </div>
    </div>
  )
})

export default FlashcardFront
