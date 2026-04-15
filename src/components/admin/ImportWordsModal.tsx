import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { Topic, NormalizedWord, BatchInsertResult } from '../../lib/types'
import {
  parseFile,
  parseSheetsUrlIntoRows,
  parseErrorToMessage,
  resolveUnmatchedTopics,
  generateUniqueSlug,
  slugify,
} from '../../lib/import-parser'
import { batchInsertWords, createTopic, findDuplicateWords } from '../../lib/admin-queries'

// ── Props ─────────────────────────────────────────────────
interface Props {
  open: boolean
  onClose: () => void
  onImportComplete: () => void
  topics: Topic[]
  /** Roadmap ID — required. Import must happen in context of a specific roadmap. */
  roadmapId: string
  /** Display name of the roadmap for context label */
  roadmapName: string
}

// ── State machine ─────────────────────────────────────────
type ImportState = 'idle' | 'parsing' | 'preview' | 'importing' | 'done' | 'error'

interface ImportRow extends NormalizedWord {
  rowIndex: number
}

type DuplicateAction = 'keep' | 'update' | 'skip'

// ── Helpers ──────────────────────────────────────────────
function getTopicNameMap(topics: Topic[]): Map<string, Topic> {
  const map = new Map<string, Topic>()
  for (const t of topics) {
    map.set(t.name.toLowerCase(), t)
  }
  return map
}

// ── Difficulty dots ───────────────────────────────────────
function DifficultyDots({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <div
          key={n}
          className={`w-1.5 h-1.5 rounded-full ${n <= value ? 'bg-primary' : 'bg-stone-200'}`}
        />
      ))}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────
