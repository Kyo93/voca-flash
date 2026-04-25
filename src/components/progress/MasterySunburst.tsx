import { useTranslation } from 'react-i18next'

interface TopicStat {
  topic: string
  states: {
    new?: number
    learning?: number
    review?: number
    relearning?: number
  }
}

interface MasterySunburstProps {
  topicStats: TopicStat[]
}

export default function MasterySunburst({ topicStats }: MasterySunburstProps) {
  const { t } = useTranslation()

  const totals = { new: 0, learning: 0, review: 0, relearning: 0 }
  topicStats?.forEach(s => {
    totals.new += s.states.new || 0
    totals.learning += s.states.learning || 0
    totals.review += s.states.review || 0
    totals.relearning += s.states.relearning || 0
  })
  const total = totals.new + totals.learning + totals.review + totals.relearning
  const academic = totals.review + totals.learning
  const practical = totals.new + totals.relearning

  const circumference = 2 * Math.PI * 44

  const academicRatio = total > 0 ? academic / total : 0.5
  const practicalRatio = total > 0 ? practical / total : 0.5

  const academicDash = circumference * academicRatio
  const practicalDash = circumference * practicalRatio

  const qualityLabel = (() => {
    if (total === 0) return '—'
    const masteryRatio = totals.review / total
    if (masteryRatio > 0.7) return t('progress.knowledge_excellent')
    if (masteryRatio > 0.4) return t('progress.knowledge_good')
    return t('progress.knowledge_developing')
  })()

  if (total === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-7 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)] flex flex-col items-center justify-center min-h-[260px]">
        <h3 className="text-lg font-bold text-on-surface mb-4 self-start">
          {t('progress.knowledge_structure')}
        </h3>
        <span className="material-symbols-outlined text-3xl text-stone-200 mb-2">school</span>
        <p className="text-xs text-stone-300 italic">{t('progress.noWeakWords')}</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-7 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)] flex flex-col items-center justify-center relative">
      <h3 className="text-lg font-bold text-on-surface absolute top-7 left-7">
        {t('progress.knowledge_structure')}
      </h3>

      {/* Donut Chart */}
      <div className="relative w-44 h-44 mt-10 flex items-center justify-center">
        <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Practical (secondary-container) */}
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="var(--color-secondary-container)"
            strokeWidth="12"
            strokeDasharray={`${practicalDash} ${circumference}`}
            strokeDashoffset="0"
            className="transition-all duration-700"
          />
          {/* Academic (primary) */}
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="12"
            strokeDasharray={`${academicDash} ${circumference}`}
            strokeDashoffset={`${-practicalDash}`}
            className="transition-all duration-700"
          />
        </svg>
        <div className="text-center z-10">
          <p className="text-3xl font-bold text-on-surface">{qualityLabel}</p>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">
            {t('progress.diversity')}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-5 w-full">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-container" />
          <span className="text-sm font-medium text-on-surface-variant">
            {t('progress.academic')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary-container" />
          <span className="text-sm font-medium text-on-surface-variant">
            {t('progress.practical')}
          </span>
        </div>
      </div>
    </div>
  )
}
