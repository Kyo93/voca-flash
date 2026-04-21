import { motion } from 'framer-motion'
import { Word } from '../../../lib/types'
import { formatDetailedDate } from '../../../lib/utils'

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

interface WordsTableProps {
  paginated: Word[];
  selectedIds: Set<string>;
  allSelected: boolean;
  someSelected: boolean;
  toggleAll: () => void;
  toggleOne: (id: string) => void;
  setEditWordData: (word: Word) => void;
  setDeleteTarget: (word: Word) => void;
}

export default function WordsTable({
  paginated, selectedIds, allSelected, someSelected,
  toggleAll, toggleOne, setEditWordData, setDeleteTarget
}: WordsTableProps) {

  if (paginated.length === 0) {
    return (
      <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-100">
        <span className="material-symbols-outlined text-6xl text-stone-300 mb-4 font-variation-fill">inbox</span>
        <h3 className="text-xl font-bold text-stone-500">Chưa có từ vựng nào</h3>
        <p className="text-stone-400 mt-2">Hãy thêm từ vựng mới hoặc thay đổi bộ lọc</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden flex flex-col mt-6">
      <div className="overflow-x-auto">
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
          <tbody>
            {paginated.map((w, idx) => (
              <motion.tr
                key={w.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
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
                      onClick={() => setEditWordData(w)}
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
        </table>
      </div>
    </div>
  )
}
