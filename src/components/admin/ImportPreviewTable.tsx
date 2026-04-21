import { useTranslation } from 'react-i18next'
import type { Topic, NormalizedWord } from '../../lib/types'
import DifficultyDots from './DifficultyDots'

export interface ImportRow extends NormalizedWord {
  rowIndex: number
}

export type DuplicateAction = 'update' | 'skip'

interface ImportPreviewTableProps {
  rows: ImportRow[]
  topics: Topic[]
  stats: {
    ok: number
    duplicates: number
    errors: number
  }
  onRowDuplicateAction: (rowIndex: number, action: DuplicateAction) => void
  onBulkDuplicateAction: (action: DuplicateAction) => void
}

/**
 * ImportPreviewTable - Displays a list of words parsed from CSV/URL before final import.
 * Handles duplicate resolution and validation error display.
 */
export default function ImportPreviewTable({
  rows,
  topics,
  stats,
  onRowDuplicateAction,
  onBulkDuplicateAction,
}: ImportPreviewTableProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      {/* ── Stats bar ── */}
      <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm font-bold text-secondary">
            {stats.ok} từ mới
          </span>
        </div>
        {stats.duplicates > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-sm font-bold text-secondary">
              {stats.duplicates} trùng lặp
            </span>
            <div className="ml-2 flex gap-1">
              <button
                onClick={() => onBulkDuplicateAction('skip')}
                className="text-xs px-2 py-1 rounded-lg bg-stone-100 text-stone-600 font-medium hover:bg-stone-200 transition-colors"
              >
                Bỏ qua hết
              </button>
              <button
                onClick={() => onBulkDuplicateAction('update')}
                className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition-colors"
              >
                Cập nhật hết
              </button>
            </div>
          </div>
        )}
        {stats.errors > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-sm font-bold text-secondary">
              {stats.errors} lỗi
            </span>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="border border-stone-200 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-black text-stone-400 uppercase w-8">#</th>
              <th className="px-2 py-2 text-left text-xs font-black text-stone-400 uppercase w-36">Word</th>
              <th className="px-2 py-2 text-left text-xs font-black text-stone-400 uppercase w-12">Type</th>
              <th className="px-2 py-2 text-left text-xs font-black text-stone-400 uppercase w-14">Diff</th>
              <th className="px-2 py-2 text-left text-xs font-black text-stone-400 uppercase w-32">Topics</th>
              <th className="px-2 py-2 text-left text-xs font-black text-stone-400 uppercase min-w-[180px]">Definition</th>
              <th className="px-2 py-2 text-left text-xs font-black text-stone-400 uppercase min-w-[150px]">Example EN</th>
              <th className="px-2 py-2 text-left text-xs font-black text-stone-400 uppercase min-w-[130px]">Example VI</th>
              <th className="px-2 py-2 text-left text-xs font-black text-stone-400 uppercase w-32">Sai 1/2/3</th>
              <th className="px-2 py-2 text-left text-xs font-black text-stone-400 uppercase w-10">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {rows.map((row) => (
              <tr
                key={row.rowIndex}
                className={`hover:bg-orange-50/30 transition-colors ${
                  row.status === 'invalid' ? 'bg-red-50/30' : ''
                }`}
              >
                <td className="px-2 py-2 text-xs text-stone-400">{row.rowIndex}</td>
                <td className="px-2 py-2">
                  <p className="font-bold text-secondary text-sm leading-tight truncate" title={row.word}>
                    {row.word}
                  </p>
                  {row.phonetic && (
                    <p className="text-xs text-stone-400 truncate" title={row.phonetic}>{row.phonetic}</p>
                  )}
                </td>
                <td className="px-2 py-2">
                  <span className="text-xs font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                    {row.pos?.toUpperCase() ?? 'N'}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <DifficultyDots value={row.difficulty} />
                </td>
                <td className="px-2 py-2">
                  <div className="flex flex-wrap gap-1">
                    {row.topicIds.map(tid => {
                      const topic = topics.find(t => t.id === tid)
                      return topic ? (
                        <span
                          key={tid}
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                          style={{
                            backgroundColor: (topic.color ?? '#f97316') + '20',
                            color: topic.color ?? '#f97316',
                          }}
                        >
                          {topic.name}
                        </span>
                      ) : null
                    })}
                    {row.unmatchedTopics?.map(un => (
                      <span key={un} className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 whitespace-nowrap">
                        ⚠️ {un}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-2 py-2 text-on-surface-variant leading-snug">
                  <p className="line-clamp-2" title={row.definition ?? undefined}>{row.definition}</p>
                </td>
                <td className="px-2 py-2">
                  <p className="text-xs text-stone-500 italic line-clamp-2" title={row.example ?? undefined}>{row.example}</p>
                </td>
                <td className="px-2 py-2">
                  <p className="text-xs text-stone-400 italic line-clamp-2" title={row.example_vi ?? undefined}>{row.example_vi}</p>
                </td>
                <td className="px-2 py-2">
                  <div className="flex flex-wrap gap-1">
                    {row.wrongChoices.filter(Boolean).map((w, i) => (
                      <span key={i} className="text-[10px] text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100 whitespace-nowrap">
                        {w}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-2 py-2">
                  {row.status === 'invalid' ? (
                    <div>
                      <span className="text-xs font-bold text-red-600">❌ lỗi</span>
                      {row.validationErrors && (
                        <p className="text-[10px] text-red-500 mt-0.5 leading-tight">
                          {row.validationErrors.map(e => t(`admin.import.${e}`)).join(', ')}
                        </p>
                      )}
                    </div>
                  ) : row.status === 'duplicate' ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-yellow-600">⚠️ trùng</span>
                      <select
                        value={row.duplicateAction ?? 'skip'}
                        onChange={e => onRowDuplicateAction(row.rowIndex - 1, e.target.value as DuplicateAction)}
                        className="text-[10px] px-1 py-0.5 rounded border border-yellow-300 bg-white font-medium outline-none cursor-pointer"
                      >
                        <option value="skip">Bỏ qua</option>
                        <option value="update">Cập nhật</option>
                      </select>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-green-600">✓ OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
