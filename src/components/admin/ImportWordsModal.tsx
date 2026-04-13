import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import type { Topic, NormalizedWord, BatchInsertResult } from '../../lib/types'
import {
  parseFile,
  parseSheetsUrl,
  parseErrorToMessage,
} from '../../lib/import-parser'
import {
  findDuplicateWords,
  batchInsertWords,
  updateWordFromImport,
} from '../../lib/admin-queries'

// ── Props ─────────────────────────────────────────────────
interface Props {
  open: boolean
  onClose: () => void
  onImportComplete: () => void
  topics: Topic[]
}

// ── Import State ──────────────────────────────────────────
type ImportState = 'idle' | 'parsing' | 'preview' | 'importing' | 'done' | 'error'

interface ImportRow extends NormalizedWord {
  rowIndex: number
}

type SourceMode = 'csv' | 'excel' | 'sheets'

// ── Helpers ──────────────────────────────────────────────
function getTopicNameMap(topics: Topic[]): Map<string, Topic> {
  const map = new Map<string, Topic>()
  for (const t of topics) {
    map.set(t.name.toLowerCase(), t)
  }
  return map
}

// CSV Template (12 columns — tiếng Việt để khớp Google Sheets)
const TEMPLATE_CSV = `Word,Phonetic,Từ loại,Độ khó,Definition,Ví dụ (EN),Ví dụ (VI),Ảnh minh họa (URL),Chủ đề,Sai 1,Sai 2,Sai 3
hello,/həˈloʊ/,Danh từ,2,Xin chào,Hello world!,Xin chào thế giới!,,Travel;Greetings,hola,greetings,hi
apple,/ˈæpəl/,Danh từ,1,Quả táo,An apple a day,Ăn táo mỗi ngày,,Food,pear,orange,fruit
technology,/tekˈnɒlədʒi/,Danh từ,3,Công nghệ,Technology changes fast.,Công nghệ thay đổi nhanh.,,Technology,knowledge,innovation,science`

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'vocab-import-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ── Difficulty Dots ───────────────────────────────────────
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

