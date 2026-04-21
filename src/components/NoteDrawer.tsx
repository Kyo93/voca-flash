import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface NoteDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (note: string) => void
  initialNote: string
  word: string
}

export default function NoteDrawer({
  isOpen,
  onClose,
  onSave,
  initialNote,
  word,
}: NoteDrawerProps) {
  const { t } = useTranslation()
  const [note, setNote] = useState(initialNote)

  useEffect(() => {
    if (isOpen) {
      setNote(initialNote)
    }
  }, [isOpen, initialNote])

  const handleSave = () => {
    onSave(note)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-60 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-70 bg-surface rounded-t-[40px] sun-drenched-shadow-lg p-8 pb-12 w-full max-w-md mx-auto"
          >
            {/* Handle */}
            <div className="w-16 h-1.5 bg-surface-container-highest rounded-full mx-auto mb-10 cursor-grab active:cursor-grabbing opacity-50" />

            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-3xl font-headline font-black text-on-surface tracking-tighter text-editorial-asymmetry">
                  {t('notebook.title')}
                </h3>
                <p className="text-sm text-on-surface-variant font-normal tracking-wide">
                  {t('notebook.noteLabel', { word })}
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('notebook.notePlaceholder')}
                  className="w-full h-48 bg-surface-container-low border-none rounded-2xl p-8 text-on-surface shadow-inner text-xl leading-relaxed italic input-tactile-focus transition-all resize-none font-normal"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl bg-surface-container-highest text-on-surface font-semibold hover:bg-surface-dim active:scale-95 transition-all tracking-wider uppercase text-[10px]"
                >
                  {t('admin.import.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-4 rounded-2xl primary-gradient text-on-primary font-semibold sun-drenched-shadow hover:brightness-105 active:scale-95 transition-all tracking-widest uppercase text-[10px] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">save</span>
                  {t('settings.save')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
