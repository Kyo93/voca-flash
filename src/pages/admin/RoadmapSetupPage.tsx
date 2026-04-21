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
import TopicPanel from '../../components/admin/TopicPanel'
import WordPool, { EnrichedWord } from '../../components/admin/WordPool'



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

    const [roadmapResponse, topicsRes, wordsRes, countsRes] = await Promise.all([
      getRoadmapById(roadmapId),
      getTopicsByRoadmap(roadmapId),
      getWordsWithTopicsByRoadmap(roadmapId),
      getTopicWordCounts(roadmapId),
    ])

    if (roadmapResponse.data) setRoadmap(roadmapResponse.data as Roadmap)
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
