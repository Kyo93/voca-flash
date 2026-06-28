import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchRoadmaps } from '../../lib/storage/roadmap'
import type { Roadmap } from '../../lib/types'
import type { FilterType } from '../../hooks/useMasteryWords'

interface ScholarlyFilterBarProps {
  onFilterChange: (filters: {
    roadmapId: string | null
    pos: string | null
    stability: string | null
    sortBy: string
  }) => void
  activeFilter: FilterType
  setActiveFilter: (filter: FilterType) => void
}

export default function ScholarlyFilterBar({
  onFilterChange,
  activeFilter,
  setActiveFilter
}: ScholarlyFilterBarProps) {
  const { t } = useTranslation()
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [selectedRoadmap, setSelectedRoadmap] = useState<string | null>(null)
  const [selectedStability, setSelectedStability] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('date')

  useEffect(() => {
    fetchRoadmaps().then(setRoadmaps).catch(console.error)
  }, [])

  useEffect(() => {
    onFilterChange({
      roadmapId: selectedRoadmap,
      pos: null,
      stability: selectedStability,
      sortBy
    })
  }, [selectedRoadmap, selectedStability, sortBy, onFilterChange])

  const stabilityOptions = [
    { value: 'fresh', label: t('mastery.filters.stability.fresh') },
    { value: 'learning', label: t('mastery.filters.stability.learning') },
    { value: 'mastered', label: t('mastery.filters.stability.mastered') },
    { value: 'rooted', label: t('mastery.filters.stability.rooted') }
  ]

  const sortOptions = [
    { value: 'date', label: t('mastery.filters.sort.date') },
    { value: 'stability', label: t('mastery.filters.sort.stability') },
    { value: 'alphabetical', label: t('mastery.filters.sort.alphabetical') }
  ]

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      {/* Horizontal Filter Selectors */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Roadmap Selector */}
        <div className="relative group">
          <select
            value={selectedRoadmap || ''}
            onChange={(e) => setSelectedRoadmap(e.target.value || null)}
            className="appearance-none pl-4 pr-10 py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-medium text-xs rounded-full transition-all cursor-pointer focus:ring-2 focus:ring-primary/20 outline-hidden"
          >
            <option value="">{t('mastery.filters.allRoadmaps')}</option>
            {roadmaps.map(roadmap => (
              <option key={roadmap.id} value={roadmap.id}>{roadmap.name}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm pointer-events-none group-hover:text-primary transition-colors">expand_more</span>
        </div>

        {/* Stability Selector */}
        <div className="relative group">
          <select
            value={selectedStability || ''}
            onChange={(e) => setSelectedStability(e.target.value || null)}
            className="appearance-none pl-4 pr-10 py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-medium text-xs rounded-full transition-all cursor-pointer focus:ring-2 focus:ring-primary/20 outline-hidden"
          >
            <option value="">{t('mastery.filters.allStability')}</option>
            {stabilityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm pointer-events-none group-hover:text-primary transition-colors">expand_more</span>
        </div>

        {/* Legacy Quick Filters (Due/Weak) */}
        <div className="h-6 w-px bg-outline-variant/20 mx-2 hidden lg:block" />

        {(['due', 'weak'] as const).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(activeFilter === f ? 'all' : f)}
            className={`px-5 py-2.5 rounded-full text-[10px] font-semibold uppercase tracking-widest transition-all ${
              activeFilter === f
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'bg-surface-container-low text-on-surface-variant/60 hover:bg-surface-container'
            }`}
          >
            {t(`mastery.filters.${f}`)}
          </button>
        ))}
      </div>

      {/* Sort By Selector */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/40">{t('mastery.filters.sortBy')}:</span>
        <div className="relative group">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-medium text-xs rounded-full transition-all cursor-pointer focus:ring-2 focus:ring-primary/20 outline-hidden"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm pointer-events-none group-hover:text-primary transition-colors">swap_vert</span>
        </div>
      </div>
    </div>
  )
}