// ── Main Component ────────────────────────────────────────
export default function ImportWordsModal({ open, onClose, onImportComplete, topics }: Props) {
  const { t } = useTranslation()
  const topicMap = getTopicNameMap(topics)

  // State
  const [state, setState] = useState<ImportState>('idle')
  const [sourceMode, setSourceMode] = useState<SourceMode>('csv')
  const [sheetsUrl, setSheetsUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState<BatchInsertResult | null>(null)
  const [showErrorDetail, setShowErrorDetail] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Reset on close ────────────────────────────────────
  const handleClose = useCallback(() => {
    setState('idle')
    setRows([])
    setErrorMessage('')
    setResult(null)
    setSheetsUrl('')
    setUrlError('')
    onClose()
  }, [onClose])

  // ── Parse File ────────────────────────────────────────
  const handleFileSelected = useCallback(async (file: File) => {
    setState('parsing')
    setErrorMessage('')

    try {
      const parsed = await parseFile(file, topicMap)

      // Check duplicates
      const wordTexts = parsed
        .filter(r => r.status !== 'invalid')
        .map(r => r.word)
      const dupes = await findDuplicateWords(wordTexts)
      const dupeSet = new Set(dupes.map(w => w.toLowerCase()))

      const importRows: ImportRow[] = parsed.map((r, idx) => ({
        ...r,
        rowIndex: idx + 1,
        status: dupeSet.has(r.word.toLowerCase()) ? 'duplicate' : r.status,
        duplicateAction: 'keep' as const,
      }))

      setRows(importRows)
      setState('preview')
    } catch (err) {
      const code = err instanceof Error ? err.message : 'PARSE_ERROR'
      setErrorMessage(parseErrorToMessage(code))
      setState('error')
    }
  }, [topicMap])

  // ── Parse Sheets URL ───────────────────────────────────
  const handleSheetsUrl = useCallback(async () => {
    if (!sheetsUrl.trim()) {
      setUrlError(t('admin.import.fileRequired'))
      return
    }

    setUrlError('')
    setState('parsing')
    setErrorMessage('')

    try {
      const parsed = await parseSheetsUrl(sheetsUrl, topicMap)

      const wordTexts = parsed
        .filter(r => r.status !== 'invalid')
        .map(r => r.word)
      const dupes = await findDuplicateWords(wordTexts)
      const dupeSet = new Set(dupes.map(w => w.toLowerCase()))

      const importRows: ImportRow[] = parsed.map((r, idx) => ({
        ...r,
        rowIndex: idx + 1,
        status: dupeSet.has(r.word.toLowerCase()) ? 'duplicate' : r.status,
        duplicateAction: 'keep' as const,
      }))

      setRows(importRows)
      setState('preview')
    } catch (err) {
      const code = err instanceof Error ? err.message : 'PARSE_ERROR'
      setErrorMessage(parseErrorToMessage(code))
      setState('error')
    }
  }, [topicMap, sheetsUrl, t])

  // ── Duplicate action per row ─────────────────────────
  function handleDuplicateAction(rowIndex: number, action: 'keep' | 'update' | 'skip') {
    setRows(prev => prev.map((r, i) =>
      i === rowIndex ? { ...r, duplicateAction: action } : r
    ))
  }

  // ── Bulk duplicate actions ──────────────────────────────
  function handleBulkDuplicateAction(action: 'keep' | 'update' | 'skip') {
    setRows(prev => prev.map(r =>
      r.status === 'duplicate' ? { ...r, duplicateAction: action } : r
    ))
  }

  // ── Start Import ───────────────────────────────────────
  async function handleStartImport() {
    const invalidRows = rows.filter(r => r.status === 'invalid')
    if (invalidRows.length > 0) return // shouldn't happen but safety check

    const toImport = rows.filter(r => {
      if (r.status === 'duplicate' && r.duplicateAction === 'skip') return false
      return true
    })

    setState('importing')
    setProgress({ done: 0, total: toImport.length })

    // Separate: new rows vs update rows
    const newRows = toImport.filter(r =>
      r.status === 'new' || (r.status === 'duplicate' && r.duplicateAction === 'keep')
    )
    const updateRows = toImport.filter(r =>
      r.status === 'duplicate' && r.duplicateAction === 'update'
    )

    let totalInserted = 0
    const allErrors: { word: string; error: string }[] = []

    // Batch insert new rows
    if (newRows.length > 0) {
      const insertResult = await batchInsertWords(newRows)
      totalInserted += insertResult.inserted
      allErrors.push(...insertResult.errors)
    }

    // Update existing rows one by one using supabase from lib
    for (let i = 0; i < updateRows.length; i++) {
      const row = updateRows[i]

      // Look up the existing word ID
      const { data: existing } = await supabase
        .from('words')
        .select('id')
        .ilike('word', row.word)
        .limit(1)
        .single()

      if (existing?.id) {
        const res = await updateWordFromImport(existing.id, row)
        if (res.error) {
          allErrors.push({ word: row.word, error: res.error })
        } else {
          totalInserted++
        }
      } else {
        allErrors.push({ word: row.word, error: 'Word not found in database' })
      }

      setProgress(prev => ({ ...prev, done: i + 1 }))
    }

    setProgress({ done: toImport.length, total: toImport.length })
    setResult({ inserted: totalInserted, errors: allErrors })
    setState('done')
  }

  if (!open) return null

  // ── Stats ─────────────────────────────────────────────
  const stats = {
    valid: rows.filter(r =>
      r.status === 'new' || (r.status === 'duplicate' && r.duplicateAction !== 'skip')
    ).length,
    duplicates: rows.filter(r => r.status === 'duplicate').length,
    errors: rows.filter(r => r.status === 'invalid').length,
  }

  const canImport = stats.valid > 0 && stats.errors === 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-orange-50 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-100 shrink-0">
          <div>
            <h2 className="text-xl font-black text-secondary">{t('admin.import.title')}</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              {state === 'preview'
                ? `${rows.length} ${t('admin.import.rowCount', { count: rows.length })}`
                : state === 'importing'
                ? t('admin.import.importingProgress', { done: progress.done, total: progress.total })
                : state === 'done'
                ? t('admin.import.step4')
                : t('admin.import.step1')
              }
            </p>
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

          {/* STEP 1: Source Selection */}
          {state === 'idle' && (
            <div className="space-y-6">
              {/* Source Tabs */}
              <div className="flex gap-2">
                {(['csv', 'excel', 'sheets'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSourceMode(mode)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
                      sourceMode === mode
                        ? 'primary-gradient text-white shadow-lg'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {mode === 'csv' ? 'description' : mode === 'excel' ? 'table_chart' : 'link'}
                    </span>
                    {t(`admin.import.${mode}`)}
                  </button>
                ))}
              </div>

              <div className="border-t border-orange-100 pt-4">

                {/* CSV / Excel: File Upload */}
                {(sourceMode === 'csv' || sourceMode === 'excel') && (
                  <div className="space-y-4">
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
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleFileSelected(file)
                      }}
                    />
                  </div>
                )}

                {/* Google Sheets URL */}
                {sourceMode === 'sheets' && (
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
                )}
              </div>

              {/* Template Download */}
              <div className="pt-2">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 text-sm font-bold text-primary hover:text-orange-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                  {t('admin.import.downloadTemplate')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Preview Table */}
          {state === 'preview' && (
            <div className="space-y-4">
              {/* Stats bar */}
              <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm font-bold text-secondary">
                    {stats.valid} {t('admin.import.validWords')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-sm font-bold text-secondary">
                    {stats.duplicates} {t('admin.import.duplicates')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-sm font-bold text-secondary">
                    {stats.errors} {t('admin.import.errors')}
                  </span>
                </div>

                {/* Bulk duplicate actions */}
                {stats.duplicates > 0 && (
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => handleBulkDuplicateAction('keep')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-700 font-bold hover:bg-yellow-200 transition-colors"
                    >
                      {t('admin.import.keepAll')}
                    </button>
                    <button
                      onClick={() => handleBulkDuplicateAction('update')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-bold hover:bg-blue-200 transition-colors"
                    >
                      {t('admin.import.updateAll')}
                    </button>
                    <button
                      onClick={() => handleBulkDuplicateAction('skip')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 transition-colors"
                    >
                      {t('admin.import.skipAll')}
                    </button>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="border border-stone-200 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-black text-stone-500 uppercase">#</th>
                      <th className="px-3 py-3 text-left text-xs font-black text-stone-500 uppercase">Word</th>
                      <th className="px-3 py-3 text-left text-xs font-black text-stone-500 uppercase">Type</th>
                      <th className="px-3 py-3 text-left text-xs font-black text-stone-500 uppercase">Topics</th>
                      <th className="px-3 py-3 text-left text-xs font-black text-stone-500 uppercase">Diff</th>
                      <th className="px-3 py-3 text-left text-xs font-black text-stone-500 uppercase">Definition</th>
                      <th className="px-3 py-3 text-left text-xs font-black text-stone-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx} className="border-t border-stone-100 hover:bg-orange-50/30 transition-colors">
                        <td className="px-3 py-3 text-xs text-stone-400">{row.rowIndex}</td>
                        <td className="px-3 py-3">
                          <div>
                            <p className="font-bold text-secondary text-sm">{row.word}</p>
                            {row.phonetic && <p className="text-xs text-stone-400">{row.phonetic}</p>}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-lg">
                            {row.pos?.toUpperCase() ?? 'N'}
                          </span>
                        </td>
                        <td className="px-3 py-3 min-w-[140px]">
                          <div className="flex flex-wrap gap-1">
                            {row.topicIds.map(tid => {
                              const topic = topics.find(t => t.id === tid)
                              return topic ? (
                                <span
                                  key={tid}
                                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: (topic.color ?? '#f97316') + '20', color: topic.color ?? '#f97316' }}
                                >
                                  {topic.name}
                                </span>
                              ) : null
                            })}
                            {row.unmatchedTopics?.map(un => (
                              <span key={un} className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                                ⚠️ {un}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <DifficultyDots value={row.difficulty} />
                        </td>
                        <td className="px-3 py-3 max-w-[200px]">
                          <p className="text-sm text-on-surface-variant truncate" title={row.definition}>
                            {row.definition}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          {row.status === 'new' && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              OK
                            </span>
                          )}
                          {row.status === 'duplicate' && (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-lg">
                                ⚠️ trùng lặp
                              </span>
                              <select
                                value={row.duplicateAction}
                                onChange={e => handleDuplicateAction(idx, e.target.value as 'keep' | 'update' | 'skip')}
                                className="text-xs px-2 py-1 rounded-lg border border-yellow-300 bg-white font-medium outline-none cursor-pointer"
                              >
                                <option value="keep">{t('admin.import.keepExisting')}</option>
                                <option value="update">{t('admin.import.updateExisting')}</option>
                                <option value="skip">{t('admin.import.skipWord')}</option>
                              </select>
                            </div>
                          )}
                          {row.status === 'invalid' && (
                            <div>
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                                ❌ {t('admin.import.errors')}
                              </span>
                              <p className="text-xs text-red-500 mt-1">
                                {row.validationErrors?.map(e => t(`admin.import.${e}`)).join(', ')}
                              </p>
                            </div>
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