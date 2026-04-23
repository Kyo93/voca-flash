import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, Link } from 'react-router-dom'
import { useAdminTopics } from '../../hooks/admin/useAdminTopics'
import {
  getRoadmapById,
  getTopicsByRoadmap,
  getWordsWithTopicsByRoadmap,
  assignWordsToTopic,
  unassignWordsFromTopic,
} from '../../lib/queries/roadmap-queries'
import {
  deleteTopic,
  createTopic,
  getTopicWordCounts,
} from '../../lib/queries/topic-queries'
import { deleteWord } from '../../lib/queries/word-queries'
import { reorderTopics, updateTopic } from '../../lib/queries/topic-queries'
import { useSelection } from '../../hooks/useSelection'

import TopicFormModal from '../../components/admin/TopicFormModal'
import ImportWordsModal from '../../components/admin/ImportWordsModal'
import ConfirmDialog from '../../components/ConfirmDialog'
import type { Topic, Roadmap } from '../../lib/types'
import TopicPanel from '../../components/admin/TopicPanel'
import WordPool, { EnrichedWord } from '../../components/admin/WordPool'



// ─── Main Page ───────────────────────────────────────────────
export default function RoadmapSetupPage() {
  const { t } = useTranslation()
  const { roadmapId } = useParams<{ roadmapId: string }>()
  const { fetch: fetchTopics } = useAdminTopics()

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [words, setWords] = useState<EnrichedWord[]>([])
  const [wordCounts, setWordCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  // UI State
  const {
    selectedIds: selectedWordIds,
    toggleOne: toggleWord,
    toggleAll: toggleAllSelection,
    clear: clearSelectedWords,
    remove: removeFromSelection,
  } = useSelection()
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

  // Toggle all visible words
  function toggleAll() {
    toggleAllSelection(filteredWords.map((w) => w.id))
  }

  // Bulk assign to topic
  async function handleBulkAssign(targetTopicId: string) {
    if (!roadmapId) return
    const ids = [...selectedWordIds]
    if (targetTopicId) {
      await assignWordsToTopic(ids, targetTopicId)
    }
    clearSelectedWords()
    await loadData()
    await fetchTopics()
  }

  // Bulk unassign from active topic
  async function handleBulkUnassign() {
    if (!activeTopicId) return
    const ids = [...selectedWordIds]
    await unassignWordsFromTopic(ids, activeTopicId)
    clearSelectedWords()
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
    const removedId = deleteWordTarget
    setDeleteWordTarget(null)
    removeFromSelection(removedId)
    await loadData()
  }

  // Reorder topics
  async function handleReorderTopics(reordered: Topic[]) {
    setTopics(reordered)
    const updates = reordered.map((t, i) => ({ id: t.id, sort_order: i }))
    await reorderTopics(updates)
  }
  async function handleSaveTopic(data: {
    name: string; slug: string; description: string | null
    image_url: string | null; icon: string; color: string; roadmap_id: string | null
  }) {
    if (editTopic) {
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
        {t('admin.roadmapSetup.notFound')}
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
          {t('admin.roadmapSetup.back')}
        </Link>
        <div className="h-6 w-px bg-stone-200" />
        <div>
          <h1 className="text-2xl font-black text-secondary">
            {roadmap?.name ?? '...'}
          </h1>
          <p className="text-sm text-on-surface-variant">{t('admin.roadmapSetup.manage')}</p>
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
        title={t('admin.roadmapSetup.deleteTopic.title')}
        message={t('admin.roadmapSetup.deleteTopic.confirm', { name: deleteTopicTarget?.name })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleDeleteTopic}
        onCancel={() => setDeleteTopicTarget(null)}
      />

      {/* Delete word confirm */}
      <ConfirmDialog
        open={!!deleteWordTarget}
        title={t('admin.words.delete.title')}
        message={t('admin.words.delete.message', { word: words.find(w => w.id === deleteWordTarget)?.word || '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleDeleteWord}
        onCancel={() => setDeleteWordTarget(null)}
      />
    </div>
  )
}
