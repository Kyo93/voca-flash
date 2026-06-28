import { useTranslation } from 'react-i18next'
import { getRetentionLabel } from '../../lib/progress-utils'

interface MemoryHealthCardProps {
  retentionRate: number
  avgStability: number
}

const labelKeys: Record<ReturnType<typeof getRetentionLabel>, string> = {
  excellent: 'common.excellent',
  good: 'common.good',
  needs_work: 'common.needs_work',
  no_data: 'common.no_data',
}

export default function MemoryHealthCard({ retentionRate, avgStability }: MemoryHealthCardProps) {
  const { t } = useTranslation()
  const label = getRetentionLabel(retentionRate)
  const hasData = label !== 'no_data'
  const displayRate = hasData ? retentionRate : 0
  const strokeDashoffset = 276 - (276 * displayRate)

  return (
    <div className="col-span-3 bg-white p-8 rounded-4xl sun-drenched-shadow flex flex-col justify-between group hover:bg-surface-container-lowest transition-all duration-500">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-primary text-lg">psychology</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-300 block">{t('home.memoryHealth')}</span>
      </div>

      <div className="flex gap-6 items-center">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" className="stroke-stone-50" strokeWidth="12" fill="none" />
            <circle
              cx="50" cy="50" r="44"
              className="stroke-primary"
              strokeWidth="12"
              fill="none"
              strokeDasharray="276"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold text-secondary">{hasData ? `${Math.round(retentionRate * 100)}%` : '—'}</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-3">
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-tighter">{t('home.retention')}</p>
            <p className="text-sm font-medium text-secondary mt-0.5">{t(labelKeys[label])}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-tighter">{t('home.avgStability')}</p>
            <p className="text-sm font-medium text-primary mt-0.5">{avgStability.toFixed(1)} {t('common.days')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
