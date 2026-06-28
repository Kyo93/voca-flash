import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Word } from '../../../lib/types'
import { formatDetailedDate } from '../../../lib/utils'
import DifficultyDots from '../DifficultyDots'

const MAX_VISIBLE_TAGS = 2
const ROW_ANIMATION_STAGGER_S = 0.02

interface WordsTableProps {
  paginated: Word[];
  selectedIds: Set<string>;
  allSelected: boolean;
  someSelected: boolean;
  toggleAll: () => void;
  toggleOne: (id: string) => void;
  setEditWordData: (word: Word) => void;
  setDeleteTarget: (word: Word) => void;
}

export default function WordsTable({
  paginated, selectedIds, allSelected, someSelected,
  toggleAll, toggleOne, setEditWordData, setDeleteTarget
}: WordsTableProps) {
  const { t } = useTranslation()

  if (paginated.length === 0) {
    return (
      <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-100">
        <span className="material-symbols-outlined text-6xl text-stone-300 mb-4 font-variation-fill">inbox</span>
        <h3 className="text-xl font-medium text-stone-500">{t('admin.wordTable.empty')}</h3>
        <p className="text-stone-400 mt-2">{t('admin.wordTable.emptyHint')}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden flex flex-col mt-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-stone-50/50 border-b border-stone-100">
              <th className="px-6 py-4 w-12 sticky-col bg-stone-50/50">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = !allSelected && someSelected }}
                  onChange={toggleAll}
                  className="min-h-11 min-w-11 rounded-lg accent-primary cursor-pointer transition-all"
                  title={t('admin.wordTable.selectAll')}
                />
              </th>
               <th className="px-6 py-4 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-[0.2em] sticky-col left-12 bg-stone-50/50">{t('admin.wordTable.header.word')}</th>
              <th className="px-6 py-4 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-[0.2em]">{t('admin.wordTable.header.type')}</th>
              <th className="px-6 py-4 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-[0.2em]">{t('admin.wordTable.header.difficulty')}</th>
              <th className="px-6 py-4 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-[0.2em]">{t('admin.wordTable.header.meaning')}</th>
              <th className="px-6 py-4 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-[0.2em]">{t('admin.wordTable.header.example')}</th>
              <th className="px-6 py-4 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-[0.2em]">{t('admin.wordTable.header.tags')}</th>
              <th className="px-6 py-4 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-[0.2em]">{t('admin.wordTable.header.time')}</th>
              <th className="px-6 py-4 text-right text-[10px] font-semibold text-stone-400 uppercase tracking-[0.2em] sticky right-0 bg-stone-50/50 backdrop-blur-md">{t('admin.wordTable.header.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((w, idx) => (
              <motion.tr
                key={w.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * ROW_ANIMATION_STAGGER_S }}
                className={`group border-b border-stone-50 last:border-0 transition-all ${selectedIds.has(w.id) ? 'bg-primary/5' : 'hover:bg-stone-50/50'}`}
              >
                <td className="px-6 py-4 sticky-col group-hover:bg-stone-50/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(w.id)}
                    onChange={() => toggleOne(w.id)}
                    className="min-h-11 min-w-11 rounded-lg accent-primary cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4 sticky-col left-12 group-hover:bg-stone-50/50 transition-colors">
                  <div>
                    <p className="text-lg font-semibold text-secondary leading-tight">{w.word}</p>
                    {w.phonetic && <p className="text-[10px] text-stone-400 font-mono tracking-wider mt-0.5">{w.phonetic}</p>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                    {t(`admin.wordTable.posAbbr.${w.pos ?? 'other'}`) ?? '—'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <DifficultyDots value={w.difficulty ?? 3} />
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-on-surface-variant font-medium line-clamp-2 max-w-[150px]">{w.definition}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-[250px]">
                    <p className="text-sm text-secondary font-medium leading-relaxed italic line-clamp-1">{w.example ?? '—'}</p>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-1">{w.example_vi ?? '—'}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-[120px]">
                    {w.tags?.slice(0, MAX_VISIBLE_TAGS).map(tag => (
                      <span key={tag} className="text-[9px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium uppercase">{tag}</span>
                    ))}
                    {w.tags && w.tags.length > MAX_VISIBLE_TAGS && (
                      <span className="text-[9px] text-stone-300 font-medium">+{w.tags.length - MAX_VISIBLE_TAGS}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-400 font-mono">{formatDetailedDate(w.created_at)}</span>
                    {w.updated_at && w.updated_at !== w.created_at && (
                      <span className="text-[9px] text-primary/60 font-mono italic">{t('admin.wordTable.edited')}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right sticky right-0 bg-white/80 backdrop-blur-md group-hover:bg-stone-50/80 transition-colors">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditWordData(w)}
                      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-stone-100 text-stone-500 shadow-sm transition-all hover:bg-primary hover:text-white"
                      title={t('common.edit')}
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(w)}
                      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-stone-100 text-stone-500 shadow-sm transition-all hover:bg-red-500 hover:text-white"
                      title={t('common.delete')}
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
