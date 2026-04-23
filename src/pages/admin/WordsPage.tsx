import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminWords } from '../../hooks/admin/useAdminWords'
import { useSelection } from '../../hooks/useSelection'
import { getAllTopics } from '../../lib/queries/topic-queries'
import { useRoadmapContext } from '../../contexts/RoadmapContext'
import WordFormModal from '../../components/admin/WordFormModal'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Word, Topic } from '../../lib/types'

import WordsToolbar from '../../components/admin/words/WordsToolbar'
import BulkActionBar from '../../components/admin/words/BulkActionBar'
import WordsTable from '../../components/admin/words/WordsTable'

const WORDS_PAGE_SIZE = 20

export default function AdminWordsPage() {
  const { t } = useTranslation()
  const { words, loading, error, fetch, addWord, editWord, removeWord, bulkDelete, bulkAssignTopic, loadChoices } = useAdminWords()
  const { selectedRoadmap } = useRoadmapContext()
  const [topics, setTopics] = useState<Topic[]>([])

  // Filters
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState('')
  const [sort, setSort] = useState<'newest' | 'az' | 'difficulty'>('newest')
  const [page, setPage] = useState(1)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editWordData, setEditWordData] = useState<Word | null>(null)
  const [editWordWrongChoices, setEditWordWrongChoices] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Word | null>(null)
  const [searchDebounce, setSearchDebounce] = useState('')

  // Bulk selection
  const {
    selectedIds,
    setSelectedIds,
    toggleOne,
    toggleAll: toggleAllSelection,
    clear: clearSelection,
    allSelected: isAllSelected,
    someSelected: isSomeSelected,
  } = useSelection()
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignTopicId, setAssignTopicId] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounce(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Load topics once
  useEffect(() => {
    getAllTopics().then(({ data }) => setTopics((data as Topic[]) ?? []))
  }, [])

  // Fetch words when filters change
  useEffect(() => {
    fetch(topicFilter || undefined, searchDebounce || undefined)
    setPage(1)
    clearSelection()
  }, [topicFilter, searchDebounce])

  // Sorted words
  const sorted = [...words].sort((a, b) => {
    if (sort === 'az') return a.word.localeCompare(b.word)
    if (sort === 'difficulty') return b.difficulty - a.difficulty
    return 0 // newest already from query
  })

  // Roadmap filter for topics in dropdowns
  const availableTopics = topics.filter(t => !selectedRoadmap || t.roadmap_id === selectedRoadmap.id)

  const totalPages = Math.max(1, Math.ceil(sorted.length / WORDS_PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * WORDS_PAGE_SIZE, page * WORDS_PAGE_SIZE)

  // Selection helpers (derived from useSelection)
  const allPageIds = paginated.map(w => w.id)
  const allSelected = isAllSelected(allPageIds)
  const someSelected = isSomeSelected(allPageIds)
  const toggleAll = () => toggleAllSelection(allPageIds)

  // Bulk actions
  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    const ids = [...selectedIds]
    const { error: err } = await bulkDelete(ids)
    setBulkLoading(false)
    if (err) {
      console.error(err)
      return
    }
    clearSelection()
    setBulkDeleteConfirm(false)
    await fetch()
  }

  async function handleBulkAssign() {
    if (!assignTopicId || selectedIds.size === 0) return
    setBulkLoading(true)
    const ids = [...selectedIds]
    const { error: err } = await bulkAssignTopic(ids, assignTopicId)
    setBulkLoading(false)
    if (err) {
      console.error(err)
      return
    }
    clearSelection()
    setShowAssignModal(false)
    setAssignTopicId('')
  }

  async function handleSave(
    wordData: Omit<Word, 'id' | 'created_at' | 'updated_at'>,
    wrongChoices: string[]
  ) {
    if (editWordData) {
      const { error } = await editWord(editWordData.id, wordData, wrongChoices)
      if (error) { console.error(error); return }
    } else {
      const { error } = await addWord(wordData, wrongChoices)
      if (error) { console.error(error); return }
    }
    setShowModal(false)
    setEditWordData(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await removeWord(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-secondary">{t('admin.words.title')}</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {loading ? '...' : t('admin.words.count', { count: words.length })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setEditWordData(null); setEditWordWrongChoices([]); setShowModal(true) }}
            className="flex items-center gap-2 px-5 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {t('admin.words.addWord')}
          </button>
        </div>
      </div>

      <WordsToolbar 
        search={search}
        setSearch={setSearch}
        topicFilter={topicFilter}
        setTopicFilter={setTopicFilter}
        sort={sort}
        setSort={setSort}
        topics={availableTopics}
      />

      <BulkActionBar 
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        bulkDeleteConfirm={bulkDeleteConfirm}
        setBulkDeleteConfirm={setBulkDeleteConfirm}
        handleBulkDelete={handleBulkDelete}
        showAssignModal={showAssignModal}
        setShowAssignModal={setShowAssignModal}
        assignTopicId={assignTopicId}
        setAssignTopicId={setAssignTopicId}
        handleBulkAssign={handleBulkAssign}
        topics={availableTopics}
        bulkLoading={bulkLoading}
      />

      {/* Error */}
      {error && (
        <div className="mb-4 mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && words.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 bg-white border border-stone-100 rounded-3xl mt-6">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="text-sm font-bold text-stone-400">{t('admin.words.loading')}</p>
        </div>
      ) : (
        <WordsTable 
          paginated={paginated}
          selectedIds={selectedIds}
          allSelected={allSelected}
          someSelected={someSelected}
          toggleAll={toggleAll}
          toggleOne={toggleOne}
          setEditWordData={async (w) => {
            const choices = await loadChoices(w.id)
            setEditWordData(w)
            setEditWordWrongChoices(choices.map(c => c.choice))
            setShowModal(true)
          }}
          setDeleteTarget={setDeleteTarget}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 mt-6 bg-white border border-stone-100 rounded-2xl shadow-sm">
          <p className="text-sm font-bold text-stone-400">
            {t('admin.words.pagination.page', { current: page, total: totalPages })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-sm font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {t('admin.words.pagination.prev')}
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-sm font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {t('admin.words.pagination.next')}
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <WordFormModal
        open={showModal}
        word={editWordData}
        initialWrongChoices={editWordWrongChoices}
        onSave={handleSave}
        onClose={() => { setShowModal(false); setEditWordData(null); setEditWordWrongChoices([]) }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('admin.words.delete.title')}
        message={t('admin.words.delete.message', { word: deleteTarget?.word })}
        confirmLabel={t('admin.words.delete.confirm')}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
