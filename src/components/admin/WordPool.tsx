import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TAG_META } from '../../lib/tag-constants'
import DifficultyPill from './DifficultyPill'
import type { Topic } from '../../lib/types'

export interface EnrichedWord {
  id: string
  word: string
  phonetic?: string
  pos?: string
  definition: string
  example?: string
  example_vi?: string
  difficulty?: number
  tags: string[]
  topicIds: string[]
}

interface WordPoolProps {
  words: EnrichedWord[]
  topics: Topic[]
  selectedWordIds: Set<string>
  onToggle: (id: string) => void
  onToggleAll: () => void
  onBulkAssign: (topicId: string) => void
  onBulkUnassign: () => void
  onImport: () => void
  loading: boolean
  search: string
  onSearch: (s: string) => void
  activeTopicId: string | null
  activeTagFilter: string | null
  onActiveTagFilterChange: (tag: string | null) => void
  roadmapName?: string
}

/**
 * WordPool - Right column of the Roadmap Setup Page.
 * Displays a searchable table of words with bulk actions and tag filtering.
 */
export default function WordPool({
  words,
  topics,
  selectedWordIds,
  onToggle,
  onToggleAll,
  onBulkAssign,
  onBulkUnassign,
  onImport,
  loading,
  search,
  onSearch,
  activeTopicId,
  activeTagFilter,
  onActiveTagFilterChange,
  roadmapName,
}: WordPoolProps) {
  const { t } = useTranslation()
  const [bulkTopicId, setBulkTopicId] = useState('')

  const activeTopicName = activeTopicId
    ? (topics.find(t => t.id === activeTopicId)?.name ?? '...')
    : t('admin.wordPool.uncategorized')

  // All unique tags across current words
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    words.forEach(w => w.tags.forEach(t => tagSet.add(t)))
    return [...tagSet].sort()
  }, [words])

  // Filter by search query and active tag
  const visibleWords = useMemo(() => {
    let result = words
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(w =>
        w.word.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q)
      )
    }
    if (activeTagFilter) {
      result = result.filter(w => w.tags.includes(activeTagFilter))
    }
    return result
  }, [words, search, activeTagFilter])

  const allSelected = visibleWords.length > 0 && visibleWords.every(w => selectedWordIds.has(w.id))
  const someSelected = visibleWords.some(w => selectedWordIds.has(w.id))

  return (
    <div className="flex flex-col h-full px-6 py-4">
      {/* ── Breadcrumb (uppercase, bold, tracking-widest) ── */}
      <div className="flex items-center gap-2 text-[10px] text-stone-500 mb-2 font-bold uppercase tracking-widest">
        <Link to="/admin/roadmaps" className="hover:text-primary transition-colors">Roadmaps</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-stone-500 uppercase tracking-widest">
          {roadmapName ? roadmapName.toUpperCase() : '...'}
        </span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-primary uppercase tracking-widest">{activeTopicName.toUpperCase()}</span>
      </div>

      {/* ── Title + "Nhập từ" button ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-black text-secondary tracking-tight">
            {activeTopicName}
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {t('admin.wordPool.wordCount', { count: visibleWords.length })}
          </p>
        </div>
        <button
          onClick={onImport}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest text-sm font-medium transition-all"
        >
          <span className="material-symbols-outlined text-sm">upload</span>
          {t('admin.wordPool.import')}
        </button>
      </div>

      {/* ── Search input (rounded pill) ── */}
      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 text-lg">search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t('admin.wordPool.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-container-low border-none text-secondary text-sm outline-none focus:ring-2 focus:ring-secondary transition-all"
        />
      </div>

      {/* ── Filter chips (horizontal scrollable tabs) ── */}
      <div className="flex items-center gap-2 overflow-x-auto mb-3 pb-1 custom-scrollbar">
        <button
          onClick={() => onActiveTagFilterChange(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
            activeTagFilter === null
              ? 'bg-primary text-white shadow-sm'
              : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
          }`}
        >
          {t('admin.wordPool.all')}
        </button>
        {allTags.map(tag => {
          const meta = TAG_META[tag]
          const isActive = activeTagFilter === tag
          return (
            <button
              key={tag}
              onClick={() => onActiveTagFilterChange(isActive ? null : tag)}
              className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0"
              style={{
                backgroundColor: isActive
                  ? (meta?.color ?? '#E67E22')
                  : ((meta?.color ?? '#9CA3AF') + '20'),
                color: isActive
                  ? 'white'
                  : (meta?.color ?? '#9CA3AF'),
              }}
            >
              {meta?.label ?? tag}
            </button>
          )
        })}
      </div>

      {/* ── Bulk assign (shows when words selected) ── */}
      {selectedWordIds.size > 0 && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-orange-50 rounded-xl border border-orange-100">
          <span className="text-xs font-bold text-primary shrink-0">
            {t('admin.wordPool.selectedCount', { count: selectedWordIds.size })}
          </span>
          <select
            value={bulkTopicId}
            onChange={(e) => setBulkTopicId(e.target.value)}
            className="flex-1 px-2 py-1 rounded-lg border border-stone-200 bg-white text-xs outline-none cursor-pointer"
          >
            <option value="">{t('admin.wordPool.assignToTopic')}</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {bulkTopicId && (
            <button
              onClick={() => { onBulkAssign(bulkTopicId); setBulkTopicId('') }}
              className="px-2 py-1 rounded-lg bg-primary text-white text-xs font-bold shrink-0"
            >
              {t('admin.wordPool.assign')}
            </button>
          )}
          {activeTopicId && (
            <button
              onClick={onBulkUnassign}
              className="px-2 py-1 rounded-lg bg-primary text-white text-xs font-bold shrink-0"
            >
              {t('admin.wordPool.unassign')}
            </button>
          )}
        </div>
      )}

      {/* ── Word List Table ── */}
      <div className="flex-1 overflow-hidden rounded-xl bg-white border border-stone-100">
        <div className="overflow-y-auto h-full custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-stone-200/50 sticky top-0 z-10">
              <tr className="text-stone-500 font-bold text-xs uppercase tracking-widest">
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
                <th className="p-4 text-right">{t('admin.wordPool.tableHeader.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-stone-300 animate-spin">progress_activity</span>
                      <p className="text-stone-400">{t('common.loading')}</p>
                    </div>
                  </td>
                </tr>
              ) : visibleWords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <p className="text-stone-400">
                      {search || activeTagFilter ? t('admin.wordPool.noResults') : t('admin.wordPool.empty')}
                    </p>
                  </td>
                </tr>
              ) : visibleWords.map((word) => {
                const isSelected = selectedWordIds.has(word.id)
                const primaryTag = word.tags[0]
                const tagMeta = primaryTag ? TAG_META[primaryTag] : null
                const tagColor = tagMeta?.color ?? '#E67E22'

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
                    <td className="p-4 font-bold text-on-surface">{word.word}</td>
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
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap"
                          style={{ backgroundColor: tagColor }}
                        >
                          {tagMeta?.label ?? primaryTag}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {/* Placeholder for individual word actions if needed */}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
