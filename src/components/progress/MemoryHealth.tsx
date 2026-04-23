import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

interface Props {
  retention: number
  accuracy: number
}

export default function MemoryHealth({ retention, accuracy }: Props) {
  const { t } = useTranslation()

  return (
    <div className={`bg-white p-4 rounded-[20px] border border-stone-50 flex flex-col`}>
      <h3 className="text-[10px] font-black text-stone-400 tracking-[0.2em] uppercase mb-2">{t('progress.memory_health')}</h3>

      <div className="flex-1 space-y-3">
        <div>
          <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">
            {t('progress.retention_rate')}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-medium text-secondary tracking-tighter">
              {retention}
            </span>
            <span className="text-xl font-medium text-stone-300">%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-tight">
              {t('progress.avg_accuracy')}
            </span>
            <span className="text-sm font-bold text-primary">
              {accuracy}%
            </span>
          </div>
          <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${accuracy}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-primary"
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-secondary text-[10px] font-black uppercase tracking-wider">
          <span className="material-symbols-outlined text-[12px]">verified</span>
          {t('progress.status_excellent')}
        </div>
      </div>
    </div>
  )
}
