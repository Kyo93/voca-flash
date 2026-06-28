import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Roadmap, Topic } from '../../lib/types'

interface TopicStats {
  total: number
  learned: number
  mastered: number
  percent: number
}

interface MobileRoadmapTopicsViewProps {
  roadmap: Roadmap
  topics: Topic[]
  stats: {
    total: number
    learned: number
    mastered: number
  }
  featuredId: string | null
  upNextId: string | null
  searchQuery: string
  getTopicStats: (topicId: string) => TopicStats
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

function studyHref(topic: Topic, roadmapId: string) {
  return `/study?topic=${topic.slug}&topicId=${topic.id}&roadmapId=${roadmapId}`
}

function topicActionLabel(t: (key: string) => string, topicStats: TopicStats, isCompleted: boolean) {
  if (isCompleted) return t('library.card.completed')
  return topicStats.percent > 0 ? t('topic.action.resume') : t('topic.action.start')
}

export default function MobileRoadmapTopicsView({
  roadmap,
  topics,
  stats,
  featuredId,
  upNextId,
  searchQuery,
  getTopicStats,
}: MobileRoadmapTopicsViewProps) {
  const { t } = useTranslation()
  const learnedPercent = stats.total > 0 ? clampPercent((stats.learned / stats.total) * 100) : 0
  const masteredPercent = stats.total > 0 ? clampPercent((stats.mastered / stats.total) * 100) : 0
  const heroTopic = !searchQuery
    ? topics.find((topic) => topic.id === upNextId) ?? topics.find((topic) => topic.id === featuredId) ?? topics[0]
    : null
  const topicFeed = heroTopic ? topics.filter((topic) => topic.id !== heroTopic.id) : topics
  const heroStats = heroTopic ? getTopicStats(heroTopic.id) : null
  const heroCompleted = Boolean(heroStats && heroStats.total > 0 && heroStats.learned >= heroStats.total)

  return (
    <main data-mobile-roadmap-detail className="mobile-page min-h-full">
      <header className="space-y-4">
        <Link
          to="/library"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-container-low px-4 text-sm font-medium text-on-surface-variant active:scale-95"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
          {t('common.back')}
        </Link>

        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined text-xl" aria-hidden="true">
              {roadmap.slug.includes('kids') ? 'child_care' : roadmap.slug.includes('business') ? 'business_center' : 'history_edu'}
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-medium leading-tight tracking-tight text-on-surface">{roadmap.name}</h1>
            {roadmap.description && (
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-on-surface-variant">{roadmap.description}</p>
            )}
          </div>
        </div>
      </header>

      <section data-mobile-roadmap-progress className="mobile-panel mt-5 p-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">{t('roadmapDetail.mobile.progressTitle')}</p>
            <p className="mt-1 text-xl font-medium tabular-nums text-on-surface">{learnedPercent}%</p>
          </div>
          <span className="rounded-full bg-primary-container px-3 py-1 text-[11px] font-medium text-on-primary-container">
            {masteredPercent}%
          </span>
        </div>
        <div data-mobile-roadmap-stats className="mt-3 grid min-w-0 grid-cols-3 gap-2 text-center">
          <div className="min-w-0 rounded-2xl bg-surface-container-low px-2 py-2">
            <p className="text-base font-medium tabular-nums text-on-surface">{stats.total}</p>
            <p className="truncate text-[9px] font-medium uppercase tracking-tight text-on-surface-variant">{t('roadmapDetail.mobile.totalLabel')}</p>
          </div>
          <div className="min-w-0 rounded-2xl bg-secondary-container px-2 py-2 text-on-secondary-container">
            <p className="text-base font-medium tabular-nums">{stats.learned}</p>
            <p className="truncate text-[9px] font-medium uppercase tracking-tight">{t('roadmapDetail.mobile.learnedLabel')}</p>
          </div>
          <div className="min-w-0 rounded-2xl bg-primary-container px-2 py-2 text-on-primary-container">
            <p className="text-base font-medium tabular-nums">{stats.mastered}</p>
            <p className="truncate text-[9px] font-medium uppercase tracking-tight">{t('roadmapDetail.mobile.masteredLabel')}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full rounded-full bg-secondary transition-all duration-700" style={{ width: `${learnedPercent}%` }} />
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${masteredPercent}%` }} />
          </div>
        </div>
      </section>

      {heroTopic && heroStats && (
        <section
          data-mobile-topic-hero={heroTopic.id}
          className="mobile-panel mt-5 overflow-hidden p-4"
        >
          <div className="relative min-h-[188px]">
            {heroTopic.image_url && (
              <img
                src={heroTopic.image_url}
                alt={heroTopic.name}
                loading="lazy"
                className="mb-4 h-32 w-full rounded-xl object-cover"
              />
            )}
            <div className="relative flex min-h-[156px] flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-on-secondary">
                    {t('roadmap.card.upNext')}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container text-on-surface">
                    <span className="material-symbols-outlined" aria-hidden="true">{heroTopic.icon || 'auto_stories'}</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-medium leading-tight text-on-surface">{heroTopic.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-on-surface-variant">
                    {heroTopic.description || t('roadmap.card.defaultTopicDesc')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-medium uppercase text-on-surface-variant">
                  <span>{t('roadmapDetail.mobile.topicProgress')}</span>
                  <span>{heroStats.percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                  <div className="h-full rounded-full bg-secondary transition-all duration-700" style={{ width: `${clampPercent(heroStats.percent)}%` }} />
                </div>
                <Link
                  to={studyHref(heroTopic, roadmap.id)}
                  className="mobile-primary-action flex min-h-12 w-full items-center justify-center gap-2 text-sm active:scale-95"
                >
                  {topicActionLabel(t, heroStats, heroCompleted)}
                  <span className="material-symbols-outlined text-base" aria-hidden="true">play_circle</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mt-5 space-y-3">
        {topicFeed.length === 0 ? (
          <div className="rounded-3xl bg-surface-container-low p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined" aria-hidden="true">search_off</span>
            </div>
            <h2 className="mt-4 text-lg font-medium text-on-surface">{t('roadmapDetail.mobile.emptyTitle')}</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-on-surface-variant">{t('roadmapDetail.mobile.emptyDesc')}</p>
          </div>
        ) : (
          topicFeed.map((topic) => {
            const topicStats = getTopicStats(topic.id)
            const progress = clampPercent(topicStats.percent)
            const isCompleted = topicStats.total > 0 && topicStats.learned >= topicStats.total

            return (
              <Link
                key={topic.id}
                to={studyHref(topic, roadmap.id)}
                data-mobile-topic-card={topic.id}
                className="mobile-panel block p-4 transition-all active:scale-[0.99]"
              >
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
                    <span className="material-symbols-outlined" aria-hidden="true">{topic.icon || 'auto_stories'}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base font-medium leading-tight text-on-surface">{topic.name}</h2>
                      <span className="shrink-0 text-sm font-medium tabular-nums text-primary">{progress}%</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-on-surface-variant">
                      {topic.description || t('roadmap.card.defaultTopicDesc')}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between gap-3 text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                    <span>{t('topics.wordsCount', { count: topicStats.total })}</span>
                    <span className="truncate">{topicStats.mastered} {t('roadmapDetail.mobile.masteredLabel')}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                    <div className="h-full rounded-full bg-secondary transition-all duration-700" style={{ width: `${progress}%` }} />
                  </div>
                  <span className={`flex min-h-11 items-center justify-center gap-2 rounded-2xl text-sm font-medium ${
                    isCompleted
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-primary-container text-on-primary-container'
                  }`}>
                    {topicActionLabel(t, topicStats, isCompleted)}
                    {!isCompleted && <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>}
                  </span>
                </div>
              </Link>
            )
          })
        )}
      </section>
    </main>
  )
}
