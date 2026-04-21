import { useTranslation } from 'react-i18next'
import { DESIGN_TOKENS } from '../../lib/tokens'

interface DailyMissionCardProps {
  count: number
  target: number
}

export default function DailyMissionCard({ count, target }: DailyMissionCardProps) {
  const { t } = useTranslation()
  const progressPct = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0

  return (
    <div className={`col-span-4 bg-white p-8 ${DESIGN_TOKENS.RADIUS['4XL']} border border-stone-100 ${DESIGN_TOKENS.SHADOW.SM} flex flex-col justify-between hover:${DESIGN_TOKENS.SHADOW.MD} transition-all`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-orange-400 text-sm">target</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 block">{t('home.dailyMission')}</span>
      </div>

      <div className="text-3xl font-black text-secondary tracking-tight mb-2">
        {count} <span className="text-stone-300 font-medium text-xl">/ {target}</span>
      </div>
      
      <div className="h-2 w-full bg-stone-50 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-linear-to-r from-primary to-orange-400 rounded-full transition-all duration-1000" 
          style={{ width: `${progressPct}%` }} 
        />
      </div>
      
      <p className="text-[10px] font-bold text-stone-400">Đã học {count} từ mới</p>
    </div>
  )
}
