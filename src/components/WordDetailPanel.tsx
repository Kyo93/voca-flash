import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MasteryWord } from '../lib/types'
import { format } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
import AudioButton from './common/AudioButton'
import { getSrsLevelConfig } from '../lib/srs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import RichNoteEditor from './common/RichNoteEditor'


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
                  <h2 className="text-4xl font-black text-on-surface tracking-tighter text-editorial-asymmetry">{word.word}</h2>
                  {word.phonetic && (
                    <span className="text-lg text-on-surface-variant/60 font-normal font-mono italic">{word.phonetic}</span>
                  )}
                </div>
                 <div className="flex flex-wrap gap-2 text-editorial-asymmetry items-center">
                   <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-semibold uppercase tracking-widest rounded-md">
                    {word.topic_names?.split(',')[0] || t('mastery.detail.untagged')}
                  </span>
                  
                  {/* SRS Level Badge */}
                  {(() => {
                    const level = getSrsLevelConfig(word.fsrs_stability)
                    return (
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${level.bg} ${level.text} ${level.glow}`}>
                        <span className="material-symbols-outlined text-sm">{level.icon}</span>
                        {level.label}
                      </span>
                    )
                  })()}

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
              {activeTab === 'overview' && (
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
              )}

              {activeTab === 'linguistic' && (
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
              )}

              {activeTab === 'notes' && (
                <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="label-md text-on-surface-variant font-black tracking-widest uppercase opacity-40">{t('mastery.detail.personalNote')}</h3>
                    {!isEditingNote && (
                      <button 
                        onClick={() => setIsEditingNote(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-primary/5 text-primary transition-all active:scale-95 group"
                      >
                        <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">edit</span>
                        <span className="text-[10px] font-black uppercase tracking-wider">{t('mastery.detail.edit')}</span>
                      </button>
                    )}
                  </div>

                  {isEditingNote ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <RichNoteEditor 
                        content={draftNote}
                        onChange={setDraftNote}
                        placeholder={t('notebook.notePlaceholder')}
                      />
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setIsEditingNote(false)
                            setDraftNote(personalNote || '')
                          }}
                          className="flex-1 py-4 rounded-2xl bg-surface-container-highest text-on-surface font-semibold hover:bg-surface-dim active:scale-95 transition-all tracking-wider uppercase text-[10px]"
                        >
                          {t('admin.import.cancel')}
                        </button>
                        <button
                          onClick={async () => {
                            await onSaveNote(draftNote)
                            setIsEditingNote(false)
                          }}
                          className="flex-2 py-4 rounded-2xl primary-gradient text-on-primary font-semibold sun-drenched-shadow hover:brightness-105 active:scale-95 transition-all tracking-widest uppercase text-[10px] flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">save</span>
                          {t('settings.save')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-10 bg-surface-container-highest/30 rounded-[32px] relative overflow-hidden group min-h-[200px] border border-outline-variant/10">
                       <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-9xl text-primary/5 rotate-12 group-hover:rotate-0 transition-transform duration-700">edit_note</span>
                       <div className={`text-on-surface text-xl leading-relaxed relative z-10 font-normal prose max-w-none prose-p:leading-relaxed prose-li:my-1 ${!personalNote ? 'opacity-30' : ''}`}>
                          {personalNote ? (
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]} 
                              rehypePlugins={[rehypeRaw]}
                              components={{
                                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="marker:text-primary/40">{children}</li>,
                                strong: ({ children }) => <strong className="text-primary font-black not-italic">{children}</strong>,
                                em: ({ children }) => <em className="text-on-surface/80">{children}</em>,
                              }}
                            >
                              {personalNote}
                            </ReactMarkdown>
                          ) : (
                            t('mastery.detail.notePlaceholder')
                          )}
                       </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'stats' && (
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
                          <p className="text-3xl font-bold text-on-surface">{word.fsrs_stability.toFixed(1)}d</p>
                        </div>
                        <div className="p-6 bg-surface rounded-2xl sun-drenched-shadow">
                          <p className="label-md text-on-surface-variant mb-2">{t('mastery.detail.difficulty')}</p>
                          <p className="text-3xl font-bold text-on-surface">{word.fsrs_difficulty.toFixed(1)}</p>
                        </div>
                        <div className="p-6 bg-surface rounded-2xl sun-drenched-shadow">
                          <p className="label-md text-on-surface-variant mb-2">{t('mastery.detail.reps')}</p>
                          <p className="text-3xl font-bold text-on-surface">{word.fsrs_reps}</p>
                        </div>
                        <div className="p-6 bg-surface rounded-2xl sun-drenched-shadow">
                          <p className="label-md text-on-surface-variant mb-2">{t('mastery.detail.lapses')}</p>
                          <p className="text-3xl font-bold text-red-500">{word.fsrs_lapses}</p>
                        </div>
                    </div>
                   </section>

                   <section className="space-y-4">
                    <h3 className="label-md text-on-surface-variant">{t('mastery.detail.scholarSchedule')}</h3>
                    <div className="p-8 secondary-gradient text-on-secondary rounded-2xl flex justify-between items-center sun-drenched-shadow">
                       <div>
                         <p className="label-md text-on-secondary/60 mb-2">{t('mastery.detail.nextReview')}</p>
                         <p className="text-2xl font-bold">
                           {word.next_review_at ? format(new Date(word.next_review_at), 'dd MMMM, yyyy', { locale }) : '--'}
                         </p>
                       </div>
                       <div className="text-right">
                         <span className="material-symbols-outlined text-4xl opacity-40">calendar_month</span>
                       </div>
                    </div>
                   </section>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
