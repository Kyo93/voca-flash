import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { format, parseISO, subDays, eachDayOfInterval, isSameDay } from 'date-fns'

interface HabitHeatmapProps {
  data: { date: string; count: number }[]
  streak: number
}

export default function HabitHeatmap({ data, streak }: HabitHeatmapProps) {
  const { t } = useTranslation()
  
  // Generate last 6 months of days
  const endDate = new Date()
  const startDate = subDays(endDate, 180)
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-surface-container'
    if (count < 10) return 'bg-secondary-container'
    if (count < 30) return 'bg-mastery-accent/60'
    if (count < 50) return 'bg-secondary/70'
    return 'bg-secondary'
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-1.5 justify-start">
        {days.map((day, idx) => {
          const dayData = data.find(d => isSameDay(parseISO(d.date), day))
          const count = dayData?.count || 0
          
          return (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.001 }}
              className={`w-3 h-3 rounded-[3px] ${getIntensity(count)} cursor-pointer relative group`}
            >
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-secondary text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
                {format(day, 'MMM dd')}: {count} {t('common.words')}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-stone-50 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">local_fire_department</span>
            <span className="text-2xl font-medium text-secondary">{streak}</span>
            <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">{t('progress.day_streak')}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-[8px] font-black text-stone-400 uppercase tracking-tighter">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-[2px] bg-surface-container" />
            <div className="w-2 h-2 rounded-[2px] bg-secondary-container" />
            <div className="w-2 h-2 rounded-[2px] bg-mastery-accent/60" />
            <div className="w-2 h-2 rounded-[2px] bg-secondary/70" />
            <div className="w-2 h-2 rounded-[2px] bg-secondary" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
