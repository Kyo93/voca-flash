import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MasteryWord } from '../lib/types'
import { format } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
import AudioButton from './common/AudioButton'
import { getSrsLevelConfig } from '../lib/srs'


interface WordDetailPanelProps {
  word: MasteryWord | null
  isOpen: boolean
  onClose: () => void
  onToggleNotebook: (wordId: string) => Promise<void>
  isNotebookSaved: boolean
  personalNote: string | null
  onEditNote: () => void
}

type TabType = 'overview' | 'linguistic' | 'notes' | 'stats'

export default function WordDetailPanel({
  word,
  isOpen,
  onClose,
  onToggleNotebook,
  isNotebookSaved,
  personalNote,
  onEditNote
}: WordDetailPanelProps) {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const locale = i18n.language === 'vi' ? vi : enUS

  // Reset tab when word changes or opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview')
    }
  }, [isOpen, word?.word_id])

  if (!word && isOpen) return null

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Tổng quát', icon: 'visibility' },
    { id: 'linguistic', label: 'Mở rộng', icon: 'account_tree' },
    { id: 'notes', label: 'Ghi chú', icon: 'edit_note' },
    { id: 'stats', label: 'Tiến độ', icon: 'analytics' }
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
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full z-[70] w-full md:w-[480px] lg:w-[560px] bg-surface/95 backdrop-blur-2xl sun-drenched-shadow-lg flex flex-col"
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
                    {word.topic_names?.split(',')[0] || 'Chưa gán'}
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
                      Mồ côi
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
            <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar bg-surface-container-low">
              {activeTab === 'overview' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10"
                >
                   {word.image_url && (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden sun-drenched-shadow relative group">
                      <div className="absolute inset-0 bg-gradient-to-t from-on-surface/20 to-transparent opacity-60" />
                      <img 
                        src={word.image_url} 
                        alt={word.word} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    </div>
                  )}

                  <section className="space-y-4">
                    <h3 className="label-md text-on-surface-variant">Định nghĩa & Ví dụ</h3>
                    <div className="p-8 bg-surface rounded-3xl sun-drenched-shadow space-y-6">
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
                    <p className="text-on-surface font-semibold text-lg">Dữ liệu mở rộng đang được biên tập</p>
                    <p className="text-sm text-on-surface-variant px-12 font-normal">Hệ thống Scholar đang xử lý dữ liệu về Đồng nghĩa, Trái nghĩa và Collocations cho từ "{word.word}".</p>
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
                    <h3 className="label-md text-on-surface-variant">Sổ tay cá nhân</h3>
                    <button 
                      onClick={onEditNote}
                      className="label-md text-primary hover:underline transition-all"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                  <div className="p-10 bg-surface-container-highest/30 rounded-3xl relative overflow-hidden group min-h-[250px] sun-drenched-shadow">
                     <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-9xl text-primary/5 rotate-12 group-hover:rotate-0 transition-transform duration-700">edit_note</span>
                     <p className={`text-on-surface text-xl italic leading-relaxed relative z-10 font-normal ${!personalNote ? 'opacity-30' : ''}`}>
                        {personalNote || 'Bút sa gà chết. Một vài ghi chú cá nhân sẽ giúp bạn khắc sâu từ vựng này vào tâm trí.'}
                     </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'stats' && (
                <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-10"
                >
                   <section className="space-y-4">
                    <h3 className="label-md text-on-surface-variant">Trạng thái ghi nhớ</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-surface rounded-2xl sun-drenched-shadow">
                         <p className="label-md text-on-surface-variant mb-2">Độ ổn định</p>
                         <p className="text-3xl font-bold text-on-surface">{word.fsrs_stability.toFixed(1)}d</p>
                       </div>
                       <div className="p-6 bg-surface rounded-2xl sun-drenched-shadow">
                         <p className="label-md text-on-surface-variant mb-2">Độ khó</p>
                         <p className="text-3xl font-bold text-on-surface">{word.fsrs_difficulty.toFixed(1)}</p>
                       </div>
                       <div className="p-6 bg-surface rounded-2xl sun-drenched-shadow">
                         <p className="label-md text-on-surface-variant mb-2">Lượt ôn tập</p>
                         <p className="text-3xl font-bold text-on-surface">{word.fsrs_reps}</p>
                       </div>
                       <div className="p-6 bg-surface rounded-2xl sun-drenched-shadow">
                         <p className="label-md text-on-surface-variant mb-2">Số lần quên</p>
                         <p className="text-3xl font-bold text-red-500">{word.fsrs_lapses}</p>
                       </div>
                    </div>
                   </section>

                   <section className="space-y-4">
                    <h3 className="label-md text-on-surface-variant">Lịch trình Scholar</h3>
                    <div className="p-8 secondary-gradient text-on-secondary rounded-3xl flex justify-between items-center sun-drenched-shadow">
                       <div>
                         <p className="label-md text-on-secondary/60 mb-2">Cần ôn lại vào</p>
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
