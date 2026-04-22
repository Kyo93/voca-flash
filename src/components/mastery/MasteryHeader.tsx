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
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
      <div className="space-y-4">
        <div className="flex flex-col">
          <span className="label-md uppercase tracking-[0.3em] text-secondary font-bold mb-2">{t('mastery.filters.lexicalArchive')}</span>
          <h1 className="text-5xl font-black text-on-surface tracking-tighter leading-none">{t('mastery.title')}</h1>
        </div>
        <p className="text-on-surface-variant font-medium max-w-xl leading-relaxed h-6">
          {loading && totalCount === 0 ? (
            <span className="inline-block w-48 h-4 bg-surface-container-highest animate-pulse rounded-full" />
          ) : (
            t('mastery.subtitle', { count: totalCount })
          )}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
        <div className="relative group flex-1 sm:flex-none">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text"
              placeholder={t('nav.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 bg-surface-container-lowest border-none rounded-2xl shadow-sun-drenched input-tactile-focus transition-all w-full md:w-80 font-bold text-sm"
            />
        </div>
        
        <button 
          onClick={onStartFreeStudy}
          className="px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95 primary-gradient text-on-primary shadow-sun-drenched group"
        >
          <span className="material-symbols-outlined font-variation-fill group-hover:rotate-12 transition-transform">bolt</span>
          <span>{selectedIdsSize > 0 ? t('mastery.freeStudy', { count: selectedIdsSize }) : t('mastery.filters.flashReview')}</span>
        </button>
      </div>
    </div>
  )
}
