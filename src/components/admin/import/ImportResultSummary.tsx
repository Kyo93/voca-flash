import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BatchInsertResult } from '../../../lib/types'

interface ImportResultSummaryProps {
  result: BatchInsertResult
}

export function ImportResultSummary({ result }: ImportResultSummaryProps) {
  const { t } = useTranslation()
  const [showErrorDetail, setShowErrorDetail] = useState(false)

  return (
    <div className="space-y-4 py-6">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined text-6xl text-green-500">task_alt</span>
        <p className="text-xl font-black text-secondary">
          {result.inserted > 0
            ? t('admin.import.importSuccess', { count: result.inserted })
            : t('admin.import.importFailed')
          }
        </p>
        
        {result.submitted > 0 && result.inserted !== result.submitted && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
            <span className="material-symbols-outlined text-red-500 text-lg">warning</span>
            <p className="text-sm font-bold text-red-600">
              {t('admin.import.criticalError', { submitted: result.submitted, inserted: result.inserted })}
            </p>
          </div>
        )}

        {result.errors.length > 0 && (
          <div className="w-full">
            <button
              onClick={() => setShowErrorDetail(d => !d)}
              className="text-sm font-bold text-red-600 hover:text-red-700"
            >
              {showErrorDetail ? t('admin.import.hideErrors') : t('admin.import.viewErrors')} ({result.errors.length})
            </button>
            {showErrorDetail && (
              <div className="mt-2 p-3 bg-red-50 rounded-xl border border-red-200 max-h-48 overflow-y-auto w-full">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-sm text-red-600 font-medium whitespace-normal wrap-break-word">
                    • {e.word}: {e.error}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
