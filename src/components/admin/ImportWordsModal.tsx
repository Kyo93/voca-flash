import { useTranslation } from 'react-i18next'
import type { Topic } from '../../lib/types'
import ImportPreviewTable from './ImportPreviewTable'
import { ImportDropZone } from './import/ImportDropZone'
import { ImportProgressIndicator } from './import/ImportProgressIndicator'
import { ImportResultSummary } from './import/ImportResultSummary'
import { useImportFlow } from '../../hooks/admin/useImportFlow'

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

export default function ImportWordsModal({ open, onClose, onImportComplete, topics, roadmapId, roadmapName, roadmapSlug }: Props) {
  const { t } = useTranslation()
  const flow = useImportFlow({ topics, roadmapId, roadmapSlug })

  const handleClose = () => {
    flow.reset()
    onClose()
  }

  if (!open) return null

  const { state, rows, progress, result } = flow

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
              onFileSelected={flow.handleFileSelected}
              sheetsUrl={flow.sheetsUrl}
              setSheetsUrl={flow.setSheetsUrl}
              urlError={flow.urlError}
              onSheetsUrlSubmit={flow.handleSheetsUrl}
            />
          )}

          {state === 'preview' && (
            <ImportPreviewTable
              rows={rows}
              topics={topics}
              stats={stats}
              onRowDuplicateAction={flow.handleDuplicateAction}
              onBulkDuplicateAction={flow.handleBulkDuplicateAction}
            />
          )}

          {state === 'importing' && <ImportProgressIndicator done={progress.done} total={progress.total} />}
          {state === 'done' && result && <ImportResultSummary result={result} />}

          {state === 'error' && (
            <div className="space-y-4 py-6">
              <div className="flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-6xl text-red-400">error</span>
                <p className="text-lg font-bold text-red-600">{t(flow.errorMessage) || flow.errorMessage || t('admin.import.importFailed')}</p>
                <button onClick={flow.clearError} className="px-6 py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-all">
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
              onClick={flow.handleStartImport}
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
