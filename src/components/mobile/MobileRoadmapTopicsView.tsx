import { useState } from 'react'
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
  setSearchQuery: (query: string) => void
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
  if (isCompleted) return t('roadmapDetail.mobile.reviewTopic')
  return topicStats.percent > 0 ? t('topic.action.resume') : t('topic.action.start')
}

function topicStatusKey(topicStats: TopicStats, isCompleted: boolean, isFocus: boolean) {
  if (isCompleted) return 'roadmapDetail.mobile.completedStep'
  if (topicStats.percent > 0 || isFocus) return 'roadmapDetail.mobile.currentStep'
  return 'roadmapDetail.mobile.lockedStep'
}

function topicMetaLabel(t: (key: string, values?: Record<string, unknown>) => string, topicStats: TopicStats, isCompleted: boolean) {
  if (isCompleted) return t('topics.wordsCount', { count: topicStats.total })
  if (topicStats.percent === 0) return t('topics.wordsCount', { count: topicStats.total })
  return t('roadmapDetail.mobile.remainingWords', { count: Math.max(0, topicStats.total - topicStats.learned) })
}

function topicRightLabel(t: (key: string, values?: Record<string, unknown>) => string, topicStats: TopicStats, isCompleted: boolean) {
  if (isCompleted || topicStats.percent === 0) return t('topics.wordsCount', { count: topicStats.total })
  return `${clampPercent(topicStats.percent)}%`
}

