import { useTranslation } from 'react-i18next'

interface MasteryHeaderProps {
  totalCount: number
  loading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedIdsSize: number
  onStartFreeStudy: () => void
  notebookCount: number
  onOpenNotebook: () => void
}

export default function MasteryHeader({
  totalCount,
  loading,
  searchQuery,
  setSearchQuery,
  selectedIdsSize,
  onStartFreeStudy,
  notebookCount,
  onOpenNotebook,
}: MasteryHeaderProps) {
  const { t } = useTranslation()
  const freeStudyLabel = selectedIdsSize > 0
    ? t('mastery.freeStudy', { count: selectedIdsSize })
    : t('mastery.filters.flashReview')

  return (
    <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-start">
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
      <div
        data-testid="mastery-header-actions"
        className="flex w-full flex-col items-stretch gap-3 sm:flex-row md:w-auto md:items-center md:pt-7"
      >
        <div className="group relative flex-1 sm:flex-none">
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
          type="button"
          onClick={onOpenNotebook}
          aria-label={t('mastery.notebook.open')}
          title={t('mastery.notebook.open')}
          className="group flex h-14 min-w-[10rem] items-center justify-center gap-2 rounded-2xl bg-surface-container-lowest px-5 text-sm font-black text-secondary shadow-sun-drenched transition-all hover:-translate-y-0.5 hover:bg-secondary hover:text-on-secondary active:scale-95"
        >
          <span className="material-symbols-outlined text-[22px] group-hover:rotate-6 transition-transform">menu_book</span>
          <span className="hidden sm:inline">{t('mastery.table.notebook')}</span>
          <span className="min-w-6 h-6 px-2 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center group-hover:bg-on-secondary/20 group-hover:text-on-secondary">
            {notebookCount}
          </span>
        </button>

        <button
          type="button"
          onClick={onStartFreeStudy}
          aria-label={freeStudyLabel}
          className="group flex h-14 min-w-[10rem] items-center justify-center gap-3 whitespace-nowrap rounded-2xl px-6 text-sm font-black text-on-primary shadow-sun-drenched transition-all primary-gradient hover:-translate-y-0.5 active:scale-95"
        >
          <span className="material-symbols-outlined font-variation-fill group-hover:rotate-12 transition-transform">bolt</span>
          <span>{freeStudyLabel}</span>
        </button>
      </div>
    </div>
  )
}
