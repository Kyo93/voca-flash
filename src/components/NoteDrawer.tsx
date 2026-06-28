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
            className="fixed inset-0 z-60 bg-black/40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mobile-sheet fixed bottom-0 left-0 right-0 z-70 w-full max-w-md mx-auto bg-surface p-8 pb-12"
          >
            {/* Handle */}
            <div className="w-16 h-1.5 bg-surface-container-highest rounded-full mx-auto mb-10 cursor-grab active:cursor-grabbing opacity-50" />

            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-3xl font-headline font-semibold text-on-surface tracking-tighter text-editorial-asymmetry">
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
                  className="mobile-input h-48 w-full resize-none p-6 text-on-surface text-xl leading-relaxed italic input-tactile-focus transition-all font-normal"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="mobile-secondary-action flex-1 py-4 font-semibold active:scale-95 transition-all uppercase text-[10px]"
                >
                  {t('admin.import.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  className="mobile-primary-action flex flex-1 items-center justify-center gap-2 py-4 font-semibold active:scale-95 transition-all uppercase text-[10px]"
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
