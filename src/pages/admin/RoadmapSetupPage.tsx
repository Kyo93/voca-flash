import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAdminTopics } from '../../hooks/admin/useAdminTopics'
import {
  getRoadmapById,
  getTopicsByRoadmap,
  getWordsWithTopicsByRoadmap,
  getTopicWordCounts,
  assignWordsToTopic,
  unassignWordsFromTopic,
  deleteTopic,
  deleteWord,
  createTopic,
} from '../../lib/admin-queries'
import { TAG_META } from '../../lib/tag-engine'
import TopicFormModal from '../../components/admin/TopicFormModal'
import ImportWordsModal from '../../components/admin/ImportWordsModal'
import ConfirmDialog from '../../components/ConfirmDialog'
import type { Topic, Roadmap } from '../../lib/types'

// ─── Types ──────────────────────────────────────────────────
interface EnrichedWord {
  id: string
  word: string
  phonetic?: string
  pos?: string
  definition: string
  example?: string
  example_vi?: string
  difficulty?: number
  tags: string[]  // ← semantic tags
  topicIds: string[]
}

// DifficultyPill is defined at the bottom of this file (after WordPool)

// ─── WordPool (Right Column) ─────────────────────────────────
// Matches Stitch design reference exactly:
// - Breadcrumb (ROADMAPS > RoadmapName > TopicName, uppercase)
// - Title + word count + "Nhập từ" button
// - Search input (rounded pill)
// - Filter chips (horizontal scrollable tabs)
// - "Chọn tất cả" checkbox
// - Word list: word + phonetic + POS badge + 3 difficulty dots + tag pill (no expand)
function WordPool({
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
}: {
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
}) {
  const [bulkTopicId, setBulkTopicId] = useState('')

  const activeTopicName = activeTopicId
    ? (topics.find(t => t.id === activeTopicId)?.name ?? '...')
    : 'Chưa phân loại'

  // All unique tags across current words
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    words.forEach(w => w.tags.forEach(t => tagSet.add(t)))
    return [...tagSet].sort()
  }, [words])

  // Filter by active tag
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
            {visibleWords.length} từ vựng
          </p>
        </div>
        <button
          onClick={onImport}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest text-sm font-medium transition-all"
        >
          <span className="material-symbols-outlined text-sm">upload</span>
          Nhập từ
        </button>
      </div>

      {/* ── Search input (rounded pill) ── */}
      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 text-lg">search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Tìm kiếm từ..."
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
          Tất cả
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
            {selectedWordIds.size} từ được chọn
          </span>
          <select
            value={bulkTopicId}
            onChange={(e) => setBulkTopicId(e.target.value)}
            className="flex-1 px-2 py-1 rounded-lg border border-stone-200 bg-white text-xs outline-none cursor-pointer"
          >
            <option value="">— Gán vào topic —</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {bulkTopicId && (
            <button
              onClick={() => { onBulkAssign(bulkTopicId); setBulkTopicId('') }}
              className="px-2 py-1 rounded-lg bg-primary text-white text-xs font-bold shrink-0"
            >
              Gán
            </button>
          )}
          {activeTopicId && (
            <button
              onClick={onBulkUnassign}
              className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold shrink-0"
            >
              Bỏ khỏi topic
            </button>
          )}
        </div>
      )}

      {/* ── Word List Table (7 columns — matches design reference) ── */}
      <div className="flex-1 overflow-hidden rounded-xl bg-white">
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
                    title="Chọn tất cả"
                  />
                </th>
                <th className="p-4">Word</th>
                <th className="p-4">Phonetic</th>
                <th className="p-4">Meaning (VN)</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4">Tags</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-stone-300 animate-spin">progress_activity</span>
                      <p className="text-stone-400">Đang tải...</p>
                    </div>
                  </td>
                </tr>
              ) : visibleWords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-stone-300">spellcheck</span>
                      <p className="text-stone-400">
                        {search || activeTagFilter ? 'Không tìm thấy từ nào' : 'Chưa có từ vựng nào.'}
                      </p>
                    </div>
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
                    {/* Checkbox */}
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggle(word.id)}
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                      />
                    </td>

                    {/* Word + audio */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-on-surface">{word.word}</span>
                        <button
                          onClick={(e) => { e.stopPropagation() }}
                          className="material-symbols-outlined text-stone-300 hover:text-orange-500 text-lg cursor-pointer"
                          title="Phát âm"
                        >
                          volume_up
                        </button>
                      </div>
                    </td>

                    {/* Phonetic */}
                    <td className="p-4 text-stone-500 font-mono">
                      {word.phonetic ? `/${word.phonetic}/` : '—'}
                    </td>

                    {/* Meaning (VN) */}
                    <td className="p-4 text-on-surface text-sm">
                      {word.definition || word.example_vi || '—'}
                    </td>

                    {/* Difficulty */}
                    <td className="p-4">
                      <DifficultyPill value={word.difficulty ?? 3} />
                    </td>

                    {/* Tags */}
                    <td className="p-4">
                      {primaryTag && (
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                            tagColor === '#E67E22' ? 'bg-orange-50 text-orange-700 border-orange-100'
                            : tagColor === '#829460' ? 'bg-secondary-container/30 text-secondary border-secondary-container'
                            : 'bg-orange-50 text-orange-700 border-orange-100'
                          }`}
                        >
                          {tagMeta?.label ?? primaryTag}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation() }}
                          className="p-2 hover:bg-stone-100 rounded-lg hover:text-primary transition-all bg-orange-50 cursor-pointer"
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined text-lg" style={{ color: '#E67E22' }}>edit</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation() }}
                          className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-error transition-all cursor-pointer"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
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

// ─── DifficultyPill ─────────────────────────────────────────────
function DifficultyPill({ value, className = '' }: { value: number; className?: string }) {
  const label = value <= 2 ? 'Easy' : value === 3 ? 'Medium' : 'Hard'
  const classes = value <= 2
    ? 'bg-green-50 text-green-700 border border-green-100'
    : value === 3
    ? 'bg-orange-50 text-orange-700 border border-orange-100'
    : 'bg-red-50 text-red-700 border border-red-100'
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${classes} ${className}`}>
      {label}
    </span>
  )
}

