import React from 'react'
import { format } from 'date-fns'
import { Locale } from 'date-fns/locale'
import { MasteryWord } from '../../lib/types'
import { getSrsLevelConfig } from '../../lib/srs'

interface CardRowProps {
  word: MasteryWord
  isSelected: boolean
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  isSelectedFocus: boolean
  onSelectFocus: () => void
  isNotebookSaved: boolean
  locale: Locale
}

/**
 * CardRow - A single row in the MasteryPage vocabulary table.
 * Standardizes SRS level badges, strength bars, and item selection.
 */
const CardRow = React.forwardRef<HTMLTableRowElement, CardRowProps>(({ 
  word, 
  isSelected, 
  onSelect, 
  isSelectedFocus, 
  onSelectFocus, 
  isNotebookSaved, 
  locale 
}, ref) => {
  const nextReviewDate = word.next_review_at ? new Date(word.next_review_at) : null
  const isDue = nextReviewDate && nextReviewDate <= new Date()
  
  const stability = Number(word.fsrs_stability ?? 0)
  const level = getSrsLevelConfig(stability)
  const strengthPercent = Math.min(100, (stability / 21) * 100)

  return (
    <tr 
      ref={ref}
      className={`group hover:bg-surface-container-low transition-all cursor-pointer ${isSelectedFocus ? 'bg-primary/10' : ''}`}
      onClick={onSelectFocus}
    >
      <td className="py-4 px-8">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={onSelect}
          className="w-5 h-5 rounded-lg border-surface-container-highest text-primary focus:ring-primary/20 accent-primary cursor-pointer transition-all"
        />
      </td>
      <td className="py-4 px-2">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors whitespace-nowrap tracking-tight">
            {word.word}
          </span>
          <span className="text-xs text-on-surface-variant font-normal truncate max-w-[200px] italic">
            {word.definition}
          </span>
          
          {/* Centralized Level Badge */}
          <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${level.bg} ${level.text} ${level.glow}`}>
            {level.label}
          </span>
        </div>
      </td>
      <td className="py-4 px-8 hidden lg:table-cell">
        {word.is_orphaned ? (
          <span className="inline-flex px-3 py-1 bg-red-50 text-red-500 text-[10px] font-semibold uppercase tracking-widest rounded-md">
            Mồ côi
          </span>
        ) : (
          <span className="inline-flex px-3 py-1 bg-surface-container text-on-surface-variant/60 text-[10px] font-semibold uppercase tracking-widest rounded-md">
            {word.topic_names?.split(',')[0]}
          </span>
        )}
      </td>
      <td className="py-4 px-8">
        {isNotebookSaved && (
          <span className="material-symbols-outlined text-primary text-xl fill-icon animate-in zoom-in duration-300">
            favorite
          </span>
        )}
      </td>
      <td className="py-4 px-8">
        <div className="flex items-center gap-3">
          <div className="w-20 h-2 bg-surface-container-low rounded-full overflow-hidden">
            <div 
              className={`h-full ${level.color} transition-all duration-1000 ${level.glow ? 'animate-pulse' : ''}`} 
              style={{ width: `${strengthPercent}%` }}
            />
          </div>
          <p className="text-[10px] font-normal text-on-surface-variant/40 uppercase leading-none">
            {stability.toFixed(1)}d
          </p>
        </div>
      </td>
      <td className="py-4 px-8 text-right">
        <span className={`text-[13px] font-medium ${isDue ? 'text-primary' : 'text-on-surface-variant/40'}`}>
          {nextReviewDate ? format(nextReviewDate, 'dd/MM/yy', { locale }) : '--'}
        </span>
      </td>
    </tr>
  )
})

CardRow.displayName = 'CardRow'

export default CardRow
