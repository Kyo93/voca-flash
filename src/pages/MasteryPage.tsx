import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUserVocabulary, getMasteryStats } from '../lib/storage/mastery'
import { MasteryWord } from '../lib/types'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNotebook } from '../hooks/useNotebook'
import NoteDrawer from '../components/NoteDrawer'
import WordDetailPanel from '../components/WordDetailPanel'

import CardRow from '../components/mastery/CardRow'

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
  const observer = useRef<IntersectionObserver | null>(null)

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
  const lastElementRef = useCallback((node: HTMLTableRowElement | null) => {
    if (loading || loadingMore) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1)
      }
    })
    
    if (node) observer.current.observe(node)
  }, [loading, loadingMore, hasMore])

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-on-surface tracking-tighter text-editorial-asymmetry">{t('mastery.title')}</h1>
          <p className="text-on-surface-variant font-medium max-w-lg leading-relaxed h-6">
            {loading && totalCount === 0 ? (
              <span className="inline-block w-48 h-4 bg-surface-container-highest animate-pulse rounded-full" />
            ) : (
              t('mastery.subtitle', { count: totalCount })
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors">search</span>
              <input 
                type="text"
                placeholder={t('nav.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3.5 bg-surface-container border-none rounded-2xl sun-drenched-shadow input-tactile-focus transition-all w-full md:w-80 font-medium text-sm"
              />
          </div>
          
          <button 
            disabled={selectedIds.size === 0}
            onClick={handleStartFreeStudy}
            className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-3 transition-all shadow-lg active:scale-95 ${
              selectedIds.size > 0 
                ? 'primary-gradient text-on-primary sun-drenched-shadow cursor-pointer' 
                : 'bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed shadow-none font-medium'
            }`}
          >
            <span className="material-symbols-outlined font-variation-fill">bolt</span>
            {t('mastery.freeStudy', { count: selectedIds.size })}
          </button>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {stats ? [
          { label: t('mastery.stats.learning'), value: stats.learning, icon: 'school', color: 'text-primary', bg: 'bg-primary/10' },
          { label: t('mastery.stats.total'), value: stats.total, icon: 'book', color: 'text-on-surface-variant', bg: 'bg-surface-container-highest' },
          { label: t('mastery.stats.mastered'), value: stats.mastered, icon: 'verified', color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: t('mastery.stats.due'), value: stats.due, icon: 'schedule', color: 'text-primary', bg: 'bg-primary/10' },
          { label: t('mastery.stats.orphaned'), value: stats.orphaned, icon: 'broken_image', color: 'text-red-500', bg: 'bg-red-50' },
          { label: t('mastery.stats.weak'), value: stats.weak, icon: 'trending_down', color: 'text-red-400', bg: 'bg-red-50' }
        ].map(s => (
          <div key={s.label} className="p-5 bg-surface rounded-2xl sun-drenched-shadow flex items-center gap-4 group hover:scale-[1.02] transition-all">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined font-variation-fill text-2xl">{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-on-surface leading-none">{s.value}</p>
              <p className="text-[10px] font-normal text-on-surface-variant/60 uppercase tracking-widest mt-1.5">{s.label}</p>
            </div>
          </div>
        )) : (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-surface-container-low animate-pulse rounded-2xl w-full" />
          ))
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {(['all', 'due', 'weak', 'orphaned', 'mastered'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-8 py-3 rounded-full font-semibold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              activeFilter === f 
                ? 'bg-secondary text-on-secondary sun-drenched-shadow scale-105' 
                : 'bg-surface-container text-on-surface-variant/60 hover:bg-surface-container-highest hover:text-on-surface'
            }`}
          >
            {t(`mastery.filters.${f}`)}
          </button>
        ))}
      </div>

      {/* Word Table */}
      <div className="bg-surface rounded-3xl sun-drenched-shadow overflow-hidden mb-12">
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


