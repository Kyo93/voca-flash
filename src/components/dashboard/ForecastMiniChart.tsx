import { useTranslation } from 'react-i18next'

interface ForecastMiniChartProps {
  forecast: number[]
}

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6']

export default function ForecastMiniChart({ forecast }: ForecastMiniChartProps) {
  const { t } = useTranslation()
  const data = forecast.slice(0, 5)
  const max = Math.max(...data, 1)

  return (
    <div className={`col-span-3 bg-secondary p-8 rounded-4xl flex flex-col text-white sun-drenched-shadow relative overflow-hidden group hover:bg-[#6D7D51] transition-all duration-500`}>
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-white/60 text-lg">event_repeat</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block">{t('home.forecast')}</span>
        </div>
        
        <div className="flex-1 flex items-end gap-2 px-1">
          {data.map((count, i) => {
            const height = Math.max(15, (count / max) * 100)
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-white/10 rounded-t-lg group-hover:bg-primary/40 transition-all duration-500"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[8px] font-bold text-white/30">{DAYS[i]}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
