import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { MasteryWord } from '../lib/types'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNotebook } from '../hooks/useNotebook'
import { useMasteryWords } from '../hooks/useMasteryWords'
import WordDetailPanel from '../components/WordDetailPanel'

import CardRow from '../components/mastery/CardRow'
import MasteryHeader from '../components/mastery/MasteryHeader'
import MasteryStatsGrid from '../components/mastery/MasteryStatsGrid'
import ScholarlyFilterBar from '../components/mastery/ScholarlyFilterBar'
import ScholarlyABCFilter from '../components/mastery/ScholarlyABCFilter'

import { vi, enUS } from 'date-fns/locale'

export default function MasteryPage() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  
  // Data Logic via Custom Hook
  const {
    words,
    stats,
    totalCount,
    loading,
    loadingMore,
    page,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    advancedFilters,
    setAdvancedFilters,
    selectedIds,
    lastElementRef,
    handleFilterChange,
    toggleSelectAll,
    toggleSelect
  } = useMasteryWords({ userId: user?.id })

  // Interaction State
  const { isSaved, toggle, updateNote, getNote } = useNotebook()
  
  // Master-Detail State
  const [selectedWord, setSelectedWord] = useState<MasteryWord | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelTab, setPanelTab] = useState<'overview' | 'notes'>('overview')
  const [isNoteEditMode, setIsNoteEditMode] = useState(false)

  const dateLocale = i18n.language === 'vi' ? vi : enUS

  const handleStartFreeStudy = () => {
    const selectedWords = words.filter(w => selectedIds.has(w.word_id))
    navigate('/free-study', { state: { words: selectedWords } })
  }

  const handleOpenNoteDetail = (word: MasteryWord, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedWord(word)
    setPanelTab('notes')
    setIsNoteEditMode(true)
    setIsPanelOpen(true)
  }

  const handleToggleNotebook = async (wordId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    await toggle(wordId)
  }

  const handleSelectWord = (word: MasteryWord) => {
    setSelectedWord(word)
    setPanelTab('overview')
    setIsNoteEditMode(false)
    setIsPanelOpen(true)
  }

  const handleSaveNote = async (note: string) => {
    if (!selectedWord) return
    await updateNote(selectedWord.word_id, note)
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto w-full">
        {/* Hero Header */}
        <MasteryHeader 
          totalCount={totalCount}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedIdsSize={selectedIds.size}
          onStartFreeStudy={handleStartFreeStudy}
        />

        {/* Stats Quick Grid */}
        <MasteryStatsGrid stats={stats} />

        {/* Scholarly Filter Bar */}
        <ScholarlyFilterBar 
          onFilterChange={handleFilterChange}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />

        {/* ABC Quick Jump Filter */}
        <ScholarlyABCFilter 
          selectedLetter={advancedFilters.abcLetter}
          onLetterSelect={(letter) => setAdvancedFilters(prev => ({ ...prev, abcLetter: letter }))}
        />

        {/* Word Table (Scholarly Ledger) */}
        <div className="bg-surface-container-lowest rounded-[40px] shadow-sun-drenched overflow-hidden mb-12 border-none">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-surface-container">
                  <th className="py-6 px-8 w-12">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.size === words.length && words.length > 0}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded-lg border-outline-variant text-primary focus:ring-primary/20 accent-primary cursor-pointer transition-all"
                    />
                  </th>
                  <th className="py-6 px-2 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">{t('mastery.table.word')}</th>
                  <th className="py-6 px-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] hidden lg:table-cell">{t('mastery.table.topic')}</th>
                  <th className="py-6 px-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">{t('mastery.table.notebook')}</th>
                  <th className="py-6 px-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">{t('mastery.table.strength')}</th>
                  <th className="py-6 px-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] text-right">{t('mastery.table.nextReview')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {words.map((w, index) => (
                  <CardRow 
                    key={w.word_id} 
                    ref={index === words.length - 1 ? lastElementRef : null}
                    word={w} 
                    isSelected={selectedIds.has(w.word_id)}
                    onSelect={(e) => toggleSelect(w.word_id, e)}

                    isSelectedFocus={selectedWord?.word_id === w.word_id}
                    onSelectFocus={() => handleSelectWord(w)}
                    
                    isNotebookSaved={isSaved(w.word_id)}
                    onToggleNotebook={(e) => handleToggleNotebook(w.word_id, e)}
                    onEditNote={(e) => handleOpenNoteDetail(w, e)}
                    personalNote={getNote(w.word_id)}
                    
                    locale={dateLocale}
                  />
                ))}
                
                {loading && page === 0 && (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-6 px-8"><div className="w-5 h-5 bg-stone-100 rounded" /></td>
                      <td className="py-6 px-2">
                         <div className="flex gap-2 mb-2 items-center">
                            <div className="h-4 bg-stone-100 rounded w-24" />
                            <div className="h-3 bg-stone-50 rounded w-16" />
                         </div>
                         <div className="h-3 bg-stone-100/50 rounded w-32" />
                      </td>
                      <td className="py-6 px-8 hidden lg:table-cell"><div className="h-4 bg-stone-100 rounded w-20" /></td>
                      <td className="py-6 px-8"><div className="h-4 bg-stone-100 rounded w-10" /></td>
                      <td className="py-6 px-8"><div className="h-6 bg-stone-100 rounded w-32" /></td>
                      <td className="py-6 px-8 text-right"><div className="h-8 bg-stone-100 rounded w-16 float-right" /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {!loading && words.length === 0 && (
            <div className="py-32 text-center bg-white">
              <span className="material-symbols-outlined text-stone-100 text-8xl mb-6">folder_off</span>
              <p className="text-on-surface-variant/60 font-black text-xl">{t('mastery.empty.title')}</p>
              <p className="text-on-surface-variant/40 text-sm mt-2">{t('mastery.empty.subtitle')}</p>
            </div>
          )}

          {loadingMore && (
             <div className="py-10 flex justify-center border-t border-outline-variant/10">
                <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
             </div>
          )}
        </div>

        {/* Word Detail Side Panel */}
        <WordDetailPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          word={selectedWord}
          isNotebookSaved={selectedWord ? isSaved(selectedWord.word_id) : false}
          onToggleNotebook={handleToggleNotebook}
          personalNote={selectedWord ? getNote(selectedWord.word_id) : null}
          onSaveNote={handleSaveNote}
          initialTab={panelTab}
          forceEdit={isNoteEditMode}
        />

      </div>
    </div>
  )
}