export default function ImportWordsModal({ open, onClose, onImportComplete, topics, roadmapId, roadmapName }: Props) {
  const { t } = useTranslation()
  // Filter topics by roadmap (always filtered — roadmapId is required)
  const filteredTopics = topics.filter(t => t.roadmap_id === roadmapId)
  const topicMap = getTopicNameMap(filteredTopics)

  const [state, setState] = useState<ImportState>('idle')
  const [sheetsUrl, setSheetsUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState<BatchInsertResult | null>(null)
  const [showErrorDetail, setShowErrorDetail] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Reset on close ──────────────────────────────────────
  const handleClose = useCallback(() => {
    setState('idle')
    setRows([])
    setErrorMessage('')
    setResult(null)
    setSheetsUrl('')
    setUrlError('')
    onClose()
  }, [onClose])

  // ── Unified parse handler ──────────────────────────────
  const handleParse = useCallback(async (parsed: { rows: NormalizedWord[]; unmatchedTopics: string[] }) => {
    // Guard: roadmapId is required — this should never be reached without one
    if (!roadmapId) {
      throw new Error('NO_ROADMAP_GUARD_FAILED')
    }

    // Auto-create missing topics with unique slugs
    let currentTopicMap = topicMap
    if (parsed.unmatchedTopics.length > 0) {
      const newTopicMap = new Map(currentTopicMap)
      // Build existing slugs set for uniqueness check
      const existingSlugs = new Set([...topicMap.values()].map(t => t.slug))
      for (const name of parsed.unmatchedTopics) {
        const uniqueSlug = generateUniqueSlug(slugify(name), existingSlugs)
        existingSlugs.add(uniqueSlug) // reserve this slug
        const { data, error } = await createTopic({
          name,
          slug: uniqueSlug,
          color: '#f97316',
          sort_order: 999,
          roadmap_id: roadmapId, // always set — never null
          description: null,
          image_url: null,
          icon: 'label',
        })
        if (!error && data) {
          newTopicMap.set(name.toLowerCase(), data as Topic)
        }
      }
      currentTopicMap = newTopicMap
    }

    // Re-resolve topic IDs with new topics
    const resolvedRows = resolveUnmatchedTopics(parsed.rows, currentTopicMap)

    // Check for duplicates in DB
    const wordTexts = resolvedRows
      .filter(r => r.status !== 'invalid')
      .map(r => r.word)
    const dupes = await findDuplicateWords(wordTexts)
    const dupeSet = new Set(dupes.map(w => w.toLowerCase()))

    const importRows: ImportRow[] = resolvedRows.map((r, idx) => ({
      ...r,
      rowIndex: idx + 1,
      status: dupeSet.has(r.word.toLowerCase()) ? 'duplicate' : r.status,
      duplicateAction: dupeSet.has(r.word.toLowerCase()) ? 'keep' : undefined,
    }))
    setRows(importRows)
    setState('preview')
  }, [topicMap])

  // ── Parse file ──────────────────────────────────────────
  const handleFileSelected = useCallback(async (file: File) => {
    setState('parsing')
    setErrorMessage('')
    try {
      const parsed = await parseFile(file, topicMap)
      await handleParse(parsed)
    } catch (err) {
      const code = err instanceof Error ? err.message : 'PARSE_ERROR'
      setErrorMessage(parseErrorToMessage(code))
      setState('error')
    }
  }, [topicMap, handleParse])
  const handleSheetsUrl = useCallback(async () => {
    if (!sheetsUrl.trim()) {
      setUrlError(t('admin.import.fileRequired'))
      return
    }
    setUrlError('')
    setState('parsing')
    setErrorMessage('')
    try {
      const parsed = await parseSheetsUrlIntoRows(sheetsUrl, topicMap)
      await handleParse(parsed)
    } catch (err) {
      const code = err instanceof Error ? err.message : 'PARSE_ERROR'
      setErrorMessage(parseErrorToMessage(code))
      setState('error')
    }
  }, [topicMap, sheetsUrl, t, handleParse])

  // ── Duplicate action per row ─────────────────────────
  function handleDuplicateAction(rowIndex: number, action: DuplicateAction) {
    setRows(prev => prev.map((r, i) =>
      i === rowIndex ? { ...r, duplicateAction: action } : r
    ))
  }

  // ── Bulk duplicate actions ──────────────────────────────
  function handleBulkDuplicateAction(action: DuplicateAction) {
    setRows(prev => prev.map(r =>
      r.status === 'duplicate' ? { ...r, duplicateAction: action } : r
    ))
  }

  // ── Start Import ────────────────────────────────────────
  async function handleStartImport() {
    const validRows = rows.filter(r => r.status !== 'invalid')
    if (validRows.length === 0) return

    // Exclude duplicates with 'skip' action; upsert handles everything else
    const toImport = validRows.filter(r => {
      if (r.status === 'duplicate' && r.duplicateAction === 'skip') return false
      return true
    })

    setState('importing')
    setProgress({ done: 0, total: toImport.length })

    const insertResult = await batchInsertWords(toImport)

    setProgress({ done: toImport.length, total: toImport.length })
    setResult(insertResult)
    setState('done')
  }

  if (!open) return null

  // ── Stats ─────────────────────────────────────────────
  const stats = {
    ok: rows.filter(r => r.status === 'new').length,
    duplicates: rows.filter(r => r.status === 'duplicate').length,
    errors: rows.filter(r => r.status === 'invalid').length,
    willImport: rows.filter(r => {
      if (r.status === 'invalid') return false
      if (r.status === 'duplicate' && r.duplicateAction === 'skip') return false
      return true
    }).length,
  }

  const canImport = stats.willImport > 0 && stats.errors === 0

  // ── Header step label ──────────────────────────────────
  const stepLabel = {
    idle: t('admin.import.step1'),
    parsing: t('admin.import.parsing'),
    preview: `${rows.length} ${t('admin.import.rowCount', { count: rows.length })}`,
    importing: t('admin.import.importingProgress', { done: progress.done, total: progress.total }),
    done: t('admin.import.step4'),
    error: t('admin.import.step3'),
  }[state]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-orange-50 w-full max-w-[1400px] max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-100 shrink-0">
          <div>
            <h2 className="text-xl font-black text-secondary">{t('admin.import.title')}</h2>
            <p className="text-sm text-on-surface-variant mt-1">{stepLabel}</p>
            {roadmapId && (
              <p className="text-xs font-bold text-primary mt-1">📍 Đang nhập vào: {roadmapName}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-stone-500">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Guard: no roadmap context */}
          {!roadmapId && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <span className="material-symbols-outlined text-6xl text-stone-300">folder_off</span>
              <div>
                <p className="text-lg font-black text-secondary">Cần chọn Roadmap trước</p>
                <p className="text-sm text-on-surface-variant mt-1">
                  Để nhập từ vựng, bạn cần mở từ một Roadmap cụ thể.
                </p>
              </div>
              <a
                href="/admin/roadmaps"
                className="px-6 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                Đi tới Roadmaps
              </a>
            </div>
          )}

          {/* STEP 1: Upload or Paste URL */}
          {state === 'idle' && roadmapId && (
            <div className="space-y-6">
              {/* Drop zone */}
              <div
                className="border-2 border-dashed border-orange-200 rounded-2xl p-12 text-center hover:border-primary hover:bg-orange-50/30 transition-all cursor-pointer"
                onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
                onDrop={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  const file = e.dataTransfer.files[0]
                  if (file) handleFileSelected(file)
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="material-symbols-outlined text-5xl text-orange-300 mb-3 block">upload_file</span>
                <p className="font-bold text-secondary text-lg">{t('admin.import.dragDrop')}</p>
                <p className="text-sm text-on-surface-variant mt-1">{t('admin.import.orClick')}</p>
                <p className="text-xs text-stone-400 mt-2">{t('admin.import.supported')}</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelected(file)
                }}
              />

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-orange-100" />
                <span className="text-xs font-bold text-stone-400 uppercase">{t('admin.import.or')}</span>
                <div className="flex-1 border-t border-orange-100" />
              </div>

              {/* Google Sheets URL */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-secondary">
                  {t('admin.import.pasteUrl')}
                </label>
                <input
                  type="url"
                  value={sheetsUrl}
                  onChange={e => { setSheetsUrl(e.target.value); setUrlError('') }}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all"
                />
                {urlError && (
                  <p className="text-sm text-red-500 font-medium">{urlError}</p>
                )}
                <button
                  onClick={handleSheetsUrl}
                  disabled={!sheetsUrl.trim()}
                  className="px-6 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('admin.import.preview')}
                </button>
              </div>

              {/* Template download */}
              <button
                onClick={() => {
                  // UTF-8 BOM (\uFEFF) ensures Excel/Windows reads Vietnamese chars correctly
                  const bom = '\uFEFF'
                  const csv = 'word,phonetic,pos,difficulty,definition,example,example_vi,image_url,topics,wrong1,wrong2,wrong3\nhello,/həˈloʊ/,noun,2,Xin chào,Hello world!,Xin chào thế giới!,,Travel;Greetings,hola,greetings,hi\napple,/ˈæpəl/,noun,1,Quả táo,An apple a day,Ăn táo mỗi ngày,,Food,pear,orange,fruit'
                  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'vocab-import-template.csv'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}
                className="flex items-center gap-2 text-sm font-bold text-primary hover:text-orange-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                {t('admin.import.downloadTemplate')}
              </button>
            </div>
          )}

          {/* STEP 2: Preview Table */}
          {state === 'preview' && (
            <div className="space-y-4">
              {/* Stats bar */}
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
                        onClick={() => handleBulkDuplicateAction('skip')}
                        className="text-xs px-2 py-1 rounded-lg bg-stone-100 text-stone-600 font-medium hover:bg-stone-200 transition-colors"
                      >
                        Bỏ qua hết
                      </button>
                      <button
                        onClick={() => handleBulkDuplicateAction('update')}
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

              {/* Table */}
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
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.rowIndex}
                        className={`border-t border-stone-100 hover:bg-orange-50/30 transition-colors ${
                          row.status === 'invalid' ? 'bg-red-50/30' : ''
                        }`}
                      >
                        {/* # */}
                        <td className="px-2 py-2 text-xs text-stone-400">{row.rowIndex}</td>

                        {/* Word + Phonetic */}
                        <td className="px-2 py-2">
                          <p className="font-bold text-secondary text-sm leading-tight truncate" title={row.word}>
                            {row.word}
                          </p>
                          {row.phonetic && (
                            <p className="text-xs text-stone-400 truncate" title={row.phonetic}>{row.phonetic}</p>
                          )}
                        </td>

                        {/* Type */}
                        <td className="px-2 py-2">
                          <span className="text-xs font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                            {row.pos?.toUpperCase() ?? 'N'}
                          </span>
                        </td>

                        {/* Difficulty */}
                        <td className="px-2 py-2">
                          <DifficultyDots value={row.difficulty} />
                        </td>

                        {/* Topics */}
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

                        {/* Definition */}
                        <td className="px-2 py-2">
                          <p
                            className="text-sm text-on-surface-variant leading-snug line-clamp-2"
                            title={row.definition}
                          >
                            {row.definition}
                          </p>
                        </td>

                        {/* Example EN */}
                        <td className="px-2 py-2">
                          {row.example && (
                            <p className="text-xs text-stone-500 italic leading-snug line-clamp-2" title={row.example}>
                              {row.example}
                            </p>
                          )}
                        </td>

                        {/* Example VI */}
                        <td className="px-2 py-2">
                          {row.example_vi && (
                            <p className="text-xs text-stone-400 italic leading-snug line-clamp-2" title={row.example_vi}>
                              {row.example_vi}
                            </p>
                          )}
                        </td>

                        {/* Wrong choices */}
                        <td className="px-2 py-2">
                          <div className="flex flex-wrap gap-1">
                            {row.wrongChoices.filter(Boolean).map((w, i) => (
                              <span key={i} className="text-xs text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100 whitespace-nowrap">
                                {w}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-2 py-2">
                          {row.status === 'invalid' ? (
                            <div>
                              <span className="text-xs font-bold text-red-600">❌ lỗi</span>
                              {row.validationErrors && (
                                <p className="text-xs text-red-500 mt-0.5">
                                  {row.validationErrors.map(e => t(`admin.import.${e}`)).join(', ')}
                                </p>
                              )}
                            </div>
                          ) : row.status === 'duplicate' ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-yellow-600">⚠️ trùng</span>
                              <select
                                value={row.duplicateAction ?? 'skip'}
                                onChange={e => handleDuplicateAction(row.rowIndex - 1, e.target.value as DuplicateAction)}
                                className="text-xs px-1.5 py-1 rounded-lg border border-yellow-300 bg-white font-medium outline-none cursor-pointer"
                              >
                                <option value="skip">Bỏ qua</option>
                                <option value="keep">Giữ đúng</option>
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
          )}

          {/* STEP 3: Importing */}
          {state === 'importing' && (
            <div className="space-y-4 py-8">
              <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
                <p className="text-lg font-bold text-secondary">{t('admin.import.importing')}</p>
                <div className="w-full max-w-md bg-stone-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full primary-gradient transition-all duration-300"
                    style={{ width: progress.total > 0 ? `${(progress.done / progress.total) * 100}%` : '0%' }}
                  />
                </div>
                <p className="text-sm text-on-surface-variant">
                  {t('admin.import.importingProgress', { done: progress.done, total: progress.total })}
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Done */}
          {state === 'done' && result && (
            <div className="space-y-4 py-6">
              <div className="flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-6xl text-green-500">task_alt</span>
                <p className="text-xl font-black text-secondary">
                  {result.inserted > 0
                    ? t('admin.import.importSuccess', { count: result.inserted })
                    : t('admin.import.importFailed')
                  }
                </p>
                {result.errors.length > 0 && (
                  <div className="w-full">
                    <button
                      onClick={() => setShowErrorDetail(d => !d)}
                      className="text-sm font-bold text-red-600 hover:text-red-700"
                    >
                      {showErrorDetail ? t('admin.import.hideErrors') : t('admin.import.viewErrors')} ({result.errors.length})
                    </button>
                    {showErrorDetail && (
                      <div className="mt-2 p-3 bg-red-50 rounded-xl border border-red-200 max-h-48 overflow-y-auto">
                        {result.errors.map((e, i) => (
                          <p key={i} className="text-sm text-red-600 font-medium">
                            • {e.word}: {e.error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error State */}
          {state === 'error' && (
            <div className="space-y-4 py-6">
              <div className="flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-6xl text-red-400">error</span>
                <p className="text-lg font-bold text-red-600">
                  {t(errorMessage) || errorMessage || t('admin.import.importFailed')}
                </p>
                <button
                  onClick={() => { setState('idle'); setErrorMessage('') }}
                  className="px-6 py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-all"
                >
                  {t('admin.import.resetAndTryAgain')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-orange-100 shrink-0 bg-stone-50">
          <button
            onClick={handleClose}
            className="px-6 py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-bold hover:bg-stone-100 transition-all"
          >
            {t('admin.import.cancel')}
          </button>

          {state === 'preview' && (
            <button
              onClick={handleStartImport}
              disabled={!canImport}
              className="flex items-center gap-2 px-6 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">upload</span>
              {t('admin.import.continue')}
            </button>
          )}

          {state === 'done' && (
            <button
              onClick={() => { onImportComplete(); handleClose() }}
              className="px-6 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              {t('admin.import.close')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
