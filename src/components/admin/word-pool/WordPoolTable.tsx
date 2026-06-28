import { useTranslation } from 'react-i18next'
import { TAG_META } from '../../../lib/tag-constants'
import { DESIGN_TOKENS } from '../../../lib/tokens'
import DifficultyPill from '../DifficultyPill'
import LoadingSpinner from '../../common/LoadingSpinner'
import type { EnrichedWord } from '../WordPool'

const FALLBACK_TAG_COLOR = DESIGN_TOKENS.COLORS.PRIMARY

interface Props {
  visibleWords: EnrichedWord[]
  selectedWordIds: Set<string>
  onToggle: (id: string) => void
  onToggleAll: () => void
  loading: boolean
  search: string
  activeTagFilter: string | null
  allSelected: boolean
  someSelected: boolean
}

export function WordPoolTable({
  visibleWords,
  selectedWordIds,
  onToggle,
  onToggleAll,
  loading,
  search,
  activeTagFilter,
  allSelected,
  someSelected,
}: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex-1 overflow-hidden rounded-xl bg-white border border-stone-100">
      <div className="overflow-y-auto h-full custom-scrollbar">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low border-b border-stone-200/50 sticky top-0 z-10">
            <tr className="text-stone-500 font-medium text-xs uppercase tracking-widest">
              <th className="p-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = !allSelected && someSelected }}
                  onChange={onToggleAll}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                  title={t('admin.wordPool.all')}
                />
              </th>
              <th className="p-4">{t('admin.wordPool.tableHeader.word')}</th>
              <th className="p-4">{t('admin.wordPool.tableHeader.phonetic')}</th>
              <th className="p-4">{t('admin.wordPool.tableHeader.meaning')}</th>
              <th className="p-4">{t('admin.wordPool.tableHeader.difficulty')}</th>
              <th className="p-4">{t('admin.wordPool.tableHeader.tags')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <LoadingSpinner label={t('common.loading')} />
                </td>
              </tr>
            ) : visibleWords.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <p className="text-stone-400">
                    {search || activeTagFilter ? t('admin.wordPool.noResults') : t('admin.wordPool.empty')}
                  </p>
                </td>
              </tr>
            ) : visibleWords.map((word) => {
              const isSelected = selectedWordIds.has(word.id)
              const primaryTag = word.tags[0]
              const tagMeta = primaryTag ? TAG_META[primaryTag] : null
              const tagColor = tagMeta?.color ?? FALLBACK_TAG_COLOR

              return (
                <tr
                  key={word.id}
                  className={`hover:bg-surface-container-lowest transition-colors group ${isSelected ? 'bg-orange-50/50' : ''}`}
                >
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggle(word.id)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="p-4 font-medium text-on-surface">{word.word}</td>
                  <td className="p-4 text-stone-400 font-mono text-xs">{word.phonetic}</td>
                  <td className="p-4 max-w-xs truncate" title={word.definition}>
                    {word.definition}
                  </td>
                  <td className="p-4">
                    <DifficultyPill value={word.difficulty ?? 3} />
                  </td>
                  <td className="p-4">
                    {primaryTag && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white whitespace-nowrap"
                        style={{ backgroundColor: tagColor }}
                      >
                        {tagMeta?.label ?? primaryTag}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