// ─── TopicPanel (Left Column) ────────────────────────────────
// Redesigned: flat clickable cards, no expand/collapse
// Each card shows: name, slug (mono), description (truncated), progress bar, word count, status badge
function TopicPanel({
  topics,
  wordCounts,
  uncategorizedCount,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  onViewWords,
  onReorderTopics,
  activeTopicId,
}: {
  topics: Topic[]
  wordCounts: Record<string, number>
  uncategorizedCount: number
  onAddTopic: () => void
  onEditTopic: (t: Topic) => void
  onDeleteTopic: (t: Topic) => void
  onViewWords: (topicId: string | null) => void
  onReorderTopics: (topics: Topic[]) => void
  activeTopicId: string | null
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  // Drag-and-drop reorder
  function handleDragStart(e: React.DragEvent, topicId: string) {
    setDraggingId(topicId)
    e.dataTransfer.effectAllowed = 'move'
  }
  function handleDragOver(e: React.DragEvent, topicId: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (topicId !== draggingId) setDragOverId(topicId)
  }
  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!draggingId || draggingId === targetId) { setDraggingId(null); setDragOverId(null); return }
    const oldIndex = topics.findIndex(t => t.id === draggingId)
    const newIndex = topics.findIndex(t => t.id === targetId)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = [...topics]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    onReorderTopics(reordered)
    setDraggingId(null)
    setDragOverId(null)
  }
  function handleDragEnd() { setDraggingId(null); setDragOverId(null) }

  // Determine status badge from progress
  function getTopicStatus(topicId: string): 'DRAFT' | 'PUBLISHED' {
    const total = wordCounts[topicId] ?? 0
    // For now: any topic with 0 words = DRAFT, else PUBLISHED
    return total > 0 ? 'PUBLISHED' : 'DRAFT'
  }

  // Derive progress percentage from mastered vs total — use word count as progress proxy
  // (real progress would come from topicProgress prop if available; here we use 0-100 scale)
  function getProgressPercent(_topicId: string): number {
    // For v1: progress placeholder. Real progress = SRS mastered/total from learning data.
    return 0
  }

  const isDragging = (id: string) => draggingId === id
  const isDragOver = (id: string) => dragOverId === id

  return (
    <div className="flex flex-col h-full px-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-on-surface-variant tracking-tight">Chủ đề</h2>
        <button
          onClick={onAddTopic}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-secondary hover:bg-secondary-container/30 text-sm font-bold transition-all"
        >
          <span className="material-symbols-outlined text-base">add_box</span>
          Thêm
        </button>
      </div>

      {/* Uncategorized bucket */}
      <button
        onClick={() => onViewWords(null)}
        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mb-2 mr-4 ${
          activeTopicId === null
            ? 'bg-surface-container-lowest shadow-[inset_4px_0_0_#944a00]'
            : 'bg-white border border-stone-200 hover:bg-surface-container transition-colors'
        }`}
      >
        <span className="text-lg">📦</span>
        <div className="flex-1 text-left">
          <p className="font-bold text-sm text-secondary">Chưa phân loại</p>
          <p className="text-xs text-stone-400">{uncategorizedCount} từ</p>
        </div>
        {uncategorizedCount > 0 && (
          <span className="bg-stone-100 text-stone-500 text-xs font-bold px-2 py-0.5 rounded-full">
            {uncategorizedCount}
          </span>
        )}
      </button>

      {/* Topics list — flat cards, no expand */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-4">
        {topics.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <span className="material-symbols-outlined text-4xl text-stone-200">folder_open</span>
            <p className="text-stone-400 text-xs text-center">
              Chưa có chủ đề nào.<br />Bấm "Thêm" để tạo.
            </p>
          </div>
        ) : (
          topics.map((topic) => {
            const count = wordCounts[topic.id] ?? 0
            const isActive = activeTopicId === topic.id
            const status = getTopicStatus(topic.id)
            void getProgressPercent(topic.id)
            const isDraggingThis = isDragging(topic.id)
            const isDragOverThis = isDragOver(topic.id)

            return (
              <div
                key={topic.id}
                draggable
                onDragStart={(e) => handleDragStart(e, topic.id)}
                onDragOver={(e) => handleDragOver(e, topic.id)}
                onDrop={(e) => handleDrop(e, topic.id)}
                onDragEnd={handleDragEnd}
                onClick={() => onViewWords(topic.id)}
                className={`relative group rounded-lg transition-all cursor-pointer select-none ${
                  isDraggingThis
                    ? 'opacity-40'
                    : isDragOverThis
                    ? 'border border-primary shadow-md'
                    : isActive
                    ? 'border border-stone-200 shadow-[inset_4px_0_0_#944a00]'
                    : 'border border-stone-200 hover:bg-surface-container transition-colors'
                }`}
                style={{
                  // Full-card background tint in topic color — muted (~8%) so it doesn't overpower text
                  backgroundColor: `${topic.color ?? '#F97316'}1A`,
                }}
              >
                {/* Card body — always visible */}
                <div className="p-4">
                  {/* Top row: drag handle + color dot + name */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-stone-300 text-base cursor-grab shrink-0">drag_indicator</span>
                    {/* Color dot — matches design reference */}
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: topic.color ?? '#F97316' }}
                    />
                    <p className={`flex-1 font-bold text-sm leading-tight min-w-0 truncate ${isActive ? 'text-primary' : 'text-secondary'}`}>
                      {topic.name}
                    </p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                        status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Slug — muted mono text */}
                  {topic.slug && (
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5 pl-[calc(0.625rem+0.625rem)] truncate">
                      {topic.slug}
                    </p>
                  )}

                  {/* Description — truncated 1 line */}
                  {topic.description && (
                    <p className="text-xs text-stone-400 mb-2 pl-[calc(0.625rem+0.625rem)] line-clamp-1">
                      {topic.description}
                    </p>
                  )}

                  {/* Word count badge */}
                  <span className="text-[10px] font-bold text-stone-500 shrink-0">{count} từ</span>

                  {/* Inline action buttons — icon-only, shown on hover */}
                  <div className="flex items-center gap-1 mt-2 pl-[calc(0.625rem+0.625rem)] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEditTopic(topic)}
                      className="flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 hover:text-primary hover:bg-orange-50 transition-all"
                      title="Sửa"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteTopic(topic)}
                      className="flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Xóa"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────
export default function RoadmapSetupPage() {
  const { roadmapId } = useParams<{ roadmapId: string }>()
  const { fetch: fetchTopics } = useAdminTopics()

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [words, setWords] = useState<EnrichedWord[]>([])
  const [wordCounts, setWordCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  // UI State
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null) // null = Uncategorized
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null)

  // Modals
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [editTopic, setEditTopic] = useState<Topic | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [deleteTopicTarget, setDeleteTopicTarget] = useState<Topic | null>(null)
  const [deleteWordTarget, setDeleteWordTarget] = useState<string | null>(null)

  // Load data
  async function loadData() {
    if (!roadmapId) return
    setLoading(true)

    const [rmRes, topicsRes, wordsRes, countsRes] = await Promise.all([
      getRoadmapById(roadmapId),
      getTopicsByRoadmap(roadmapId),
      getWordsWithTopicsByRoadmap(roadmapId),
      getTopicWordCounts(roadmapId),
    ])

    if (rmRes.data) setRoadmap(rmRes.data as Roadmap)
    if (topicsRes.data) setTopics((topicsRes.data as Topic[]) ?? [])
    if (wordsRes.data) setWords((wordsRes.data as EnrichedWord[]) ?? [])
    if (countsRes.data) setWordCounts(countsRes.data as Record<string, number>)

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [roadmapId])

  // Computed: filter words by selected topic (search + tag filter handled in WordPool)
  const filteredWords = useMemo(() => {
    if (activeTopicId === null) return words
    return words.filter(w => w.topicIds.includes(activeTopicId))
  }, [words, activeTopicId])

  // Computed: uncategorized words
  const uncategorizedCount = useMemo(() => {
    return words.filter(w => w.topicIds.length === 0).length
  }, [words])

  // Toggle word selection
  function toggleWord(id: string) {
    setSelectedWordIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Toggle all
  function toggleAll() {
    if (filteredWords.every(w => selectedWordIds.has(w.id))) {
      setSelectedWordIds(prev => {
        const next = new Set(prev)
        filteredWords.forEach(w => next.delete(w.id))
        return next
      })
    } else {
      setSelectedWordIds(prev => {
        const next = new Set(prev)
        filteredWords.forEach(w => next.add(w.id))
        return next
      })
    }
  }

  // Bulk assign to topic
  async function handleBulkAssign(targetTopicId: string) {
    if (!roadmapId) return
    const ids = [...selectedWordIds]
    if (targetTopicId) {
      await assignWordsToTopic(ids, targetTopicId)
    }
    setSelectedWordIds(new Set())
    await loadData()
    await fetchTopics()
  }

  // Bulk unassign from active topic
  async function handleBulkUnassign() {
    if (!activeTopicId) return
    const ids = [...selectedWordIds]
    await unassignWordsFromTopic(ids, activeTopicId)
    setSelectedWordIds(new Set())
    await loadData()
    await fetchTopics()
  }

  // Delete topic
  async function handleDeleteTopic() {
    if (!deleteTopicTarget) return
    await deleteTopic(deleteTopicTarget.id)
    setDeleteTopicTarget(null)
    await loadData()
    await fetchTopics()
  }

  // Delete word
  async function handleDeleteWord() {
    if (!deleteWordTarget) return
    await deleteWord(deleteWordTarget)
    setDeleteWordTarget(null)
    setSelectedWordIds(prev => {
      const next = new Set(prev)
      next.delete(deleteWordTarget)
      return next
    })
    await loadData()
  }

  // Reorder topics
  async function handleReorderTopics(reordered: Topic[]) {
    setTopics(reordered)
    const updates = reordered.map((t, i) => ({ id: t.id, sort_order: i }))
    await import('../../lib/admin-queries').then(m => m.reorderTopics(updates))
  }
  async function handleSaveTopic(data: {
    name: string; slug: string; description: string | null
    image_url: string | null; icon: string; color: string; roadmap_id: string | null
  }) {
    if (editTopic) {
      const { updateTopic } = await import('../../lib/admin-queries')
      await updateTopic(editTopic.id, data)
    } else {
      await createTopic({ ...data, sort_order: topics.length })
    }
    setShowTopicModal(false)
    setEditTopic(null)
    await loadData()
    await fetchTopics()
  }

  if (!roadmapId) {
    return (
      <div className="p-8 text-center text-stone-400">
        Không tìm thấy roadmap
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 4.5rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/admin/roadmaps"
          className="flex items-center gap-1 text-stone-500 hover:text-primary transition-colors text-sm font-bold"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Quay lại
        </Link>
        <div className="h-6 w-px bg-stone-200" />
        <div>
          <h1 className="text-2xl font-black text-secondary">
            {roadmap?.name ?? '...'}
          </h1>
          <p className="text-sm text-on-surface-variant">Quản lý chủ đề & từ vựng</p>
        </div>
      </div>

      {/* 2-column layout — full height, each column scrolls independently */}
      <div className="flex gap-8 min-h-0" style={{ height: 'calc(100vh - 10rem)' }}>
        {/* Left: Topic Panel (scrollable internally) */}
        <div className="w-96 shrink-0 bg-white rounded-xl border border-stone-100 flex flex-col overflow-hidden">
          <TopicPanel
            topics={topics}
            wordCounts={wordCounts}
            uncategorizedCount={uncategorizedCount}
            onAddTopic={() => { setEditTopic(null); setShowTopicModal(true) }}
            onEditTopic={(t) => { setEditTopic(t); setShowTopicModal(true) }}
            onDeleteTopic={(t) => setDeleteTopicTarget(t)}
            onViewWords={(id) => setActiveTopicId(id)}
            onReorderTopics={handleReorderTopics}
            activeTopicId={activeTopicId}
          />
        </div>

        {/* Right: Word Pool (scrollable internally) */}
        <div className="flex-1 bg-white rounded-xl border border-stone-100 flex flex-col overflow-hidden">
          <WordPool
            words={filteredWords}
            topics={topics}
            selectedWordIds={selectedWordIds}
            onToggle={toggleWord}
            onToggleAll={toggleAll}
            onBulkAssign={handleBulkAssign}
            onBulkUnassign={handleBulkUnassign}
            onImport={() => setShowImportModal(true)}
            loading={loading}
            search={search}
            onSearch={setSearch}
            activeTopicId={activeTopicId}
            activeTagFilter={activeTagFilter}
            onActiveTagFilterChange={setActiveTagFilter}
            roadmapName={roadmap?.name}
          />

          {/*
            Bottom 3 cards removed (2026-04-15)
            Auto-Gen Meanings | Retention Insight | Drag & Drop Assets
          */}

        </div>
      </div>

      {/* Modals */}
      <TopicFormModal
        open={showTopicModal}
        topic={editTopic}
        roadmaps={roadmap ? [roadmap] : []}
        roadmapId={roadmapId}
        roadmapSlug={roadmap?.slug}
        lastEditedAt={editTopic?.updated_at}
        onSave={handleSaveTopic}
        onClose={() => { setShowTopicModal(false); setEditTopic(null) }}
      />

      <ImportWordsModal
        open={showImportModal}
        topics={topics}
        roadmapId={roadmapId}
        roadmapName={roadmap?.name ?? ''}
        roadmapSlug={roadmap?.slug}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => { setShowImportModal(false); loadData() }}
      />

      {/* Delete topic confirm */}
      <ConfirmDialog
        open={!!deleteTopicTarget}
        title="Xóa chủ đề?"
        message={`Xóa "${deleteTopicTarget?.name}"? Từ vựng trong chủ đề này sẽ không bị xóa.`}
        confirmLabel="Xóa"
        danger
        onConfirm={handleDeleteTopic}
        onCancel={() => setDeleteTopicTarget(null)}
      />

      {/* Delete word confirm */}
      <ConfirmDialog
        open={!!deleteWordTarget}
        title="Xóa từ vựng?"
        message="Xóa từ này? Hành động không thể hoàn tác."
        confirmLabel="Xóa"
        danger
        onConfirm={handleDeleteWord}
        onCancel={() => setDeleteWordTarget(null)}
      />
    </div>
  )
}
