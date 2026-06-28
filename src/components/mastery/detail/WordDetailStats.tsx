import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Locale } from 'date-fns/locale'
import { MasteryWord } from '../../../lib/types'

interface WordDetailStatsProps {
  word: MasteryWord
  locale: Locale
}

export const WordDetailStats: React.FC<WordDetailStatsProps> = ({ word, locale }) => {
  const { t } = useTranslation()

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <section className="space-y-4">
        <h3 className="label-md text-on-surface-variant">{t('mastery.detail.retentionStatus')}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-surface rounded-2xl sun-drenched-shadow">
            <p className="label-md text-on-surface-variant mb-2">{t('mastery.detail.stability')}</p>
            <p className="text-3xl font-medium text-on-surface">{word.fsrs_stability.toFixed(1)}d</p>
          </div>
          <div className="p-6 bg-surface rounded-2xl sun-drenched-shadow">
            <p className="label-md text-on-surface-variant mb-2">{t('mastery.detail.difficulty')}</p>
            <p className="text-3xl font-medium text-on-surface">{word.fsrs_difficulty.toFixed(1)}</p>
          </div>
          <div className="p-6 bg-surface rounded-2xl sun-drenched-shadow">
            <p className="label-md text-on-surface-variant mb-2">{t('mastery.detail.reps')}</p>
            <p className="text-3xl font-medium text-on-surface">{word.fsrs_reps}</p>
          </div>
          <div className="p-6 bg-surface rounded-2xl sun-drenched-shadow">
            <p className="label-md text-on-surface-variant mb-2">{t('mastery.detail.lapses')}</p>
            <p className="text-3xl font-medium text-red-500">{word.fsrs_lapses}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="label-md text-on-surface-variant">{t('mastery.detail.scholarSchedule')}</h3>
        <div className="p-8 secondary-gradient text-on-secondary rounded-2xl flex justify-between items-center sun-drenched-shadow">
          <div>
            <p className="label-md text-on-secondary/60 mb-2">{t('mastery.detail.nextReview')}</p>
            <p className="text-2xl font-medium">
              {word.next_review_at ? format(new Date(word.next_review_at), 'dd MMMM, yyyy', { locale }) : '--'}
            </p>
          </div>
          <div className="text-right">
            <span className="material-symbols-outlined text-4xl opacity-40">calendar_month</span>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
