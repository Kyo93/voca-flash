import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MasteryWord } from '../../../lib/types'

interface WordDetailLinguisticProps {
  word: MasteryWord
}

export const WordDetailLinguistic: React.FC<WordDetailLinguisticProps> = ({ word }) => {
  const { t } = useTranslation()

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="p-16 text-center space-y-4">
        <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-on-surface-variant transform scale-150">account_tree</span>
        </div>
        <p className="text-on-surface font-semibold text-lg">{t('mastery.detail.editingLinguistic')}</p>
        <p className="text-sm text-on-surface-variant px-12 font-normal">{t('mastery.detail.editingLinguisticDesc', { word: word.word })}</p>
      </div>
    </motion.div>
  )
}
