import { useTranslation } from 'react-i18next'

interface ScholarlyABCFilterProps {
  selectedLetter: string | null
  onLetterSelect: (letter: string | null) => void
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function ScholarlyABCFilter({ selectedLetter, onLetterSelect }: ScholarlyABCFilterProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap items-center gap-1 mb-8 px-4 py-3 bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-sm">
      <button
        onClick={() => onLetterSelect(null)}
        className={`
          px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300
          ${selectedLetter === null 
            ? 'bg-primary text-on-primary shadow-md' 
            : 'text-on-surface-variant/40 hover:text-primary hover:bg-primary/5'}
        `}
      >
        {t('mastery.filters.all') || 'All'}
      </button>

      <div className="w-px h-4 bg-outline-variant/20 mx-1" />

      {LETTERS.map(letter => (
        <button
          key={letter}
          onClick={() => onLetterSelect(letter)}
          className={`
            w-8 h-8 flex items-center justify-center rounded-lg text-[11px] font-black transition-all duration-300
            ${selectedLetter === letter 
              ? 'bg-primary text-on-primary shadow-md scale-110' 
              : 'text-on-surface-variant/40 hover:text-primary hover:bg-primary/5 hover:scale-105'}
          `}
        >
          {letter}
        </button>
      ))}

      <button
        onClick={() => onLetterSelect('#')}
        className={`
          w-8 h-8 flex items-center justify-center rounded-lg text-[11px] font-black transition-all duration-300
          ${selectedLetter === '#' 
            ? 'bg-primary text-on-primary shadow-md scale-110' 
            : 'text-on-surface-variant/40 hover:text-primary hover:bg-primary/5 hover:scale-105'}
        `}
      >
        #
      </button>
    </div>
  )
}
