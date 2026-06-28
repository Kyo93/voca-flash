import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CharacterCollectionView } from '../../lib/characters'
import type { InitialAppData, Topic, UserProfile } from '../../lib/types'

interface MobileDashboardViewProps {
  profile: UserProfile | null
  initialData: InitialAppData | null
  reviewCount: number
  newTodayTotal: number
  dailyGoal: number
  primaryTopic: Topic | null
  isResume: boolean
  currentQuote: string
  collection: CharacterCollectionView | null
}

type HeroMode = 'review' | 'learn' | 'start'

function buildStudyUrl(topic: Topic) {
  const params = new URLSearchParams()
  params.set('topic', topic.slug)
  params.set('topicId', topic.id)
  if (topic.roadmap_id) params.set('roadmapId', topic.roadmap_id)
  return `/study?${params.toString()}`
}

export default function MobileDashboardView({
  initialData,
  reviewCount,
  newTodayTotal,
  dailyGoal,
  primaryTopic,
  isResume,
  currentQuote,
  collection: _collection,
}: MobileDashboardViewProps) {
  const { t } = useTranslation()
  const progressPct = dailyGoal > 0 ? Math.min(100, Math.round((newTodayTotal / dailyGoal) * 100)) : 0
  const retentionRate = initialData?.health.retention_rate ?? 0
  const avgStability = initialData?.health.avg_stability ?? 0
  const forecast = initialData?.health.forecast ?? []
  const dueSoon = forecast.slice(0, 5).reduce((total, count) => total + count, 0)
  const heroMode: HeroMode = reviewCount > 0 ? 'review' : primaryTopic ? 'learn' : 'start'
  const heroHref = heroMode === 'review'
    ? '/review'
    : heroMode === 'learn' && primaryTopic
      ? buildStudyUrl(primaryTopic)
      : '/library'
  const heroTitleKey = heroMode === 'review'
    ? 'home.mobile.reviewTitle'
    : heroMode === 'learn'
      ? 'home.mobile.continueTitle'
      : 'home.mobile.startTitle'
  const heroDescKey = heroMode === 'review'
    ? 'home.mobile.reviewDesc'
    : heroMode === 'learn'
      ? 'home.mobile.continueDesc'
      : 'home.mobile.startDesc'
  const heroCtaKey = heroMode === 'review'
    ? 'home.mobile.reviewCta'
    : heroMode === 'learn'
      ? 'home.mobile.continueCta'
      : 'home.mobile.startCta'

  const forecastBars = forecast.slice(0, 5)
  while (forecastBars.length < 5) forecastBars.push(0)
  const maxForecast = Math.max(...forecastBars, 1)

  return (
    <section
      className="mobile-page flex flex-col gap-4"
      data-mobile-dashboard="true"
      data-mobile-today-dashboard="true"
    >
      <article
        className="mobile-panel relative overflow-hidden p-5"
        data-mobile-today-hero={heroMode}
      >
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-widest text-secondary">
              {heroMode === 'review' ? t('home.activeRecall') : isResume ? t('home.tracking') : t('home.suggestion')}
            </p>
            <h3 className="mt-2 text-xl font-medium leading-tight text-on-surface">
              {t(heroTitleKey)}
            </h3>
            {primaryTopic && heroMode === 'learn' && (
              <p className="mt-1 truncate text-sm font-medium text-primary">
                {primaryTopic.name}
              </p>
            )}
            <p className="mt-2 max-w-52 text-sm font-medium leading-5 text-on-surface-variant">
              {t(heroDescKey, { count: reviewCount })}
            </p>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-primary">
            <span aria-hidden="true" className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {heroMode === 'review' ? 'bolt' : heroMode === 'learn' ? 'school' : 'auto_stories'}
            </span>
          </div>
        </div>

        <Link
          to={heroHref}
          className="mobile-primary-action relative mt-5 flex min-h-12 items-center justify-center gap-2 px-4 text-sm transition-transform active:scale-95"
        >
          {t(heroCtaKey)}
          <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_forward</span>
        </Link>
      </article>

      <div className="grid grid-cols-2 gap-3">
        <div
          className="mobile-panel p-4"
          data-mobile-daily-progress={progressPct}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/70">
              {t('home.dailyMission')}
            </p>
            <span aria-hidden="true" className="material-symbols-outlined text-base text-primary">target</span>
          </div>
          <p className="text-xl font-medium text-secondary">
            {newTodayTotal}
            <span className="text-sm font-medium text-on-surface-variant/45"> / {dailyGoal}</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="mt-2 text-[11px] font-medium text-on-surface-variant/60">
            {t('home.mobile.missionHint', { count: newTodayTotal })}
          </p>
        </div>

        <div className="mobile-panel p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/70">
              {t('home.retention')}
            </p>
            <span aria-hidden="true" className="material-symbols-outlined text-base text-secondary">psychology</span>
          </div>
          <p className="text-xl font-medium text-on-surface">
            {retentionRate > 0 ? `${Math.round(retentionRate * 100)}%` : '—'}
          </p>
          <p className="mt-2 text-[11px] font-medium text-on-surface-variant/60">
            {retentionRate > 0
              ? t('home.mobile.stabilityHint', { days: avgStability.toFixed(1) })
              : t('common.no_data')}
          </p>
        </div>
      </div>

      <div className="mobile-panel p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">
              {t('home.forecast')}
            </p>
            <p className="text-sm font-medium text-on-surface">
              {t('home.mobile.forecastHint', { count: dueSoon })}
            </p>
          </div>
          <span className="rounded-full bg-surface-container-lowest px-3 py-1 text-xs font-medium text-secondary">
            {dueSoon}
          </span>
        </div>
        <div className="flex h-24 items-end gap-2">
          {forecastBars.map((count, index) => {
            const height = Math.max(16, Math.round((count / maxForecast) * 100))
            return (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-16 w-full items-end rounded-full bg-surface-container-lowest/70 px-1">
                  <div
                    className={`w-full rounded-full transition-all ${count > 0 ? 'bg-primary' : 'bg-outline-variant/40'}`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[9px] font-medium text-on-surface-variant/45">{index + 1}</span>
              </div>
            )
          })}
        </div>
      </div>

      <figure className="mobile-panel p-5">
        <figcaption className="mb-2 text-[10px] font-medium uppercase tracking-widest text-primary">
          {t('home.mobile.quoteTitle')}
        </figcaption>
        <blockquote className="font-serif text-lg italic leading-7 text-on-surface-variant">
          “{currentQuote}”
        </blockquote>
      </figure>
    </section>
  )
}
