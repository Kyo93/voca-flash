import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { UI_CONFIG } from '../../lib/constants'

interface ConfirmExitModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function ConfirmExitModal({ isOpen, onClose, onConfirm }: ConfirmExitModalProps) {
  const { t } = useTranslation()
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          data-mobile-confirm-exit
          className="fixed inset-0 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl sm:p-6"
          style={{ zIndex: UI_CONFIG.Z_INDEX.OVERLAY }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-arena-container w-full max-w-sm border-white/20 p-6 text-center shadow-[0_0_100px_rgba(0,0,0,0.8)] sm:p-12"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-4xl border border-red-500/20 bg-red-500/10 text-red-500 shadow-2xl sm:mb-10 sm:h-24 sm:w-24">
              <span className="material-symbols-outlined text-4xl sm:text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>logout</span>
            </div>
            
            <h2 className="text-shadow-glow mb-4 text-2xl font-semibold tracking-tight text-white sm:mb-6 sm:text-3xl">{t('confirmExit.title')}</h2>
            <p className="mb-6 text-base font-medium leading-[1.6] text-white/40 sm:mb-12">
              {t('confirmExit.subtitle')}
            </p>
    
            <div className="flex flex-col gap-3 sm:gap-4">
              <button
                onClick={onConfirm}
                className="min-h-12 w-full rounded-2xl bg-white py-3 font-semibold text-black shadow-xl transition-all hover:scale-105 active:scale-95 sm:py-5"
              >
                {t('confirmExit.exit')}
              </button>
              <button
                onClick={onClose}
                className="glass-arena-item min-h-12 w-full rounded-2xl border-white/10 py-3 font-semibold text-white transition-all hover:bg-white/10 active:scale-95 sm:py-5"
              >
                {t('confirmExit.stay')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
