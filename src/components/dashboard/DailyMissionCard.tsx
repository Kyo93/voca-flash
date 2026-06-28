import { useTranslation } from 'react-i18next'

interface DailyMissionCardProps {
  count: number
  target: number
}

export default function DailyMissionCard({ count, target }: DailyMissionCardProps) {
  const { t } = useTranslation()
  const progressPct = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0

  return (
    <div className="col-span-6 bg-white p-8 rounded-4xl sun-drenched-shadow flex flex-col justify-between group hover:bg-surface-container-lowest transition-all duration-500">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-primary text-lg">target</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-300 block">{t('home.dailyMission')}</span>
      </div>

      <div className="text-3xl font-semibold text-secondary tracking-tight mb-2">
        {count} <span className="text-stone-300 font-medium text-xl">/ {target}</span>
      </div>

      <div className="h-2 w-full bg-stone-50 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-linear-to-r from-primary to-orange-400 rounded-full transition-all duration-1000"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <p className="text-[10px] font-medium text-stone-400">{t('home.learnedToday', { count })}</p>
    </div>
  )
}
