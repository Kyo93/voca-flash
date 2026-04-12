import { useEffect, useState } from 'react'
import { useAdminWords } from '../../hooks/admin/useAdminWords'
import { getAllTopics } from '../../lib/admin-queries'
import WordFormModal from '../../components/admin/WordFormModal'
import ConfirmDialog from '../../components/ConfirmDialog'
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
  const { words, loading, error, fetch, addWord, editWord, removeWord, loadChoices, loadTopicIds } = useAdminWords()
  const [topics, setTopics] = useState<Topic[]>([])

  // Filters
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState('')
  const [sort, setSort] = useState<'newest' | 'az' | 'difficulty'>('newest')
  const [page, setPage] = useState(1)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editWordData, setEditWordData] = useState<Word | null>(null)
  const [editWordTopicIds, setEditWordTopicIds] = useState<string[]>([])
  const [editWordWrongChoices, setEditWordWrongChoices] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Word | null>(null)
  const [searchDebounce, setSearchDebounce] = useState('')

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
  }, [topicFilter, searchDebounce])

  // Sorted words
  const sorted = [...words].sort((a, b) => {
    if (sort === 'az') return a.word.localeCompare(b.word)
    if (sort === 'difficulty') return b.difficulty - a.difficulty
    return 0 // newest already from query
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
        <button
          onClick={() => { setEditWordData(null); setEditWordTopicIds([]); setEditWordWrongChoices([]); setShowModal(true) }}
          className="flex items-center gap-2 px-5 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Thêm từ
        </button>
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
          {topics.map((t) => (
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
                  <td colSpan={6} className="px-4 py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                      <p>Đang tải...</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl">search_off</span>
                      <p>Không tìm thấy từ vựng nào</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((w) => (
                <tr key={w.id} className="border-b border-stone-50 last:border-0 hover:bg-orange-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-black text-secondary">{w.word}</p>
                      {w.phonetic && <p className="text-xs text-stone-400">{w.phonetic}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {w.topics ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: (w.topics.color ?? '#f97316') + '20', color: w.topics.color ?? '#f97316' }}
                      >
                        {w.topics.name}
                      </span>
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
                          // pass current wrong choices to edit
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
    </div>
  )
}
