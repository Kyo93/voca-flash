import { useTranslation } from 'react-i18next'

type FilterType = 'all' | 'due' | 'weak' | 'orphaned' | 'mastered'

interface MasteryFilterTabsProps {
  activeFilter: FilterType
  setActiveFilter: (filter: FilterType) => void
}

export default function MasteryFilterTabs({ activeFilter, setActiveFilter }: MasteryFilterTabsProps) {
  const { t } = useTranslation()
  const filterTypes: FilterType[] = ['all', 'due', 'weak', 'orphaned', 'mastered']

  return (
    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
      {filterTypes.map(f => (
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
  )
}
