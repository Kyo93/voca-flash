import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Topic } from '../../lib/types'
import { TagFilterChips } from './word-pool/TagFilterChips'
import { BulkAssignBar } from './word-pool/BulkAssignBar'
import { WordPoolTable } from './word-pool/WordPoolTable'

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

  const activeTopicName = activeTopicId
    ? (topics.find(topic => topic.id === activeTopicId)?.name ?? '...')
    : t('admin.wordPool.uncategorized')

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    words.forEach(w => w.tags.forEach(tag => tagSet.add(tag)))
    return [...tagSet].sort()
  }, [words])

  const visibleWords = useMemo(() => {
    let result = words
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      result = result.filter(w =>
        w.word.toLowerCase().includes(searchLower) ||
        w.definition.toLowerCase().includes(searchLower)
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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[10px] text-stone-500 mb-2 font-medium uppercase tracking-widest">
        <Link to="/admin/roadmaps" className="hover:text-primary transition-colors">{t('admin.sidebar.roadmaps')}</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-stone-500 uppercase tracking-widest">
          {roadmapName ? roadmapName.toUpperCase() : '...'}
        </span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-primary uppercase tracking-widest">{activeTopicName.toUpperCase()}</span>
      </div>

      {/* Title + Import button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-secondary tracking-tight">{activeTopicName}</h2>
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

      {/* Search input */}
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

      <TagFilterChips
        allTags={allTags}
        activeTagFilter={activeTagFilter}
        onActiveTagFilterChange={onActiveTagFilterChange}
      />

      {selectedWordIds.size > 0 && (
        <BulkAssignBar
          selectedCount={selectedWordIds.size}
          topics={topics}
          activeTopicId={activeTopicId}
          onBulkAssign={onBulkAssign}
          onBulkUnassign={onBulkUnassign}
        />
      )}

      <WordPoolTable
        visibleWords={visibleWords}
        selectedWordIds={selectedWordIds}
        onToggle={onToggle}
        onToggleAll={onToggleAll}
        loading={loading}
        search={search}
        activeTagFilter={activeTagFilter}
        allSelected={allSelected}
        someSelected={someSelected}
      />
    </div>
  )
}
