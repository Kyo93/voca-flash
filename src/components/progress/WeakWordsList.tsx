import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

interface Props {
  words: { id: string; word: string; meaning: string; fail_count: number }[]
}

export default function WeakWordsList({ words }: Props) {
  const { t } = useTranslation()

  const displayWords = words?.slice(0, 3) || []
  const maxFails = displayWords.length > 0 ? Math.max(...displayWords.map(w => w.fail_count), 1) : 1

  return (
    <div className="bg-surface-container rounded-xl p-7 shadow-[0_4px_24px_-4px_rgba(29,27,22,0.03)] border-l-4 border-error-container hover:bg-surface-container-highest transition-colors">
      <h3 className="text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
        <span className="material-symbols-outlined text-error text-xl">warning</span>
        {t('progress.weak_clusters', { defaultValue: 'Vùng kiến thức yếu' })}
      </h3>

      {displayWords.length === 0 ? (
        <div className="py-6 text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-2xl text-stone-200 mb-2">thumb_up</span>
          <p className="text-xs text-stone-300 font-medium italic">
            {t('progress.noWeakWords', { defaultValue: 'Chưa có từ yếu nào được ghi nhận.' })}
          </p>
        </div>
      ) : (
        <ul className="space-y-5">
          {displayWords.map((w, i) => {
            const barPct = Math.round((w.fail_count / maxFails) * 100)
            const barColor = barPct < 50 ? 'bg-[#755A33]' : 'bg-error'
            return (
              <li key={w.id} className="flex items-center gap-4">
                <div className="w-8 text-sm font-bold text-on-surface-variant">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-on-surface">{w.word}</p>
                  <div className="w-full bg-surface-dim h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barPct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className={`h-full rounded-full ${barColor}`}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {displayWords.length > 0 && (
        <button className="mt-7 text-sm font-medium text-primary hover:text-[#713700] transition-colors underline decoration-2 underline-offset-4 decoration-primary-container/30">
          {t('progress.review_now', { defaultValue: 'Ôn tập ngay' })}
        </button>
      )}
    </div>
  )
}
