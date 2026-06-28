import { useTranslation } from 'react-i18next'

interface ImportProgressIndicatorProps {
  done: number
  total: number
}

export function ImportProgressIndicator({ done, total }: ImportProgressIndicatorProps) {
  const { t } = useTranslation()
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="space-y-4 py-8">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
        <p className="text-lg font-medium text-secondary">{t('admin.import.importing')}</p>
        <div className="w-full max-w-md bg-stone-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full primary-gradient transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-sm text-on-surface-variant">
          {t('admin.import.importingProgress', { done, total })}
        </p>
      </div>
    </div>
  )
}