export default function MobileRoadmapTopicsView({
  roadmap,
  topics,
  stats,
  featuredId,
  upNextId,
  searchQuery,
  setSearchQuery,
  getTopicStats,
}: MobileRoadmapTopicsViewProps) {
  const { t } = useTranslation()
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null)
  const [topicSearchOpen, setTopicSearchOpen] = useState(Boolean(searchQuery))
  const learnedPercent = stats.total > 0 ? clampPercent((stats.learned / stats.total) * 100) : 0
  const masteredPercent = stats.total > 0 ? clampPercent((stats.mastered / stats.total) * 100) : 0
  const featuredTopic = topics.find((topic) => topic.id === featuredId) ?? null
  const featuredStats = featuredTopic ? getTopicStats(featuredTopic.id) : null
  const featuredCompleted = Boolean(featuredStats && featuredStats.total > 0 && featuredStats.learned >= featuredStats.total)
  const featuredInProgress = Boolean(featuredStats && featuredStats.percent > 0 && !featuredCompleted)
  const focusTopic = !searchQuery
    ? (featuredInProgress ? featuredTopic : null)
      ?? topics.find((topic) => topic.id === upNextId)
      ?? featuredTopic
      ?? topics[0]
    : null
  const focusStats = focusTopic ? getTopicStats(focusTopic.id) : null
  const focusCompleted = Boolean(focusStats && focusStats.total > 0 && focusStats.learned >= focusStats.total)

  return (
    <main data-mobile-roadmap-detail className="mobile-page min-h-full pb-8">
      <header className="space-y-3">
        <div
          data-mobile-roadmap-progress
          className="mobile-panel relative p-4"
          aria-label={t('roadmapDetail.mobile.progressTitle')}
        >
          <div className="min-w-0">
            <p className="pr-28 text-xs font-medium text-secondary">
              {t('roadmapDetail.mobile.pathLabel')}
            </p>
            <Link
              to="/library"
              className="absolute right-4 top-3 inline-flex min-h-11 items-center rounded-xl px-1 text-xs font-medium text-on-surface-variant active:scale-95"
            >
              {t('roadmapDetail.mobile.changePath')}
            </Link>
            <h1 className="mt-3 text-[1.375rem] font-semibold leading-tight tracking-tight text-on-surface">{roadmap.name}</h1>
            {roadmap.description && (
              <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-on-surface-variant/80">{roadmap.description}</p>
            )}
          </div>
          <div data-mobile-roadmap-stats className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xl font-medium tabular-nums text-on-surface">{learnedPercent}%</p>
              <p className="text-xs font-medium text-on-surface-variant">
                {t('roadmapDetail.mobile.summaryHint', { learned: stats.learned, total: stats.total })}
              </p>
            </div>
            <span className="rounded-full bg-primary-container px-3 py-1 text-[11px] font-medium text-on-primary-container">
              {masteredPercent}% {t('roadmapDetail.mobile.masteredLabel')}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full rounded-full bg-secondary transition-all duration-700" style={{ width: `${learnedPercent}%` }} />
          </div>
        </div>
      </header>

      {focusTopic && focusStats && (
        <section
          data-mobile-topic-hero={focusTopic.id}
          data-mobile-topic-focus="true"
          className={`relative mt-4 min-h-48 overflow-hidden rounded-3xl border border-outline-variant ${
            focusTopic.image_url ? 'bg-on-surface text-surface' : 'bg-surface-container-lowest text-on-surface'
          }`}
        >
          {focusTopic.image_url && (
            <>
              <img
                src={focusTopic.image_url}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-on-surface/40" aria-hidden="true" />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-on-surface/70 to-transparent" aria-hidden="true" />
            </>
          )}

          <div className="relative flex min-h-48 flex-col justify-between p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-xs font-medium ${
                  focusTopic.image_url ? 'text-surface/80' : 'text-primary'
                }`}>
                  {t(topicStatusKey(focusStats, focusCompleted, true))}
                </p>
                <h2 className={`mt-1 text-xl font-medium leading-tight ${
                  focusTopic.image_url ? 'text-surface' : 'text-on-surface'
                }`}>
                  {focusTopic.name}
                </h2>
                <p className={`mt-1 line-clamp-1 text-sm font-medium leading-5 ${
                  focusTopic.image_url ? 'text-surface/80' : 'text-on-surface-variant'
                }`}>
                  {focusTopic.description || t('roadmap.card.defaultTopicDesc')}
                </p>
              </div>
              {!focusTopic.image_url && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-primary">
                <span className="material-symbols-outlined text-xl" aria-hidden="true">{focusTopic.icon || 'auto_stories'}</span>
              </div>
              )}
            </div>

            <div className="space-y-3 pr-14">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className={focusTopic.image_url ? 'text-surface/80' : 'text-on-surface-variant'}>
                  {t('roadmapDetail.mobile.remainingWords', { count: Math.max(0, focusStats.total - focusStats.learned) })}
                </span>
                <span className={focusTopic.image_url ? 'text-surface' : 'text-on-surface'}>{clampPercent(focusStats.percent)}%</span>
              </div>
              <div className={`h-1.5 overflow-hidden rounded-full ${
                focusTopic.image_url ? 'bg-surface/25' : 'bg-surface-container-high'
              }`}>
                <div className="h-full rounded-full bg-secondary transition-all duration-700" style={{ width: `${clampPercent(focusStats.percent)}%` }} />
              </div>
              <Link
                to={studyHref(focusTopic, roadmap.id)}
                aria-label={topicActionLabel(t, focusStats, focusCompleted)}
                className={`absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-medium shadow-sm active:scale-95 ${
                  focusTopic.image_url
                    ? 'bg-primary text-on-primary'
                    : 'bg-primary text-on-primary'
                }`}
              >
                <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section data-mobile-roadmap-topic-list className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <h2 className="text-sm font-medium text-on-surface">
            {t('roadmapDetail.mobile.chapterTitle')}
          </h2>
          <button
            type="button"
            className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-xl px-2 text-xs font-medium text-on-surface-variant active:scale-95"
            aria-label={topicSearchOpen ? t('roadmapDetail.mobile.closeTopicSearch') : t('roadmapDetail.mobile.openTopicSearch')}
            onClick={() => {
              if (topicSearchOpen && searchQuery) setSearchQuery('')
              setTopicSearchOpen(!topicSearchOpen)
            }}
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              {topicSearchOpen ? 'close' : 'search'}
            </span>
            <span>{t('roadmapDetail.mobile.searchAction')}</span>
          </button>
        </div>
        {topicSearchOpen && (
          <div className="relative mb-3">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/45" aria-hidden="true">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('roadmapDetail.mobile.topicSearchPlaceholder')}
              className="mobile-input min-h-11 w-full pl-12 pr-4 text-sm font-medium outline-hidden transition"
            />
          </div>
        )}
        {topics.length === 0 ? (
          <div className="rounded-3xl bg-surface-container-low p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined" aria-hidden="true">search_off</span>
            </div>
            <h2 className="mt-4 text-lg font-medium text-on-surface">{t('roadmapDetail.mobile.emptyTitle')}</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-on-surface-variant">{t('roadmapDetail.mobile.emptyDesc')}</p>
          </div>
        ) : (
          <div className="space-y-2">
          {topics.map((topic) => {
            const topicStats = getTopicStats(topic.id)
            const progress = clampPercent(topicStats.percent)
            const isCompleted = topicStats.total > 0 && topicStats.learned >= topicStats.total
            const isFocus = topic.id === focusTopic?.id
            const isExpanded = expandedTopicId === topic.id

            return (
              <article
                key={topic.id}
                data-mobile-topic-card={topic.id}
                data-mobile-topic-chapter-row="true"
                className={`relative overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest transition-all ${
                  isFocus ? 'border-primary/35 bg-primary-container/30' : ''
                }`}
              >
                {isFocus && <span className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-primary" aria-hidden="true" />}
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? t('roadmapDetail.mobile.collapseTopic') : t('roadmapDetail.mobile.expandTopic')}
                  className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left active:scale-[0.99]"
                  onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                >
                  <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    isCompleted
                      ? 'bg-secondary text-on-secondary'
                      : isFocus
                        ? 'bg-primary-container text-primary'
                        : 'bg-surface-container-low text-on-surface-variant'
                  }`}>
                    {topic.image_url ? (
                      <>
                        <img
                          src={topic.image_url}
                          alt=""
                          loading="lazy"
                          className="h-full w-full rounded-2xl object-cover"
                        />
                        <div className={`absolute inset-0 ${
                          isCompleted ? 'rounded-2xl bg-on-surface/5' : isFocus ? 'rounded-2xl bg-primary/20' : 'rounded-2xl bg-on-surface/15'
                        }`} aria-hidden="true" />
                        {isCompleted && (
                          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-on-secondary ring-2 ring-surface-container-lowest" aria-hidden="true">
                            <span className="material-symbols-outlined text-[13px] leading-none">check</span>
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="material-symbols-outlined text-lg" aria-hidden="true">
                        {isCompleted ? 'check' : topic.icon || 'auto_stories'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="truncate text-base font-medium leading-tight text-on-surface">{topic.name}</h3>
                      <span className={`shrink-0 text-sm font-medium tabular-nums ${
                        isCompleted
                          ? 'text-on-surface-variant'
                          : progress > 0
                            ? 'text-primary'
                            : 'text-on-surface-variant/60'
                      }`}>
                        {topicRightLabel(t, topicStats, isCompleted)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className={`truncate text-xs font-medium ${
                        isFocus ? 'text-primary' : 'text-on-surface-variant'
                      }`}>
                        {t(topicStatusKey(topicStats, isCompleted, isFocus))}
                      </p>
                      {progress > 0 && !isCompleted && (
                        <p className="truncate text-xs font-medium text-on-surface-variant/70">
                          {topicMetaLabel(t, topicStats, isCompleted)}
                        </p>
                      )}
                    </div>
                    {progress > 0 && (
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-container-high">
                        <div className="h-full rounded-full bg-secondary transition-all duration-700" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                  <span className={`material-symbols-outlined shrink-0 text-lg text-on-surface-variant transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`} aria-hidden="true">
                    expand_more
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="overflow-hidden rounded-3xl bg-surface-container-low">
                      <div className="relative h-32 overflow-hidden bg-primary-container text-primary">
                          {topic.image_url ? (
                            <>
                              <img
                                src={topic.image_url}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-on-surface/25" aria-hidden="true" />
                              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-on-surface/60 to-transparent" aria-hidden="true" />
                            </>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary-container">
                              <span className="material-symbols-outlined text-[2rem]" aria-hidden="true">{topic.icon || 'auto_stories'}</span>
                            </div>
                          )}
                        <div className="absolute left-3 top-3 rounded-full bg-surface-container-lowest/90 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-on-surface">
                          {t(topicStatusKey(topicStats, isCompleted, isFocus))}
                        </div>
                        {topicStats.total > 0 && (
                          <div className="absolute bottom-3 right-3 rounded-full bg-surface-container-lowest/90 px-3 py-1 text-xs font-medium tabular-nums text-on-surface">
                            {progress}%
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <p className="line-clamp-2 text-sm font-medium leading-5 text-on-surface">
                          {topic.description || t('roadmap.card.defaultTopicDesc')}
                        </p>

                        {topicStats.total > 0 ? (
                          <div className="mt-3 grid grid-cols-3 gap-1.5">
                            <div className="rounded-2xl bg-surface-container-lowest px-2 py-2 text-center">
                              <p className="text-sm font-medium tabular-nums text-on-surface">{topicStats.total}</p>
                              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-on-surface-variant/70">{t('roadmapDetail.mobile.totalLabel')}</p>
                            </div>
                            <div className="rounded-2xl bg-surface-container-lowest px-2 py-2 text-center">
                              <p className="text-sm font-medium tabular-nums text-primary">{topicStats.learned}</p>
                              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-on-surface-variant/70">{t('roadmapDetail.mobile.learnedLabel')}</p>
                            </div>
                            <div className="rounded-2xl bg-surface-container-lowest px-2 py-2 text-center">
                              <p className="text-sm font-medium tabular-nums text-secondary">{topicStats.mastered}</p>
                              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-on-surface-variant/70">{t('roadmapDetail.mobile.masteredLabel')}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 rounded-2xl bg-surface-container-lowest px-3 py-3">
                            <p className="text-sm font-medium text-on-surface">{t('roadmapDetail.mobile.emptyTopicTitle')}</p>
                            <p className="mt-1 text-xs font-medium leading-5 text-on-surface-variant">{t('roadmapDetail.mobile.emptyTopicDesc')}</p>
                          </div>
                        )}

                        {topicStats.total > 0 ? (
                          <Link
                            to={studyHref(topic, roadmap.id)}
                            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-medium text-on-primary active:scale-95"
                          >
                            {topicActionLabel(t, topicStats, isCompleted)}
                            <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-surface-container-high px-4 text-sm font-medium text-on-surface-variant/60"
                          >
                            {t('roadmapDetail.mobile.comingSoon')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
          </div>
        )}
      </section>

    </main>
  )
}
