import { useEffect, useState } from 'react'
import { useAdminWords } from '../../hooks/admin/useAdminWords'
import { getAllTopics, getAllRoadmaps } from '../../lib/admin-queries'
import { useRoadmapContext } from '../../contexts/RoadmapContext'
import WordFormModal from '../../components/admin/WordFormModal'
import ConfirmDialog from '../../components/ConfirmDialog'
import ImportWordsModal from '../../components/admin/ImportWordsModal'
import type { Word, Topic } from '../../lib/types'

const POS_LABELS: Record<string, string> = {
  noun: 'DT', verb: 'ĐT', adj: 'TT', adv: 'TrT', phrase: 'CT', other: 'Khác',
}

function DifficultyDots({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`w-2 h-2 rounded-full ${n <= value ? 'bg-primary' : 'bg-stone-200'}`}
        />
      ))}
    </div>
  )
}

const PAGE_SIZE = 20

export default function AdminWordsPage() {
  const { words, loading, error, fetch, addWord, editWord, removeWord, bulkDelete, bulkAssignTopic, loadChoices, loadTopicIds } = useAdminWords()
  const { selectedRoadmap } = useRoadmapContext()
  const [topics, setTopics] = useState<Topic[]>([])
  const [roadmapNameMap, setRoadmapNameMap] = useState<Map<string, string>>(new Map())

  // Filters
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState('')
  const [sort, setSort] = useState<'newest' | 'az' | 'difficulty'>('newest')
  const [page, setPage] = useState(1)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editWordData, setEditWordData] = useState<Word | null>(null)
  const [editWordTopicIds, setEditWordTopicIds] = useState<string[]>([])
  const [editWordWrongChoices, setEditWordWrongChoices] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Word | null>(null)
  const [searchDebounce, setSearchDebounce] = useState('')

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignTopicId, setAssignTopicId] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounce(search), 300)
    return () => clearTimeout(t)
  }, [search])

  // Load topics + roadmap name map once
  useEffect(() => {
    getAllTopics().then(({ data }) => setTopics((data as Topic[]) ?? []))
    getAllRoadmaps().then(({ data }) => {
      const rMap = new Map((data as any[] ?? []).map((r: any) => [r.id, r.name]))
      setRoadmapNameMap(rMap)
    })
  }, [])

  // Fetch words when filters change
  useEffect(() => {
    fetch(topicFilter || undefined, searchDebounce || undefined)
    setPage(1)
    setSelectedIds(new Set())
  }, [topicFilter, searchDebounce])

  // Sorted words
  const sorted = [...words].sort((a, b) => {
    if (sort === 'az') return a.word.localeCompare(b.word)
    if (sort === 'difficulty') return b.difficulty - a.difficulty
    return 0 // newest already from query
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Selection helpers
  const allPageIds = paginated.map(w => w.id)
  const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedIds.has(id))
  const someSelected = allPageIds.some(id => selectedIds.has(id))

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev)
        allPageIds.forEach(id => next.delete(id))
        return next
      })
    } else {
      setSelectedIds(prev => new Set([...prev, ...allPageIds]))
    }
  }

  function toggleOne(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
    setSelectedIds(new Set())
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
    setSelectedIds(new Set())
    setShowAssignModal(false)
    setAssignTopicId('')
  }

  async function handleSave(
    wordData: Omit<Word, 'id' | 'created_at' | 'updated_at'>,
    wrongChoices: string[],
    topicIds: string[]
  ) {
    if (editWordData) {
      const { error } = await editWord(editWordData.id, wordData, wrongChoices, topicIds)
      if (error) { console.error(error); return }
    } else {
      const { error } = await addWord(wordData, wrongChoices, topicIds)
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
          <h1 className="text-3xl font-black text-secondary">Từ vựng</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {loading ? '...' : `${words.length} từ vựng`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-orange-50 transition-all"
          >
            <span className="material-symbols-outlined text-sm">upload</span>
            Nhập từ vựng
          </button>
          <button
            onClick={() => { setEditWordData(null); setEditWordTopicIds([]); setEditWordWrongChoices([]); setShowModal(true) }}
            className="flex items-center gap-2 px-5 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Thêm từ
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 text-lg">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm từ vựng..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-stone-200 bg-white text-secondary placeholder:text-stone-400 font-medium outline-none focus:border-primary transition-all"
          />
        </div>

        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border-2 border-stone-200 bg-white text-secondary font-medium outline-none focus:border-primary transition-all cursor-pointer"
        >
          <option value="">Tất cả chủ đề</option>
          {topics
            .filter(t => !selectedRoadmap || t.roadmap_id === selectedRoadmap.id)
            .map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="px-4 py-3 rounded-xl border-2 border-stone-200 bg-white text-secondary font-medium outline-none focus:border-primary transition-all cursor-pointer"
        >
          <option value="newest">Mới nhất</option>
          <option value="az">A → Z</option>
          <option value="difficulty">Độ khó</option>
        </select>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-5 py-3 bg-orange-50 border-2 border-orange-200 rounded-xl animate-in slide-in-from-top-2">
          <span className="text-sm font-black text-primary">
            {selectedIds.size} từ đã chọn
          </span>
          <div className="flex-1 h-px bg-orange-200" />
          <button
            onClick={() => { setAssignTopicId(''); setShowAssignModal(true) }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-stone-200 text-sm font-bold text-secondary hover:bg-orange-100 hover:border-orange-300 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">playlist_add</span>
            Gán chủ đề
          </button>
          <button
            onClick={() => setBulkDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-red-200 text-sm font-bold text-red-500 hover:bg-red-50 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Xóa ({selectedIds.size})
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="material-symbols-outlined text-stone-400 hover:text-stone-600 cursor-pointer transition-colors"
            title="Bỏ chọn"
          >
            close
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = !allSelected && someSelected }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                    title="Chọn tất cả trên trang"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Từ</th>
                <th className="px-4 py-3 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Chủ đề</th>
                <th className="px-4 py-3 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Loại</th>
                <th className="px-4 py-3 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Độ khó</th>
                <th className="px-4 py-3 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Nghĩa</th>
                <th className="px-4 py-3 text-right text-xs font-black text-stone-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && words.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                      <p>Đang tải...</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl">search_off</span>
                      <p>Không tìm thấy từ vựng nào</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((w) => (
                <tr key={w.id} className={`border-b border-stone-50 last:border-0 transition-colors ${selectedIds.has(w.id) ? 'bg-orange-50/50' : 'hover:bg-orange-50/30'}`}>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(w.id)}
                      onChange={() => toggleOne(w.id)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-black text-secondary">{w.word}</p>
                      {w.phonetic && <p className="text-xs text-stone-400">{w.phonetic}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {w.topics ? (
                      <div className="flex flex-col gap-0.5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ backgroundColor: (w.topics.color ?? '#f97316') + '20', color: w.topics.color ?? '#f97316' }}
                        >
                          {w.topics.name}
                        </span>
                        {(() => {
                          const topicMeta = topics.find(t => t.id === (w.topics as any).id)
                          const roadmapName = topicMeta?.roadmap_id ? roadmapNameMap.get(topicMeta.roadmap_id) : null
                          return roadmapName ? (
                            <span className="inline-block text-[10px] text-orange-400 font-bold">{roadmapName}</span>
                          ) : null
                        })()}
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-lg">
                      {POS_LABELS[w.pos ?? 'other'] ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <DifficultyDots value={w.difficulty ?? 3} />
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-sm text-on-surface-variant truncate">{w.definition}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={async () => {
                          const [choices, tIds] = await Promise.all([
                            loadChoices(w.id),
                            loadTopicIds(w.id)
                          ])
                          setEditWordData(w)
                          setEditWordTopicIds(tIds)
                          setEditWordWrongChoices(choices.map(c => c.choice))
                          setShowModal(true)
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-orange-100 transition-colors cursor-pointer"
                        title="Sửa"
                      >
                        <span className="material-symbols-outlined text-stone-400 text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(w)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <span className="material-symbols-outlined text-red-400 text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 bg-stone-50">
            <p className="text-sm text-stone-500">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-sm font-bold text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ←
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-sm font-bold text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <WordFormModal
        open={showModal}
        word={editWordData}
        initialTopicIds={editWordTopicIds}
        initialWrongChoices={editWordWrongChoices}
        topics={topics}
        showTopics={topics.filter(t => !selectedRoadmap || t.roadmap_id === selectedRoadmap.id).length > 0}
        onSave={handleSave}
        onClose={() => { setShowModal(false); setEditWordData(null); setEditWordTopicIds([]); setEditWordWrongChoices([]) }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa từ vựng?"
        message={`Bạn có chắc muốn xóa từ "${deleteTarget?.word}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={bulkDeleteConfirm}
        title={`Xóa ${selectedIds.size} từ?`}
        message={`Bạn có chắc muốn xóa ${selectedIds.size} từ đã chọn? Hành động này không thể hoàn tác.`}
        confirmLabel={`Xóa ${selectedIds.size} từ`}
        danger
        loading={bulkLoading}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />

      {/* Assign Topic Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowAssignModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-stone-100">
              <h2 className="text-lg font-black text-secondary">Gán chủ đề</h2>
              <p className="text-sm text-stone-500 mt-1">cho {selectedIds.size} từ đã chọn</p>
            </div>
            <div className="px-6 py-5">
              <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-2">
                Chủ đề
              </label>
              <select
                value={assignTopicId}
                onChange={(e) => setAssignTopicId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-white text-secondary font-medium outline-none focus:border-primary transition-all cursor-pointer"
              >
                <option value="">— Chọn chủ đề —</option>
                {topics
                  .filter(t => !selectedRoadmap || t.roadmap_id === selectedRoadmap.id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
              </select>
            </div>
            <div className="px-6 py-4 bg-stone-50 flex justify-end gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-5 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-500 hover:bg-stone-100 transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleBulkAssign}
                disabled={!assignTopicId || bulkLoading}
                className="flex items-center gap-2 px-5 py-2.5 primary-gradient text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {bulkLoading ? (
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-base">check</span>
                )}
                Gán chủ đề
              </button>
            </div>
          </div>
        </div>
      )}

      <ImportWordsModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => fetch()}
        topics={topics}
        roadmapId={selectedRoadmap?.id ?? undefined}
      />
    </div>
  )
}
