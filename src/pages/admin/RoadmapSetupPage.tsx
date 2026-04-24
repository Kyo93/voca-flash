import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, Link } from 'react-router-dom'
import { useRoadmapSetup } from '../../hooks/admin/useRoadmapSetup'

import TopicFormModal from '../../components/admin/TopicFormModal'
import ImportWordsModal from '../../components/admin/ImportWordsModal'
import ConfirmDialog from '../../components/ConfirmDialog'
import TopicPanel from '../../components/admin/TopicPanel'
import WordPool from '../../components/admin/WordPool'
import type { Topic } from '../../lib/types'

export default function RoadmapSetupPage() {
  const { t } = useTranslation()
  const { roadmapId } = useParams<{ roadmapId: string }>()

  const {
    roadmap,
    topics,
    words,
    wordCounts,
    filteredWords,
    uncategorizedCount,
    loading,
    selectedWordIds,
    toggleWord,
    toggleAll,
    search,
    setSearch,
    activeTopicId,
    setActiveTopicId,
    activeTagFilter,
    setActiveTagFilter,
    refreshAll,
    handleBulkAssign,
    handleBulkUnassign,
    handleDeleteTopic,
    handleDeleteWord,
    handleReorderTopics,
    handleSaveTopic,
  } = useRoadmapSetup(roadmapId)

  // Modals
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [editTopic, setEditTopic] = useState<Topic | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [deleteTopicTarget, setDeleteTopicTarget] = useState<Topic | null>(null)
  const [deleteWordTarget, setDeleteWordTarget] = useState<string | null>(null)

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
        onSave={async (data) => {
          await handleSaveTopic(editTopic, data)
          setShowTopicModal(false)
          setEditTopic(null)
        }}
        onClose={() => { setShowTopicModal(false); setEditTopic(null) }}
      />

      <ImportWordsModal
        open={showImportModal}
        topics={topics}
        roadmapId={roadmapId}
        roadmapName={roadmap?.name ?? ''}
        roadmapSlug={roadmap?.slug}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => { setShowImportModal(false); refreshAll() }}
      />

      {/* Delete topic confirm */}
      <ConfirmDialog
        open={!!deleteTopicTarget}
        title={t('admin.roadmapSetup.deleteTopic.title')}
        message={t('admin.roadmapSetup.deleteTopic.confirm', { name: deleteTopicTarget?.name })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={async () => {
          if (deleteTopicTarget) await handleDeleteTopic(deleteTopicTarget)
          setDeleteTopicTarget(null)
        }}
        onCancel={() => setDeleteTopicTarget(null)}
      />

      {/* Delete word confirm */}
      <ConfirmDialog
        open={!!deleteWordTarget}
        title={t('admin.words.delete.title')}
        message={t('admin.words.delete.message', { word: words.find(w => w.id === deleteWordTarget)?.word || '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={async () => {
          if (deleteWordTarget) await handleDeleteWord(deleteWordTarget)
          setDeleteWordTarget(null)
        }}
        onCancel={() => setDeleteWordTarget(null)}
      />
    </div>
  )
}
