import React from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Locale } from 'date-fns/locale'
import { MasteryWord } from '../../lib/types'
import { SrsLevelBadge } from './SrsLevelBadge'

interface CardRowProps {
  word: MasteryWord
  isSelected: boolean
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  isSelectedFocus: boolean
  onSelectFocus: () => void
  isNotebookSaved: boolean
  onToggleNotebook: (e: React.MouseEvent) => void
  onEditNote: (e: React.MouseEvent) => void
  personalNote: string | null
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
  onToggleNotebook,
  onEditNote,
  personalNote,
  locale
}, ref) => {
  const { t } = useTranslation()
  const nextReviewDate = word.next_review_at ? new Date(word.next_review_at) : null
  const isDue = nextReviewDate && nextReviewDate <= new Date()

  const stability = Number(word.fsrs_stability ?? 0)
  const reps = Number(word.fsrs_reps ?? 0)
  const lapses = Number(word.fsrs_lapses ?? 0)

  return (
    <tr
      ref={ref}
      className={`group hover:bg-[#F2F4F0] transition-all cursor-pointer border-none ${isSelectedFocus ? 'bg-[#F2F4F0]' : ''}`}
      onClick={onSelectFocus}
    >
      <td className="py-6 px-8">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-5 h-5 rounded-lg border-outline-variant text-primary focus:ring-primary/20 accent-primary cursor-pointer transition-all"
        />
      </td>
      <td className="py-6 px-2">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-base font-bold text-on-surface group-hover:text-primary transition-colors whitespace-nowrap tracking-tight leading-none">
                {word.word}
              </span>
              {word.phonetic && (
                <span className="text-[11px] font-medium text-on-surface-variant/40 font-mono tracking-wider">
                  /{word.phonetic.replace(/\//g, '')}/
                </span>
              )}
            </div>
            <span className="text-xs text-on-surface-variant/60 font-medium truncate max-w-[200px] italic leading-none">
              {word.definition}
            </span>
          </div>

          <SrsLevelBadge stability={stability} />
        </div>
      </td>
      <td className="py-6 px-8">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleNotebook}
            className={`material-symbols-outlined text-xl transition-all hover:scale-110 active:scale-95 ${isNotebookSaved ? 'text-primary fill-icon' : 'text-on-surface-variant/20 hover:text-primary/40'
              }`}
          >
            {isNotebookSaved ? 'favorite' : 'favorite_border'}
          </button>

          {personalNote && (
            <button
              onClick={onEditNote}
              className="material-symbols-outlined text-lg text-secondary/60 hover:text-secondary transition-colors"
              title={personalNote}
            >
              sticky_note_2
            </button>
          )}
        </div>
      </td>
      <td className="py-6 px-8">
        <SrsLevelBadge stability={stability} showStrength hideLabel />
      </td>
      <td className="py-6 px-8 hidden md:table-cell">
        <div className="flex items-center gap-3 text-[11px] font-bold tracking-tight">
          <span className="inline-flex items-center gap-1 text-on-surface-variant/60" title={t('mastery.table.repsTooltip', { count: reps })}>
            <span className="material-symbols-outlined text-sm text-primary/60">check_circle</span>
            {reps}
          </span>
          <span
            className={`inline-flex items-center gap-1 ${lapses > 0 ? 'text-error/70' : 'text-on-surface-variant/30'}`}
            title={t('mastery.table.lapsesTooltip', { count: lapses })}
          >
            <span className="material-symbols-outlined text-sm">cancel</span>
            {lapses}
          </span>
        </div>
      </td>
      <td className="py-6 px-8 text-right">
        <div className="flex items-center justify-end gap-4">
          {/* Quick Actions (revealed on hover) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 hover:bg-white rounded-lg text-on-surface-variant/40 hover:text-primary transition-all">
              <span className="material-symbols-outlined text-lg">edit_note</span>
            </button>
            <button className="p-1.5 hover:bg-white rounded-lg text-on-surface-variant/40 hover:text-secondary transition-all">
              <span className="material-symbols-outlined text-lg">archive</span>
            </button>
          </div>

          <span className={`text-xs font-bold tracking-tight ${isDue ? 'text-primary' : 'text-on-surface-variant/40'}`}>
            {nextReviewDate ? format(nextReviewDate, 'dd/MM/yy', { locale }) : '--'}
          </span>
        </div>
      </td>
    </tr>
  )
})

CardRow.displayName = 'CardRow'

export default CardRow
