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
import { TAG_META, suggestTopicFromTags } from '../../lib/tag-engine'
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

// ─── Difficulty Dots ────────────────────────────────────────
function DifficultyDots({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`w-1.5 h-1.5 rounded-full ${n <= value ? 'bg-primary' : 'bg-stone-200'}`}
        />
      ))}
    </div>
  )
}

// ─── POS Labels ──────────────────────────────────────────────
const POS_LABELS: Record<string, string> = {
  noun: 'DT', verb: 'ĐT', adj: 'TT', adv: 'TrT', phrase: 'CT', other: '—',
}

// ─── WordPool (Right Column) ─────────────────────────────────
function WordPool({
  words,
  topics,
  selectedWordIds,
  onToggle,
  onToggleAll,
  onBulkAssign,
  onBulkUnassign,
  onDelete,
  onUnassignWord,
  onImport,
  loading,
  search,
  onSearch,
  activeTopicId,
  activeTagFilter,
  onActiveTagFilterChange,
}: {
  words: EnrichedWord[]
  topics: Topic[]
  selectedWordIds: Set<string>
  onToggle: (id: string) => void
  onToggleAll: () => void
  onBulkAssign: (topicId: string) => void
  onBulkUnassign: () => void
  onDelete: (wordId: string) => void
  onUnassignWord: (wordId: string) => void
  onImport: () => void
  loading: boolean
  search: string
  onSearch: (s: string) => void
  activeTopicId: string | null
  activeTagFilter: string | null
  onActiveTagFilterChange: (tag: string | null) => void
}) {
  const [expandedWordId, setExpandedWordId] = useState<string | null>(null)
  const [bulkTopicId, setBulkTopicId] = useState('')

  // All unique tags across current words
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    words.forEach(w => w.tags.forEach(t => tagSet.add(t)))
    return [...tagSet].sort()
  }, [words])

  // Filter by active tag
  const visibleWords = useMemo(() => {
    if (!activeTagFilter) return words
    return words.filter(w => w.tags.includes(activeTagFilter))
  }, [words, activeTagFilter])

  const allSelected = visibleWords.length > 0 && visibleWords.every(w => selectedWordIds.has(w.id))

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-black text-secondary">Từ vựng ({visibleWords.length})</h2>
        <button
          onClick={onImport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-orange-200 text-orange-500 text-sm font-bold hover:bg-orange-50 transition-all"
        >
          <span className="material-symbols-outlined text-sm">upload</span>
          Nhập từ
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 text-lg">search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Tìm kiếm từ..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-stone-200 bg-white text-secondary text-sm outline-none focus:border-primary transition-all"
        />
      </div>

      {/* Tag Filter Bar */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          <button
            onClick={() => onActiveTagFilterChange(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              activeTagFilter === null
                ? 'bg-primary text-white shadow-sm'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            Tất cả
          </button>
          {allTags.map(tag => {
            const meta = TAG_META[tag]
            return (
              <button
                key={tag}
                onClick={() => onActiveTagFilterChange(activeTagFilter === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  activeTagFilter === tag ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: (meta?.color ?? '#9CA3AF') + '20',
                  color: meta?.color ?? '#9CA3AF',
                  ...(activeTagFilter === tag ? {
                    outline: `2px solid ${meta?.color ?? '#9CA3AF'}`,
                    outlineOffset: '1px',
                  } : {}),
                }}
              >
                {meta?.label ?? tag}
              </button>
            )
          })}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedWordIds.size > 0 && (
        <div className="flex flex-col gap-2 mb-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-primary">
              {selectedWordIds.size} từ được chọn
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={bulkTopicId}
              onChange={(e) => setBulkTopicId(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-sm outline-none cursor-pointer"
            >
              <option value="">— Gán vào topic —</option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {bulkTopicId && (
              <button
                onClick={() => { onBulkAssign(bulkTopicId); setBulkTopicId('') }}
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-orange-600 transition-all"
              >
                Gán
              </button>
            )}
            {activeTopicId && (
              <button
                onClick={onBulkUnassign}
                className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all shrink-0"
              >
                Bỏ khỏi topic
              </button>
            )}
          </div>
        </div>
      )}

      {/* Select all */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onToggleAll}
          className="w-4 h-4 rounded accent-primary cursor-pointer"
        />
        <span className="text-sm text-stone-500">
          {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
        </span>
      </div>

      {/* Word List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {loading ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <span className="material-symbols-outlined text-4xl text-stone-300 animate-spin">progress_activity</span>
            <p className="text-stone-400 text-sm">Đang tải...</p>
          </div>
        ) : visibleWords.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <span className="material-symbols-outlined text-4xl text-stone-300">spellcheck</span>
            <p className="text-stone-400 text-sm">
              {search || activeTagFilter ? 'Không tìm thấy từ nào' : 'Chưa có từ vựng nào. Nhập từ để bắt đầu.'}
            </p>
          </div>
        ) : (
          visibleWords.map((word) => {
            const isExpanded = expandedWordId === word.id
            return (
              <div
                key={word.id}
                className={`rounded-xl border transition-all ${
                  selectedWordIds.has(word.id)
                    ? 'border-primary bg-orange-50/50'
                    : 'border-stone-100 bg-white hover:border-stone-200'
                }`}
              >
                <div className="flex items-start gap-2 px-3 py-2.5">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedWordIds.has(word.id)}
                    onChange={() => onToggle(word.id)}
                    className="w-4 h-4 mt-1 rounded accent-primary cursor-pointer shrink-0"
                  />

                  {/* Word Info */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedWordId(isExpanded ? null : word.id)}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="font-bold text-secondary text-sm">{word.word}</p>
                      {word.phonetic && (
                        <span className="text-xs text-stone-400">{word.phonetic}</span>
                      )}
                      {word.pos && (
                        <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                          {POS_LABELS[word.pos] ?? '—'}
                        </span>
                      )}
                      <DifficultyDots value={word.difficulty ?? 3} />
                    </div>

                    {/* Tags — shown collapsed */}
                    {word.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {word.tags.slice(0, 4).map(tag => {
                          const meta = TAG_META[tag]
                          return (
                            <span
                              key={tag}
                              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ backgroundColor: (meta?.color ?? '#9CA3AF') + '20', color: meta?.color ?? '#9CA3AF' }}
                            >
                              {meta?.label ?? tag}
                            </span>
                          )
                        })}
                        {word.tags.length > 4 && (
                          <span className="text-[10px] text-stone-400 font-medium">+{word.tags.length - 4}</span>
                        )}
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-stone-100 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                        <p className="text-sm text-on-surface-variant">{word.definition}</p>
                        {word.example && (
                          <p className="text-xs text-stone-400 italic">"{word.example}"</p>
                        )}
                        {word.example_vi && (
                          <p className="text-xs text-stone-400">"{word.example_vi}"</p>
                        )}

                        {/* All Tags + Suggest Topic */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {word.tags.map(tag => {
                            const meta = TAG_META[tag]
                            return (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
                                style={{ backgroundColor: (meta?.color ?? '#9CA3AF') + '20', color: meta?.color ?? '#9CA3AF' }}
                              >
                                {meta?.label ?? tag}
                              </span>
                            )
                          })}
                          {/* Suggest topic button */}
                          {!activeTopicId && word.tags.length > 0 && (() => {
                            const suggestion = suggestTopicFromTags(word.tags, topics)
                            return suggestion ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onBulkAssign(suggestion.id)
                                  setBulkTopicId('')
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-all"
                              >
                                <span className="material-symbols-outlined text-xs">lightbulb</span>
                                → {suggestion.name}
                              </button>
                            ) : null
                          })()}
                        </div>

                        {/* Quick actions */}
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-100">
                          {activeTopicId && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onUnassignWord(word.id) }}
                              className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-xs">remove_circle_outline</span>
                              Bỏ khỏi topic
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(word.id) }}
                            className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">delete</span>
                            Xóa từ này
                          </button>
                        </div>
                      </div>
                    )}
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

