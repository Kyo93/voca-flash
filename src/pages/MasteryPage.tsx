import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUserVocabulary, getMasteryStats } from '../lib/storage/mastery'
import { MasteryWord } from '../lib/types'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNotebook } from '../hooks/useNotebook'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import NoteDrawer from '../components/NoteDrawer'
import WordDetailPanel from '../components/WordDetailPanel'

import CardRow from '../components/mastery/CardRow'
import MasteryHeader from '../components/mastery/MasteryHeader'
import MasteryStatsGrid from '../components/mastery/MasteryStatsGrid'
import MasteryFilterTabs from '../components/mastery/MasteryFilterTabs'

import { MASTERY_CONFIG } from '../lib/constants'

import { vi, enUS } from 'date-fns/locale'

type FilterType = 'all' | 'due' | 'weak' | 'orphaned' | 'mastered'

export default function MasteryPage() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  
  // Data State
  const [words, setWords] = useState<MasteryWord[]>([])
  const [stats, setStats] = useState<any>(null)
  const [totalCount, setTotalCount] = useState(0)
  
  // UI State
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  
  // Filter/Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  
  // interaction State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())


  const { isSaved, toggle, updateNote, getNote } = useNotebook()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<MasteryWord | null>(null)
  
  // Master-Detail State
  const [selectedWord, setSelectedWord] = useState<MasteryWord | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const dateLocale = i18n.language === 'vi' ? vi : enUS
  const PAGE_SIZE = MASTERY_CONFIG.DEFAULT_PAGE_SIZE

  // 1. Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // 2. Fetch Stats & Reset on filter/search change
  useEffect(() => {
    if (!user) return
    setPage(0)
    setWords([])
    setHasMore(true)

    async function loadStats() {
      if (!user) return
      const s = await getMasteryStats(user.id)
      setStats(s)
    }
    loadStats()
  }, [user, debouncedSearch, activeFilter])

  // 3. Re-fetch everything when page becomes visible (e.g. user returns from study)
  //    This fixes stale data: MasteryPage loaded with N words, user studies more
  //    words → back to MasteryPage → visibilitychange fires → re-fetch → shows fresh count
  useEffect(() => {
    if (!user) return

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setPage(0)
        setWords([])
        setHasMore(true)
        // Refresh both: stat cards (getMasteryStats) AND totalCount (loadData → getUserVocabulary)
        getMasteryStats(user.id).then(s => setStats(s))
        loadData(0)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [user])

  // 5. Fetch Data (Paginated)
  const loadData = useCallback(async (pageNum: number) => {
    if (!user) return
    const isInitial = pageNum === 0
    
    if (isInitial) setLoading(true)
    else setLoadingMore(true)

    try {
      const { data, total } = await getUserVocabulary(user.id, {
        limit: PAGE_SIZE,
        offset: pageNum * PAGE_SIZE,
        search: debouncedSearch,
        filter: activeFilter
      })

      setTotalCount(total)
      setWords(prev => isInitial ? data : [...prev, ...data])
      setHasMore(data.length === PAGE_SIZE)
    } catch (err) {
      console.error('Failed to load mastery data:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [user, debouncedSearch, activeFilter])

  useEffect(() => {
    loadData(page)
  }, [loadData, page])

  // 6. Infinite Scroll Observer
  const { lastElementRef } = useInfiniteScroll({
    loading: loading || loadingMore,
    hasMore,
    onLoadMore: () => setPage(prev => prev + 1)
  })

  const toggleSelectAll = () => {
    if (selectedIds.size === words.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(words.map(w => w.word_id)))
    }
  }

  const toggleSelect = (id: string, e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => {
    e.stopPropagation()
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleStartFreeStudy = () => {
    const selectedWords = words.filter(w => selectedIds.has(w.word_id))
    navigate('/free-study', { state: { words: selectedWords } })
  }

  const handleOpenDrawer = (word: MasteryWord, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingWord(word)
    setIsDrawerOpen(true)
  }

  const handleToggleNotebook = async (wordId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    await toggle(wordId)
    
    // Update selectedWord state if it's the one being toggled
    if (selectedWord?.word_id === wordId) {
      // Logic handled via hook reactivity usually, but if needed we can force update
    }
  }

  const handleSelectWord = (word: MasteryWord) => {
    setSelectedWord(word)
    setIsPanelOpen(true)
  }

  const handleSaveNote = async (note: string) => {
    if (!editingWord) return
    await updateNote(editingWord.word_id, note)
  }

  return (
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

      {/* Filter Tabs */}
      <MasteryFilterTabs 
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      {/* Word Table */}
      <div className="bg-surface rounded-2xl sun-drenched-shadow overflow-hidden mb-12">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/50">
                <th className="py-6 px-8 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === words.length && words.length > 0}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded-lg border-surface-container-highest text-primary focus:ring-primary/20 accent-primary cursor-pointer transition-all"
                  />
                </th>
                <th className="py-6 px-2 text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.2em]">{t('mastery.table.word')}</th>
                <th className="py-6 px-8 text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.2em] hidden lg:table-cell">{t('mastery.table.topic')}</th>
                <th className="py-6 px-8 text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.2em]">{t('mastery.table.notebook')}</th>
                <th className="py-6 px-8 text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.2em]">{t('mastery.table.strength')}</th>
                <th className="py-6 px-8 text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.2em] text-right">{t('mastery.table.nextReview')}</th>
              </tr>
            </thead>
            <tbody className="">
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
                  onEditNote={(e) => handleOpenDrawer(w, e)}
                  personalNote={getNote(w.word_id)}
                  
                  locale={dateLocale}
                />
              ))}
              
              {loading && page === 0 && (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-6 px-6"><div className="w-5 h-5 bg-stone-100 rounded" /></td>
                    <td className="py-6 px-2">
                       <div className="h-4 bg-stone-100 rounded w-24 mb-2" />
                    </td>
                    <td className="py-6 px-6 hidden lg:table-cell"><div className="h-4 bg-stone-100 rounded w-20" /></td>
                    <td className="py-6 px-6"><div className="h-4 bg-stone-100 rounded w-10" /></td>
                    <td className="py-6 px-6"><div className="h-6 bg-stone-100 rounded w-32" /></td>
                    <td className="py-6 px-6"><div className="h-8 bg-stone-100 rounded w-16 float-right" /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && words.length === 0 && (
          <div className="py-32 text-center">
            <span className="material-symbols-outlined text-stone-100 text-8xl mb-6">folder_off</span>
            <p className="text-stone-400 font-black text-xl">{t('mastery.empty.title')}</p>
            <p className="text-stone-300 text-sm mt-2">{t('mastery.empty.subtitle')}</p>
          </div>
        )}

        {loadingMore && (
           <div className="py-10 flex justify-center border-t border-stone-50">
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
        onEditNote={() => {
          if (selectedWord) {
             setEditingWord(selectedWord)
             setIsDrawerOpen(true)
          }
        }}
      />

      {/* Note Drawer for Editing */}
      <NoteDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setEditingWord(null)
        }}
        onSave={handleSaveNote}
        initialNote={editingWord ? getNote(editingWord.word_id) : ''}
        word={editingWord?.word || ''}
      />
    </div>
  )
}


