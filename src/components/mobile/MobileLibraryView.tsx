import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { LibraryFilter } from '../../hooks/useLibraryRoadmaps'
import type { ResumePointer, Roadmap } from '../../lib/types'

type RoadmapStats = Record<string, { total: number; mastered: number }>

interface RoadmapCardSpecs {
  badge: string
  badgeClass: string
  btnClass: string
  image: string
}

interface MobileLibraryViewProps {
  roadmaps: Roadmap[]
  roadmapStats: RoadmapStats
  learningStates: Map<string, ResumePointer>
  activeFilter: LibraryFilter
  setActiveFilter: (filter: LibraryFilter) => void
  getCardSpecs: (roadmap: Roadmap) => RoadmapCardSpecs
}

const FILTERS: LibraryFilter[] = ['All', 'Kids', 'Casual', 'Professional', 'Academic']

function getProgress(stats: { total: number; mastered: number } | undefined) {
  if (!stats || stats.total <= 0) return 0
  return Math.min(100, Math.round((stats.mastered / stats.total) * 100))
}

export default function MobileLibraryView({
  roadmaps,
  roadmapStats,
  learningStates,
  activeFilter,
  setActiveFilter,
  getCardSpecs,
}: MobileLibraryViewProps) {
  const { t } = useTranslation()

  return (
    <main data-mobile-learn className="mobile-page min-h-full">
      <header className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">
              {t('library.mobile.availablePaths', { count: roadmaps.length })}
            </p>
            <h1 className="mt-1 text-xl font-medium tracking-tight text-on-surface">
              {t('library.mobile.title')}
            </h1>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined" aria-hidden="true">auto_stories</span>
          </div>
        </div>
        <p className="max-w-sm text-sm font-medium leading-5 text-on-surface-variant">
          {t('library.mobile.subtitle')}
        </p>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`min-h-11 rounded-full px-3 text-[13px] font-medium transition-all active:scale-95 ${
                isActive
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              {t(`library.filters.${filter}`)}
            </button>
          )
        })}
      </div>

      {roadmaps.length === 0 ? (
        <section className="mt-8 rounded-3xl bg-surface-container-low p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
            <span className="material-symbols-outlined" aria-hidden="true">search_off</span>
          </div>
          <h2 className="mt-4 text-lg font-medium text-on-surface">{t('library.mobile.emptyTitle')}</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-on-surface-variant">{t('library.mobile.emptyDesc')}</p>
        </section>
      ) : (
        <section className="mt-4 space-y-4">
          {roadmaps.map((roadmap) => {
            const specs = getCardSpecs(roadmap)
            const stats = roadmapStats[roadmap.id]
            const progress = getProgress(stats)
            const isResuming = learningStates.has(roadmap.id)
            const isCompleted = Boolean(stats && stats.total > 0 && stats.mastered >= stats.total)
            const image = roadmap.image_url || specs.image

            return (
              <Link
                key={roadmap.id}
                to={`/library/${roadmap.slug}`}
                data-mobile-roadmap-card={roadmap.id}
                className="mobile-panel group block overflow-hidden transition-all active:scale-[0.99]"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-surface-container-high">
                  <img
                    src={image}
                    alt={roadmap.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-active:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-scrim/60 to-transparent" />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span className={`${specs.badgeClass} rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider`}>
                      {specs.badge}
                    </span>
                    {isResuming && (
                      <span className="rounded-full bg-primary text-on-primary px-3 py-1 text-[10px] font-medium uppercase tracking-wider">
                        {t('library.mobile.resumeBadge')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-medium leading-tight text-on-surface">{roadmap.name}</h2>
                      <span className="shrink-0 text-base font-medium tabular-nums text-primary">{progress}%</span>
                    </div>
                    <p className="line-clamp-2 text-sm font-medium leading-6 text-on-surface-variant">
                      {roadmap.description || t('library.card.defaultDesc')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                      <span>{isCompleted ? t('library.mobile.completedHint') : t('library.mobile.progressLabel')}</span>
                      {stats && (
                        <span>
                          {stats.mastered} / {stats.total} {t('library.mobile.masteredLabel')}
                        </span>
                      )}
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className="h-full rounded-full bg-secondary transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <span className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all ${
                    isCompleted
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-primary text-on-primary'
                  }`}>
                    {isCompleted ? t('library.card.completed') : isResuming ? t('library.card.resume') : t('library.card.start')}
                    {!isCompleted && <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>}
                  </span>
                </div>
              </Link>
            )
          })}
        </section>
      )}
    </main>
  )
}