// ─── TopicPanel (Left Column) ────────────────────────────────
function TopicPanel({
  topics,
  wordCounts,
  uncategorizedCount,
  wordsByTopic,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  onImportToTopic,
  onViewWords,
  onReorderTopics,
  activeTopicId,
}: {
  topics: Topic[]
  wordCounts: Record<string, number>
  uncategorizedCount: number
  wordsByTopic: Map<string, EnrichedWord[]>
  onAddTopic: () => void
  onEditTopic: (t: Topic) => void
  onDeleteTopic: (t: Topic) => void
  onImportToTopic: (topicId: string) => void
  onViewWords: (topicId: string | null) => void
  onReorderTopics: (topics: Topic[]) => void
  activeTopicId: string | null
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  function handleDragStart(e: React.DragEvent, topicId: string) {
    setDraggingId(topicId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, topicId: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (topicId !== draggingId) {
      setDragOverId(topicId)
    }
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null)
      setDragOverId(null)
      return
    }
    // Reorder: move dragging item to target position
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

  function handleDragEnd() {
    setDraggingId(null)
    setDragOverId(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-secondary">Chủ đề</h2>
        <button
          onClick={onAddTopic}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-orange-600 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Thêm
        </button>
      </div>

      {/* Uncategorized bucket */}
      <button
        onClick={() => onViewWords(null)}
        className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all mb-2 ${
          activeTopicId === null
            ? 'border-primary bg-orange-50'
            : 'border-stone-200 bg-white hover:border-stone-300'
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

      {/* Topics list */}
      <div className="flex-1 overflow-y-auto space-y-1">
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
            const isExpanded = expandedId === topic.id
            const isActive = activeTopicId === topic.id

            return (
              <div
                key={topic.id}
                draggable
                onDragStart={(e) => handleDragStart(e, topic.id)}
                onDragOver={(e) => handleDragOver(e, topic.id)}
                onDrop={(e) => handleDrop(e, topic.id)}
                onDragEnd={handleDragEnd}
                className={`rounded-xl border overflow-hidden bg-white transition-all ${
                  draggingId === topic.id
                    ? 'opacity-40 border-dashed border-stone-300'
                    : dragOverId === topic.id
                    ? 'border-primary shadow-md'
                    : 'border-stone-200'
                }`}
              >
                <button
                  onClick={() => {
                    setExpandedId(isExpanded ? null : topic.id)
                    onViewWords(isExpanded ? topic.id : topic.id)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-all ${
                    isActive ? 'bg-orange-50' : 'hover:bg-stone-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-stone-300 text-base cursor-grab shrink-0">drag_indicator</span>
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: topic.color ?? '#F97316' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${isActive ? 'text-primary' : 'text-secondary'}`}>
                      {topic.name}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full shrink-0">
                    {count}
                  </span>
                  <span className={`material-symbols-outlined text-stone-400 text-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {/* Expanded: mini word list — 3-column grid */}
                {isExpanded && (
                  <div className="border-t border-stone-100 px-3 py-2 bg-stone-50">
                    {wordsByTopic.get(topic.id)?.length === 0 ? (
                      <p className="text-xs text-stone-400 italic py-1">Chưa có từ nào</p>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                          {wordsByTopic.get(topic.id)?.slice(0, 12).map(w => (
                            <div key={w.id} className="flex items-center gap-1.5 py-0.5">
                              <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: topic.color ?? '#F97316' }} />
                              <span className="text-xs font-medium text-secondary truncate">{w.word}</span>
                            </div>
                          ))}
                        </div>
                        {(wordsByTopic.get(topic.id)?.length ?? 0) > 12 && (
                          <p className="text-[10px] text-stone-400 italic pt-1">
                            +{(wordsByTopic.get(topic.id)?.length ?? 0) - 12} từ khác
                          </p>
                        )}
                      </>
                    )}

                    {/* Actions — improved layout */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-200">
                      <button
                        onClick={() => onImportToTopic(topic.id)}
                        className="flex items-center gap-1 text-xs text-stone-500 hover:text-primary font-medium px-2 py-1 rounded-lg hover:bg-orange-50 transition-all"
                      >
                        <span className="material-symbols-outlined text-xs">upload</span>
                        Nhập thêm
                      </button>
                      <button
                        onClick={() => onEditTopic(topic)}
                        className="flex items-center gap-1 text-xs text-stone-500 hover:text-primary font-medium px-2 py-1 rounded-lg hover:bg-orange-50 transition-all"
                      >
                        <span className="material-symbols-outlined text-xs">edit</span>
                        Sửa
                      </button>
                      <div className="flex-1" />
                      <button
                        onClick={() => onDeleteTopic(topic)}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
                      >
                        <span className="material-symbols-outlined text-xs">delete</span>
                        Xóa
                      </button>
                    </div>
                  </div>
                )}
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

  // Data
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

  // Computed: filter + group words
  const filteredWords = useMemo(() => {
    let result = words

    // Filter by active topic
    if (activeTopicId !== null) {
      result = result.filter(w => w.topicIds.includes(activeTopicId))
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(w =>
        w.word.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q)
      )
    }

    return result
  }, [words, activeTopicId, search])

  // Computed: uncategorized words
  const uncategorizedCount = useMemo(() => {
    return words.filter(w => w.topicIds.length === 0).length
  }, [words])

  // Computed: words by topic
  const wordsByTopic = useMemo(() => {
    const map = new Map<string, EnrichedWord[]>()
    for (const w of words) {
      for (const tid of w.topicIds) {
        if (!map.has(tid)) map.set(tid, [])
        map.get(tid)!.push(w)
      }
    }
    return map
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

  // Unassign single word from active topic
  async function handleUnassignWord(wordId: string) {
    if (!activeTopicId) return
    await unassignWordsFromTopic([wordId], activeTopicId)
    setSelectedWordIds(prev => {
      const next = new Set(prev)
      next.delete(wordId)
      return next
    })
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
    <div className="h-full flex flex-col">
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

      {/* 2-column layout */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left: Topic Panel */}
        <div className="col-span-4 bg-white rounded-2xl border border-stone-100 p-4 min-h-0 overflow-hidden flex flex-col">
          <TopicPanel
            topics={topics}
            wordCounts={wordCounts}
            uncategorizedCount={uncategorizedCount}
            wordsByTopic={wordsByTopic}
            onAddTopic={() => { setEditTopic(null); setShowTopicModal(true) }}
            onEditTopic={(t) => { setEditTopic(t); setShowTopicModal(true) }}
            onDeleteTopic={(t) => setDeleteTopicTarget(t)}
            onImportToTopic={() => setShowImportModal(true)}
            onViewWords={(id) => setActiveTopicId(id)}
            onReorderTopics={handleReorderTopics}
            activeTopicId={activeTopicId}
          />
        </div>

        {/* Right: Word Pool */}
        <div className="col-span-8 bg-white rounded-2xl border border-stone-100 p-4 min-h-0 overflow-hidden flex flex-col">
          <WordPool
            words={filteredWords}
            topics={topics}
            selectedWordIds={selectedWordIds}
            onToggle={toggleWord}
            onToggleAll={toggleAll}
            onBulkAssign={handleBulkAssign}
            onBulkUnassign={handleBulkUnassign}
            onDelete={(id) => setDeleteWordTarget(id)}
            onUnassignWord={handleUnassignWord}
            onImport={() => setShowImportModal(true)}
            loading={loading}
            search={search}
            onSearch={setSearch}
            activeTopicId={activeTopicId}
            activeTagFilter={activeTagFilter}
            onActiveTagFilterChange={setActiveTagFilter}
          />
        </div>
      </div>

      {/* Modals */}
      <TopicFormModal
        open={showTopicModal}
        topic={editTopic}
        roadmaps={roadmap ? [roadmap] : []}
        roadmapId={roadmapId}
        roadmapSlug={roadmap?.slug}
        onSave={handleSaveTopic}
        onClose={() => { setShowTopicModal(false); setEditTopic(null) }}
      />

      <ImportWordsModal
        open={showImportModal}
        topics={topics}
        roadmapId={roadmapId}
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
