import { useState, useEffect, useCallback } from 'react'
import { getUserVocabulary, getMasteryStats } from '../lib/storage/mastery'
import { MasteryWord, MasteryStats } from '../lib/types'
import { useInfiniteScroll } from './useInfiniteScroll'
import { MASTERY_CONFIG } from '../lib/constants'

export type FilterType = 'all' | 'due' | 'weak' | 'orphaned' | 'mastered'

interface AdvancedFilters {
  topicId: string | null
  pos: string | null
  stability: string | null
  abcLetter: string | null
  sortBy: string
}

interface UseMasteryWordsProps {
  userId: string | undefined
}

export function useMasteryWords({ userId }: UseMasteryWordsProps) {
  // Data State
  const [words, setWords] = useState<MasteryWord[]>([])
  const [stats, setStats] = useState<MasteryStats | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // UI Flow State
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // Filter/Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    topicId: null,
    pos: null,
    stability: null,
    abcLetter: null,
    sortBy: MASTERY_CONFIG.DEFAULT_SORT_BY
  })

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const PAGE_SIZE = MASTERY_CONFIG.DEFAULT_PAGE_SIZE

  // 1. Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, MASTERY_CONFIG.DEBOUNCE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // 2. Fetch Stats & Reset on filter/search change
  useEffect(() => {
    if (!userId) return
    setPage(0)
    setWords([])
    setHasMore(true)

    async function loadStats() {
      if (!userId) return
      const s = await getMasteryStats(userId)
      setStats(s)
    }
    loadStats()
  }, [userId, debouncedSearch, activeFilter, advancedFilters])

  // 3. Re-fetch everything when page becomes visible
  useEffect(() => {
    if (!userId) return

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setPage(0)
        setWords([])
        setHasMore(true)
        getMasteryStats(userId).then(s => setStats(s))
        loadData(0)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [userId])

  // 5. Fetch Data (Paginated)
  const loadData = useCallback(async (pageNum: number) => {
    if (!userId) return
    const isInitial = pageNum === 0
    
    if (isInitial) setLoading(true)
    else setLoadingMore(true)

    try {
      const { data, total } = await getUserVocabulary(userId, {
        limit: PAGE_SIZE,
        offset: pageNum * PAGE_SIZE,
        search: debouncedSearch,
        filter: activeFilter,
        letter: advancedFilters.abcLetter || ''
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
  }, [userId, debouncedSearch, activeFilter, advancedFilters.abcLetter, PAGE_SIZE])

  useEffect(() => {
    loadData(page)
  }, [loadData, page])

  // 6. Infinite Scroll Observer
  const { lastElementRef } = useInfiniteScroll({
    loading: loading || loadingMore,
    hasMore,
    onLoadMore: () => setPage(prev => prev + 1)
  })

  // Handlers
  const handleFilterChange = useCallback((filters: Partial<AdvancedFilters>) => {
    setAdvancedFilters(prev => ({ ...prev, ...filters }))
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === words.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(words.map(w => w.word_id)))
    }
  }, [selectedIds.size, words])

  const toggleSelect = useCallback((id: string, e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return {
    words,
    stats,
    totalCount,
    loading,
    loadingMore,
    hasMore,
    page,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    advancedFilters,
    setAdvancedFilters,
    selectedIds,
    setSelectedIds,
    lastElementRef,
    handleFilterChange,
    toggleSelectAll,
    toggleSelect
  }
}
