import { useEffect, useState } from 'react'
import { useAdminWords } from '../../hooks/admin/useAdminWords'
import { getAllTopics } from '../../lib/admin-queries'
import { useRoadmapContext } from '../../contexts/RoadmapContext'
import WordFormModal from '../../components/admin/WordFormModal'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Word, Topic } from '../../lib/types'
import { formatDetailedDate } from '../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import AdminCard from '../../components/admin/AdminCard'

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

  // Load topics once
  useEffect(() => {
    getAllTopics().then(({ data }) => setTopics((data as Topic[]) ?? []))
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
          <h1 className="text-3xl font-black text-secondary">Từ vựng</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {loading ? '...' : `${words.length} từ vựng`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setEditWordData(null); setEditWordWrongChoices([]); setShowModal(true) }}
            className="flex items-center gap-2 px-5 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Thêm từ
          </button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="admin-toolbar sticky top-24 z-30 transition-all duration-300">
        <div className="flex-1 relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-300 group-focus-within:text-primary transition-colors">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm từ vựng tinh tế..."
            className="w-full pl-12 pr-4 py-3 bg-stone-50/50 border-none rounded-2xl text-sm font-medium placeholder:text-stone-300 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="h-8 w-px bg-stone-100 mx-2" />
          
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="pl-4 pr-10 py-2.5 bg-stone-50/50 hover:bg-stone-100 rounded-xl text-xs font-black text-secondary border-none outline-none cursor-pointer appearance-none relative"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23a8a29e\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'org.w3.org/2000/svg\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
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
            className="px-4 py-2.5 bg-stone-50/50 hover:bg-stone-100 rounded-xl text-xs font-black text-secondary border-none outline-none cursor-pointer appearance-none"
          >
            <option value="newest">Mới nhất</option>
            <option value="az">A → Z</option>
            <option value="difficulty">Độ khó</option>
          </select>
        </div>
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

      <AdminCard className="mb-6">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-6 py-4 w-12 sticky-col bg-stone-50/50">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = !allSelected && someSelected }}
                    onChange={toggleAll}
                    className="w-5 h-5 rounded-lg accent-primary cursor-pointer transition-all"
                    title="Chọn tất cả trên trang"
                  />
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] sticky-col left-12 bg-stone-50/50">Từ vựng</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Loại</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Độ khó</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Nghĩa</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Ví dụ & Dịch</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Tags</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Thời gian</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] sticky right-0 bg-stone-50/50 backdrop-blur-md">Hành động</th>
              </tr>
            </thead>
            <AnimatePresence mode="popLayout">
              <tbody>
                {loading && words.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
                        <p className="text-sm font-bold text-stone-400">Đang khởi tạo từ điển...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-5xl text-stone-200">sentiment_dissatisfied</span>
                        <p className="text-sm font-bold text-stone-400">Không tìm thấy từ nào khớp với tâm trạng này</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map((w, idx) => (
                  <motion.tr
                    key={w.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`group border-b border-stone-50 last:border-0 transition-all ${selectedIds.has(w.id) ? 'bg-primary/5' : 'hover:bg-stone-50/50'}`}
                  >
                    <td className="px-6 py-4 sticky-col group-hover:bg-stone-50/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(w.id)}
                        onChange={() => toggleOne(w.id)}
                        className="w-5 h-5 rounded-lg accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 sticky-col left-12 group-hover:bg-stone-50/50 transition-colors">
                      <div>
                        <p className="text-lg font-black text-secondary leading-tight">{w.word}</p>
                        {w.phonetic && <p className="text-[10px] text-stone-400 font-mono tracking-wider mt-0.5">{w.phonetic}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[10px] font-black text-stone-500 uppercase tracking-wider">
                        {POS_LABELS[w.pos ?? 'other'] ?? '—'}
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
                        {w.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase">{tag}</span>
                        ))}
                        {w.tags && w.tags.length > 2 && (
                          <span className="text-[9px] text-stone-300 font-bold">+{w.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-stone-400 font-mono">{formatDetailedDate(w.created_at)}</span>
                        {w.updated_at && w.updated_at !== w.created_at && (
                          <span className="text-[9px] text-primary/60 font-mono italic">Đã sửa</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right sticky right-0 bg-white/80 backdrop-blur-md group-hover:bg-stone-50/80 transition-colors">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={async () => {
                            const choices = await loadChoices(w.id)
                            setEditWordData(w)
                            setEditWordWrongChoices(choices.map(c => c.choice))
                            setShowModal(true)
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 text-stone-500 hover:bg-primary hover:text-white transition-all shadow-sm cursor-pointer"
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(w)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 text-stone-500 hover:bg-red-500 hover:text-white transition-all shadow-sm cursor-pointer"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}

              </tbody>

            </AnimatePresence>
          </table>

        </div>
      </AdminCard>

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

      </div>
  )
}
