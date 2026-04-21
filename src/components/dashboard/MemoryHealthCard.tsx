import { useTranslation } from 'react-i18next'
import { DESIGN_TOKENS } from '../../lib/tokens'

interface MemoryHealthCardProps {
  retentionRate: number
  avgStability: number
}

export default function MemoryHealthCard({ retentionRate, avgStability }: MemoryHealthCardProps) {
  const { t } = useTranslation()
  const strokeDashoffset = 276 - (276 * retentionRate)

  return (
    <div className={`col-span-5 bg-white p-8 ${DESIGN_TOKENS.RADIUS['4XL']} border border-stone-100 ${DESIGN_TOKENS.SHADOW.SM} flex flex-col justify-between hover:${DESIGN_TOKENS.SHADOW.MD} transition-all`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-sm">psychology</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 block">{t('home.memoryHealth')}</span>
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
            <span className="text-xl font-black text-secondary">{Math.round(retentionRate * 100)}%</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-3">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">{t('home.retention')}</p>
            <p className="text-sm font-bold text-secondary mt-0.5">Xuất sắc</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">{t('home.avgStability')}</p>
            <p className="text-sm font-bold text-primary mt-0.5">{avgStability.toFixed(1)} ngày</p>
          </div>
        </div>
      </div>
    </div>
  )
}
