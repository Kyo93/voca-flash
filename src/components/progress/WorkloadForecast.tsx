import { useTranslation } from 'react-i18next'
import { DESIGN_TOKENS } from '../../lib/tokens'

interface WorkloadForecastProps {
  forecast: number[]
}

export default function WorkloadForecast({ forecast }: WorkloadForecastProps) {
  const { t } = useTranslation()
  const data = forecast.slice(0, 7)
  const max = Math.max(...data, 1)

  return (
    <div className={`bg-white p-10 ${DESIGN_TOKENS.RADIUS['4XL']} border border-stone-100 ${DESIGN_TOKENS.SHADOW.SM}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">event_repeat</span>
          <h3 className="text-sm font-black text-secondary tracking-tight uppercase">{t('home.forecast')} (7 ngày)</h3>
        </div>
      </div>
      
      <div className="h-48 flex items-end gap-4 px-2">
        {data.map((count, i) => {
          const height = Math.max(10, (count / max) * 100)
          const isToday = i === 0
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
              <div className="relative w-full flex flex-col items-center">
                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10">
                  {count} từ
                </div>
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 ${
                    isToday
                      ? 'bg-orange-500 shadow-[0_4px_12px_rgba(249,115,22,0.3)]'
                      : 'bg-blue-500/10 group-hover:bg-blue-500/20'
                  }`}
                  style={{
                    height: `${height}%`,
                    transitionDelay: `${i * 100}ms`
                  }}
                />
              </div>
              <div className="text-center">
                <p className={`text-[9px] font-black uppercase tracking-tighter ${isToday ? 'text-primary' : 'text-stone-300'}`}>
                  {isToday ? 'H.Nay' : `Ngày ${i + 1}`}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
