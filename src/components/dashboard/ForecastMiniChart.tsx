import { useTranslation } from 'react-i18next'
import { addDays, format } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'

interface ForecastMiniChartProps {
  forecast: number[]
}

export default function ForecastMiniChart({ forecast }: ForecastMiniChartProps) {
  const { t, i18n } = useTranslation()
  const currentLocale = i18n.language === 'vi' ? vi : enUS
  
  // Take 5 days of forecast
  const data = (forecast || []).slice(0, 5)
  // Fill with 0 if forecast is shorter than 5
  while (data.length < 5) data.push(0)
  
  const max = Math.max(...data, 1)

  return (
    <div className="col-span-3 bg-secondary p-8 rounded-4xl flex flex-col text-white sun-drenched-shadow relative overflow-hidden group hover:bg-secondary-stable transition-all duration-500">
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white/60 text-lg">event_repeat</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block">{t('home.forecast')}</span>
          </div>
          <span className="text-[11px] font-black text-white/60">
            {forecast.reduce((a, b) => a + b, 0)}
          </span>
        </div>
        
        <div className="flex-1 flex items-end gap-2 px-1 min-h-[100px]">
          {data.map((count, i) => {
            const height = Math.max(15, (count / max) * 100)
            const date = addDays(new Date(), i)
            const dayLabel = i === 0 
              ? (i18n.language === 'vi' ? 'H.Nay' : 'Today') 
              : format(date, 'eee', { locale: currentLocale }).toUpperCase()

            return (
              <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
                <div className="relative w-full flex-1 flex flex-col items-center justify-end group/bar">
                  {count > 0 && (
                    <span className="absolute -top-5 text-[8px] font-bold text-white/50 opacity-100 group-hover/bar:text-white transition-all">
                      {count}
                    </span>
                  )}
                  <div 
                    className={`w-full ${count > 0 ? 'bg-white/40' : 'bg-white/10 border border-dashed border-white/5'} rounded-t-lg group-hover:bg-primary transition-all duration-500`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[8px] font-bold text-white/30 whitespace-nowrap">{dayLabel}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
