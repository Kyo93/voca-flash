import { useTranslation } from 'react-i18next'

interface MasteryHeaderProps {
  totalCount: number
  loading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedIdsSize: number
  onStartFreeStudy: () => void
}

export default function MasteryHeader({
  totalCount,
  loading,
  searchQuery,
  setSearchQuery,
  selectedIdsSize,
  onStartFreeStudy
}: MasteryHeaderProps) {
  const { t } = useTranslation()

  return (
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
          disabled={selectedIdsSize === 0}
          onClick={onStartFreeStudy}
          className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-3 transition-all shadow-lg active:scale-95 ${
            selectedIdsSize > 0 
              ? 'primary-gradient text-on-primary sun-drenched-shadow cursor-pointer' 
              : 'bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed shadow-none font-medium'
          }`}
        >
          <span className="material-symbols-outlined font-variation-fill">bolt</span>
          {t('mastery.freeStudy', { count: selectedIdsSize })}
        </button>
      </div>
    </div>
  )
}
