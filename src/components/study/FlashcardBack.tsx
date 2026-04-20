import { Card } from '../../lib/srs'
import AudioButton from '../common/AudioButton'

interface FlashcardBackProps {
  card: Card
  isSaved: boolean
  onToggleNotebook: () => void
}

/**
 * FlashcardBack - The back face of the learning card.
 * Displays meaning, examples, and SRS metadata.
 */
export default function FlashcardBack({ 
  card, 
  isSaved, 
  onToggleNotebook 
}: FlashcardBackProps) {
  return (
    <div className="relative w-full h-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col items-center text-center p-12 transition-all border border-outline-variant/10">
      {/* Background Texture (Subtle) */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #00236f 1px, transparent 0)',
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
          className="absolute top-0 right-0 p-2 text-outline-variant hover:text-red-500 transition-all active:scale-90 group"
          title={isSaved ? 'Xóa khỏi sổ tay' : 'Lưu vào sổ tay'}
        >
          <span className={`material-symbols-outlined text-2xl transition-colors ${isSaved ? 'text-[var(--color-error,#B3261E)] fill-icon' : ''}`} 
                style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>
            favorite
          </span>
        </button>

        {/* English Word (Small, Above) */}
        <div className="flex flex-col items-center mt-2 mb-4">
          <span className="text-secondary font-label font-bold tracking-widest text-[10px] uppercase mb-1">English Word</span>
          <h2 className="text-primary font-headline text-3xl font-bold tracking-tight">{card.front}</h2>
          <div className="mt-1 text-outline text-xs">
            <div className="flex items-center justify-center gap-3">
              <span>/{card.front}/</span>
              <div className="flex items-center gap-1.5 ml-1">
                <AudioButton text={card.front} variant="ghost" size="sm" />
                <AudioButton text={card.front} slow variant="ghost" size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Spacer Line */}
        <div className="w-12 h-1 oceanic-pulse rounded-full mx-auto mb-10"></div>

        {/* Vietnamese Meaning (Prominent) */}
        <div className="flex-grow flex flex-col items-center">
          <span className="text-secondary font-label font-bold tracking-widest text-[10px] uppercase mb-2">Meaning</span>
          <p className="text-on-surface font-headline text-[32px] font-black leading-tight mb-8">
            {card.back}
          </p>

          {/* Context Sentence */}
          {card.example && (
            <div className="bg-surface-container-low p-6 rounded-xl text-left w-full mt-auto mb-4">
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
        <div className="mt-auto pt-6 border-t border-outline-variant/15 flex justify-between items-center text-outline text-[10px] font-bold uppercase tracking-widest">
          <span className="text-stone-300 italic">{card.topic || 'Không có chủ đề'}</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            SRS READY
          </span>
        </div>
      </div>
    </div>
  )
}
