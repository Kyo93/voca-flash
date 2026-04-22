import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { Topic, BatchInsertResult } from '../../lib/types'
import { parseFile, parseSheetsUrl, parseErrorToMessage } from '../../lib/import-parser'
import { batchInsertWords } from '../../lib/queries/word-queries'
import ImportPreviewTable, { ImportRow, DuplicateAction } from './ImportPreviewTable'
import { processImportData } from '../../lib/import-logic'
import { ImportDropZone } from './import/ImportDropZone'
import { ImportProgressIndicator } from './import/ImportProgressIndicator'
import { ImportResultSummary } from './import/ImportResultSummary'

// ── Props ─────────────────────────────────────────────────
interface Props {
  open: boolean
  onClose: () => void
  onImportComplete: () => void
  topics: Topic[]
  roadmapId: string
  roadmapName: string
  roadmapSlug?: string
}

// ── Helpers ──────────────────────────────────────────────
function getTopicNameMap(topics: Topic[]): Map<string, Topic> {
  const map = new Map<string, Topic>()
  for (const t of topics) {
    map.set(t.name.toLowerCase(), t)
  }
  return map
}

type ImportState = 'idle' | 'parsing' | 'preview' | 'importing' | 'done' | 'error'

export default function ImportWordsModal({ open, onClose, onImportComplete, topics, roadmapId, roadmapName, roadmapSlug }: Props) {
  const { t } = useTranslation()
  const filteredTopics = topics.filter(t => t.roadmap_id === roadmapId)

  const [state, setState] = useState<ImportState>('idle')
  const [sheetsUrl, setSheetsUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState<BatchInsertResult | null>(null)

  const handleClose = useCallback(() => {
    setState('idle')
    setRows([])
    setErrorMessage('')
    setResult(null)
    setSheetsUrl('')
    setUrlError('')
    onClose()
  }, [onClose])

  const handleParse = useCallback(async (parsed: { rows: any[]; unmatchedTopics: string[] }) => {
    try {
      const topicMap = getTopicNameMap(filteredTopics)
      const { importRows } = await processImportData(parsed, roadmapId, roadmapSlug, topicMap)
      setRows(importRows)
      setState('preview')
    } catch (err) {
      setErrorMessage(t('admin.import.postParseError'))
      setState('error')
    }
  }, [filteredTopics, roadmapId, roadmapSlug])

  const handleFileSelected = useCallback(async (file: File) => {
    setState('parsing')
    setErrorMessage('')
    try {
      const topicMap = getTopicNameMap(filteredTopics)
      const parsed = await parseFile(file, topicMap)
      await handleParse(parsed)
    } catch (err) {
      const code = err instanceof Error ? err.message : 'PARSE_ERROR'
      setErrorMessage(parseErrorToMessage(code))
      setState('error')
    }
  }, [filteredTopics, handleParse])

  const handleSheetsUrl = useCallback(async () => {
    if (!sheetsUrl.trim()) {
      setUrlError(t('admin.import.fileRequired'))
      return
    }
    setUrlError('')
    setState('parsing')
    setErrorMessage('')
    try {
      const topicMap = getTopicNameMap(filteredTopics)
      const parsed = await parseSheetsUrl(sheetsUrl, topicMap)
      await handleParse(parsed)
    } catch (err) {
      const code = err instanceof Error ? err.message : 'PARSE_ERROR'
      setErrorMessage(parseErrorToMessage(code))
      setState('error')
    }
  }, [filteredTopics, sheetsUrl, t, handleParse])

  function handleDuplicateAction(rowIndex: number, action: DuplicateAction) {
    setRows(prev => prev.map((r, i) => i === rowIndex ? { ...r, duplicateAction: action } : r))
  }

  function handleBulkDuplicateAction(action: DuplicateAction) {
    setRows(prev => prev.map(r => r.status === 'duplicate' ? { ...r, duplicateAction: action } : r))
  }

  async function handleStartImport() {
    const validRows = rows.filter(r => r.status !== 'invalid')
    const toImport = validRows.filter(r => !(r.status === 'duplicate' && r.duplicateAction === 'skip'))
    if (toImport.length === 0) return

    setState('importing')
    setProgress({ done: 0, total: toImport.length })
    const insertResult = await batchInsertWords(toImport)
    setProgress({ done: toImport.length, total: toImport.length })
    setResult(insertResult)
    setState('done')
  }

  if (!open) return null

  const stats = {
    ok: rows.filter(r => r.status === 'new').length,
    duplicates: rows.filter(r => r.status === 'duplicate').length,
    errors: rows.filter(r => r.status === 'invalid').length,
    willImport: rows.filter(r => r.status !== 'invalid' && !(r.status === 'duplicate' && r.duplicateAction === 'skip')).length,
  }

  const stepLabel = {
    idle: t('admin.import.step1'),
    parsing: t('admin.import.parsing'),
    preview: `${rows.length} ${t('admin.import.rowCount', { count: rows.length })}`,
    importing: t('admin.import.importingProgress', { done: progress.done, total: progress.total }),
    done: t('admin.import.step4'),
    error: t('admin.import.step3'),
  }[state]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl border border-orange-50 w-full max-w-[1400px] max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-orange-100 shrink-0">
          <div>
            <h2 className="text-xl font-black text-secondary">{t('admin.import.title')}</h2>
            <p className="text-sm text-on-surface-variant mt-1">{stepLabel}</p>
            {roadmapId && <p className="text-xs font-bold text-primary mt-1">📍 {t('admin.import.importingInto', { name: roadmapName })}</p>}
          </div>
          <button onClick={handleClose} className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-stone-500">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!roadmapId && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <span className="material-symbols-outlined text-6xl text-stone-300">folder_off</span>
              <div>
                <p className="text-lg font-black text-secondary">{t('admin.import.needRoadmap')}</p>
                <p className="text-sm text-on-surface-variant mt-1">{t('admin.import.needRoadmapDesc')}</p>
              </div>
              <a href="/admin/roadmaps" className="px-6 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all">{t('admin.import.goToRoadmaps')}</a>
            </div>
          )}

          {state === 'idle' && roadmapId && (
            <ImportDropZone
              onFileSelected={handleFileSelected}
              sheetsUrl={sheetsUrl}
              setSheetsUrl={setSheetsUrl}
              urlError={urlError}
              onSheetsUrlSubmit={handleSheetsUrl}
            />
          )}

          {state === 'preview' && (
            <ImportPreviewTable
              rows={rows}
              topics={topics}
              stats={stats}
              onRowDuplicateAction={handleDuplicateAction}
              onBulkDuplicateAction={handleBulkDuplicateAction}
            />
          )}

          {state === 'importing' && <ImportProgressIndicator done={progress.done} total={progress.total} />}
          {state === 'done' && result && <ImportResultSummary result={result} />}

          {state === 'error' && (
            <div className="space-y-4 py-6">
              <div className="flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-6xl text-red-400">error</span>
                <p className="text-lg font-bold text-red-600">{t(errorMessage) || errorMessage || t('admin.import.importFailed')}</p>
                <button onClick={() => { setState('idle'); setErrorMessage('') }} className="px-6 py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-all">
                  {t('admin.import.resetAndTryAgain')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-orange-100 shrink-0 bg-stone-50">
          <button onClick={handleClose} className="px-6 py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-bold hover:bg-stone-100 transition-all">
            {t('admin.import.cancel')}
          </button>

          {state === 'preview' && (
            <button
              onClick={handleStartImport}
              disabled={stats.willImport === 0 || stats.errors > 0}
              className="flex items-center gap-2 px-6 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">upload</span>
              {t('admin.import.continue')}
            </button>
          )}

          {state === 'done' && (
            <button onClick={() => { onImportComplete(); handleClose() }} className="px-6 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all">
              {t('admin.import.close')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
