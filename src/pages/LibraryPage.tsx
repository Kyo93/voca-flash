import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLibraryRoadmaps } from '../hooks/useLibraryRoadmaps'
import { useMediaQuery } from '../hooks/useMediaQuery'
import MobileLibraryView from '../components/mobile/MobileLibraryView'

export default function LibraryPage() {
  const { t } = useTranslation()
  const isMobileLibrary = useMediaQuery('(max-width: 767px)')
  const {
    roadmaps,
    roadmapStats,
    learningStates,
    loading,
    activeFilter,
    setActiveFilter,
    getCardSpecs
  } = useLibraryRoadmaps()

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
          <p className="text-on-surface-variant font-medium">{t('library.loading')}</p>
        </div>
      </div>
    )
  }

  if (isMobileLibrary) {
    return (
      <MobileLibraryView
        roadmaps={roadmaps}
        roadmapStats={roadmapStats}
        learningStates={learningStates}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        getCardSpecs={getCardSpecs}
      />
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-8 pt-10 pb-16">
      {/* Hero Section */}
      <div className="mb-12 relative flex items-end justify-between">
        <div className="relative">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl -z-10"></div>
          <span className="label-md uppercase tracking-[0.2em] text-secondary font-medium mb-3 block">{t('library.tagline')}</span>
          <h2 className="text-5xl font-semibold text-on-surface tracking-tight mb-4">{t('library.title')}</h2>
          <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
            {t('library.description')}
          </p>
        </div>
        <div className="hidden xl:block pb-2">
          <div className="flex gap-2">
            <div className="w-12 h-1 bg-primary rounded-full"></div>
            <div className="w-3 h-1 bg-stone-300 rounded-full"></div>
            <div className="w-3 h-1 bg-stone-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Categories Filter - Restyled to match new design */}
      <div className="flex flex-wrap items-center gap-3 mb-10">
        {(['All', 'Kids', 'Casual', 'Professional', 'Academic'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2 rounded-full text-xs font-medium transition-all ${activeFilter === filter
                ? 'bg-secondary text-white shadow-md'
                : 'bg-surface-container-low text-stone-500 hover:bg-surface-container'
              }`}
          >
            {t(`library.filters.${filter}`)}
          </button>
        ))}
      </div>

      {/* Roadmaps Grid */}
      <div className="asymmetric-grid">
        {roadmaps.map(roadmap => {
          const specs = getCardSpecs(roadmap)
          const isResuming = learningStates.has(roadmap.id)
          const stats = roadmapStats[roadmap.id]
          const isCompleted = stats && stats.total > 0 && stats.mastered >= stats.total

          return (
            <Link
              key={roadmap.id}
              to={`/library/${roadmap.slug}`}
              className="roadmap-card group relative bg-surface-container hover:bg-surface-container-lowest p-6 rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-start overflow-hidden border border-transparent hover:border-secondary/10"
            >
              <div className="w-full h-40 min-h-[160px] bg-secondary-container/30 rounded-xl mb-6 flex items-center justify-center overflow-hidden relative">
                <img
                  src={roadmap.image_url || specs.image}
                  alt={roadmap.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex justify-between w-full mb-3">
                <span className={`${specs.badgeClass} text-[9px] font-medium px-2 py-1 rounded uppercase tracking-wider`}>
                  {specs.badge}
                </span>
                {stats && stats.total > 0 && (
                  <span className="text-xs font-medium text-stone-500">
                    {stats.mastered} / {stats.total}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-medium mb-2 text-on-surface">{roadmap.name}</h3>
              <p className="text-on-surface-variant mb-6 text-xs leading-relaxed line-clamp-3">
                {roadmap.description || t('library.card.defaultDesc')}
              </p>

              <button className={`mt-auto w-full py-3 ${isCompleted ? 'bg-secondary/15 text-secondary' : specs.btnClass} text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95`}>
                {isCompleted ? t('library.card.completed') : isResuming ? t('library.card.resume') : t('library.card.start')}
                {!isCompleted && <span className="material-symbols-outlined text-xs">arrow_forward</span>}
              </button>
            </Link>
          )
        })}
      </div>

      {/* Assessment Footer Banner */}
      <div className="mt-12 p-8 bg-surface-container-low border border-outline/10 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">quiz</span>
          </div>
          <div>
            <h4 className="text-lg font-medium text-on-surface">{t('library.assessment.title')}</h4>
            <p className="text-on-surface-variant text-sm">{t('library.assessment.subtitle')}</p>
          </div>
        </div>
        <button className="px-8 py-3 bg-white text-primary font-medium rounded-xl border-2 border-primary/10 hover:border-primary/30 transition-all active:scale-95 shadow-sm whitespace-nowrap">
          {t('library.assessment.cta')}
        </button>
      </div>
    </div>
  )
}
