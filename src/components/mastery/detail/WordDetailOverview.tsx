import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MasteryWord } from '../../../lib/types'

interface WordDetailOverviewProps {
  word: MasteryWord
}

export const WordDetailOverview: React.FC<WordDetailOverviewProps> = ({ word }) => {
  const { t } = useTranslation()

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      {word.image_url && (
        <div className="aspect-video w-full rounded-2xl overflow-hidden sun-drenched-shadow relative group">
          <div className="absolute inset-0 bg-linear-to-t from-on-surface/20 to-transparent opacity-60" />
          <img 
            src={word.image_url} 
            alt={word.word} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        </div>
      )}

      <section className="space-y-4">
        <h3 className="label-md text-on-surface-variant">{t('mastery.detail.definitionAndExample')}</h3>
        <div className="p-8 bg-surface rounded-2xl sun-drenched-shadow space-y-6">
          <p className="text-2xl font-bold text-on-surface leading-tight">{word.definition}</p>
          {word.example && (
            <div className="pt-6 border-t border-surface-container">
              <p className="text-on-surface-variant italic leading-relaxed text-lg">
                "{word.example}"
              </p>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  )
}
