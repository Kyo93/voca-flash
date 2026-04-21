import { useTranslation } from 'react-i18next'

interface MasteryStatsGridProps {
  stats: any
}

export default function MasteryStatsGrid({ stats }: MasteryStatsGridProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
      {stats ? [
        { label: t('mastery.stats.learning'), value: stats.learning, icon: 'school', color: 'text-primary', bg: 'bg-primary/10' },
        { label: t('mastery.stats.total'), value: stats.total, icon: 'book', color: 'text-on-surface-variant', bg: 'bg-surface-container-highest' },
        { label: t('mastery.stats.mastered'), value: stats.mastered, icon: 'verified', color: 'text-secondary', bg: 'bg-secondary/10' },
        { label: t('mastery.stats.due'), value: stats.due, icon: 'schedule', color: 'text-primary', bg: 'bg-primary/10' },
        { label: t('mastery.stats.orphaned'), value: stats.orphaned, icon: 'broken_image', color: 'text-red-500', bg: 'bg-red-50' },
        { label: t('mastery.stats.weak'), value: stats.weak, icon: 'trending_down', color: 'text-red-400', bg: 'bg-red-50' }
      ].map(s => (
        <div key={s.label} className="p-5 bg-surface rounded-2xl sun-drenched-shadow flex items-center gap-4 group hover:scale-[1.02] transition-all">
          <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center shrink-0`}>
            <span className="material-symbols-outlined font-variation-fill text-2xl">{s.icon}</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface leading-none">{s.value}</p>
            <p className="text-[10px] font-normal text-on-surface-variant/60 uppercase tracking-widest mt-1.5">{s.label}</p>
          </div>
        </div>
      )) : (
        Array(6).fill(0).map((_, i) => (
          <div key={i} className="h-24 bg-surface-container-low animate-pulse rounded-2xl w-full" />
        ))
      )}
    </div>
  )
}
