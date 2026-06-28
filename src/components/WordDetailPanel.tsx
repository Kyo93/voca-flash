import { lazy, Suspense, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MasteryWord } from '../lib/types'
import { vi, enUS } from 'date-fns/locale'
import AudioButton from './common/AudioButton'

import { SrsLevelBadge } from './mastery/SrsLevelBadge'
import { WordDetailOverview } from './mastery/detail/WordDetailOverview'
import { WordDetailLinguistic } from './mastery/detail/WordDetailLinguistic'
import { WordDetailStats } from './mastery/detail/WordDetailStats'

const NoteTab = lazy(() => import('./mastery/detail/NoteTab').then(module => ({ default: module.NoteTab })))

interface WordDetailPanelProps {
  word: MasteryWord | null
  isOpen: boolean
  onClose: () => void
  onToggleNotebook: (wordId: string) => Promise<void>
  isNotebookSaved: boolean
  personalNote: string | null
  onSaveNote: (note: string) => Promise<void>
  initialTab?: TabType
  forceEdit?: boolean
}

type TabType = 'overview' | 'linguistic' | 'notes' | 'stats'

export default function WordDetailPanel({
  word,
  isOpen,
  onClose,
  onToggleNotebook,
  isNotebookSaved,
  personalNote,
  onSaveNote,
  initialTab = 'overview',
  forceEdit = false
}: WordDetailPanelProps) {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [draftNote, setDraftNote] = useState('')
  const locale = i18n.language === 'vi' ? vi : enUS

  // Reset tab when word changes or opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      setIsEditingNote(forceEdit)
      setDraftNote(personalNote || '')
    }
  }, [isOpen, word?.word_id, initialTab, forceEdit, personalNote])

  if (!word && isOpen) return null

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: t('mastery.detail.tabs.overview'), icon: 'visibility' },
    { id: 'linguistic', label: t('mastery.detail.tabs.linguistic'), icon: 'account_tree' },
    { id: 'notes', label: t('mastery.detail.tabs.notes'), icon: 'edit_note' },
    { id: 'stats', label: t('mastery.detail.tabs.stats'), icon: 'analytics' }
  ]

  return (
    <AnimatePresence>
      {isOpen && word && (
        <>
          {/* Backdrop (Mobile only or dim effect) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-60 bg-black/20 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full z-70 w-full md:w-[480px] lg:w-[560px] bg-mint/95 backdrop-blur-2xl sun-drenched-shadow-lg flex flex-col"
          >
            {/* Header Area */}
            <div className="p-8 pb-6 space-y-6">
              <div className="flex items-start justify-between">
                <button 
                  onClick={onClose}
                  className="p-2 -ml-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
                
                <div className="flex items-center gap-2">
                   <button
                    onClick={() => onToggleNotebook(word.word_id)}
                    className={`p-2.5 rounded-xl transition-all ${isNotebookSaved ? 'bg-primary/10 text-primary shadow-sm' : 'bg-surface-container text-on-surface-variant/40 hover:text-on-surface-variant'}`}
                  >
                    <span className={`material-symbols-outlined text-2xl ${isNotebookSaved ? 'fill-icon scale-110' : ''}`}
                          style={{ fontVariationSettings: isNotebookSaved ? "'FILL' 1" : "'FILL' 0" }}>
                      favorite
                    </span>
                  </button>
                  <AudioButton 
                    text={word.word} 
                    className="sun-drenched-shadow"
                    variant="tactile"
                    size="lg"
                  />
                </div>

              </div>

              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-4xl font-semibold text-on-surface tracking-tighter text-editorial-asymmetry">{word.word}</h2>
                  {word.phonetic && (
                    <span className="text-lg text-on-surface-variant/60 font-normal font-mono italic">{word.phonetic}</span>
                  )}
                </div>
                 <div className="flex flex-wrap gap-2 text-editorial-asymmetry items-center">
                   <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-semibold uppercase tracking-widest rounded-md">
                    {word.topic_names?.split(',')[0] || t('mastery.detail.untagged')}
                  </span>
                  
                  <SrsLevelBadge stability={word.fsrs_stability} size="md" />

                  {word.is_orphaned && (

                    <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-semibold uppercase tracking-widest rounded-md">
                      {t('mastery.detail.orphaned')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-8 flex gap-8 overflow-x-auto no-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-[11px] font-semibold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                    activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant/60 hover:text-on-surface-variant'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTabPanel"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" 
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar bg-mint-container/30">
              {activeTab === 'overview' && <WordDetailOverview word={word} />}

              {activeTab === 'linguistic' && <WordDetailLinguistic word={word} />}

              {activeTab === 'notes' && (
                <Suspense fallback={<div className="p-8 text-sm text-on-surface-variant">{t('common.loading')}</div>}>
                  <NoteTab
                    isEditing={isEditingNote}
                    onStartEdit={() => setIsEditingNote(true)}
                    draftNote={draftNote}
                    onDraftChange={setDraftNote}
                    personalNote={personalNote}
                    onCancel={() => {
                      setIsEditingNote(false)
                      setDraftNote(personalNote || '')
                    }}
                    onSave={async () => {
                      await onSaveNote(draftNote)
                      setIsEditingNote(false)
                    }}
                  />
                </Suspense>
              )}

              {activeTab === 'stats' && <WordDetailStats word={word} locale={locale} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
