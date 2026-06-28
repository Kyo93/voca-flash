import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

interface RoadmapForecastProps {
  velocity: {
    avg_new_per_day: number
    avg_reviews_per_day: number
  }
  totalWords: number
  masteredWords: number
}

export default function RoadmapForecast({ velocity, totalWords, masteredWords }: RoadmapForecastProps) {
  const { t, i18n } = useTranslation()

  const progressPct = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0

  const remainingWords = Math.max(0, totalWords - masteredWords)
  const daysToFinish = velocity.avg_new_per_day > 0
    ? Math.ceil(remainingWords / velocity.avg_new_per_day)
    : null

  const finishDate = daysToFinish
    ? new Date(Date.now() + daysToFinish * 24 * 60 * 60 * 1000)
    : null

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const barHeights = [20, 35, 40, 60, 80, 100]
  const barLabels = ['T1', 'T2', 'T3', 'T4', 'T5', '']

  return (
    <div className="bg-surface-container-lowest rounded-xl p-7 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-surface-variant to-transparent rounded-bl-full opacity-50 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between items-end mb-7">
          <div>
            <h3 className="text-xl font-medium text-on-surface mb-2">
              {t('progress.roadmap_forecast', { defaultValue: 'Roadmap Forecast' })}
            </h3>
            <p className="text-on-surface-variant text-sm">
              {t('progress.estimated_next_level')}{' '}
              <span className="font-medium text-primary">
                {finishDate ? formatMonthYear(finishDate) : t('progress.insufficient_data')}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-semibold text-secondary">{progressPct}%</p>
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-widest mt-1">
              {t('progress.total_progress')}
            </p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-48 w-full mt-4 relative flex items-end justify-between gap-2">
          {barHeights.map((h, i) => {
            const isLast = i === barHeights.length - 1
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                className={`w-full rounded-t-lg relative group transition-colors ${
                  isLast
                    ? 'bg-linear-to-t from-primary-container to-primary shadow-[0_0_20px_rgba(230,126,34,0.3)]'
                    : i >= 3
                      ? 'bg-secondary hover:opacity-90'
                      : 'bg-surface-container-high hover:bg-surface-variant'
                }`}
                style={i >= 3 && !isLast ? { opacity: i === 3 ? 0.6 : 0.85 } : undefined}
              >
                <div className={`absolute -top-7 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded font-medium ${
                  isLast
                    ? 'bg-on-surface text-surface opacity-100'
                    : 'bg-on-surface text-surface opacity-0 group-hover:opacity-100'
                }`}>
                  {isLast ? t('progress.current_label') : barLabels[i]}
                </div>
              </motion.div>
            )
          })}

          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 5,80 Q 20,70 35,65 T 65,40 T 95,5" fill="none" stroke="rgba(230,126,34,0.5)" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>
      </div>
    </div>
  )
}
