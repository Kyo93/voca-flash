import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CharacterCollectionView } from '../../lib/characters'
import type { InitialAppData, Topic, UserProfile } from '../../lib/types'
import CharacterReactionAvatar from '../characters/CharacterReactionAvatar'

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
  profile,
  initialData,
  reviewCount,
  newTodayTotal,
  dailyGoal,
  primaryTopic,
  isResume,
  currentQuote,
  collection,
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
  const displayName = profile?.display_name?.trim()
  const hasResumeTopic = isResume && !!primaryTopic
  const nextHref = hasResumeTopic ? buildStudyUrl(primaryTopic) : '/library'
  const nextTitle = hasResumeTopic ? primaryTopic.name : t('home.mobile.startTitle')
  const retentionQualityKey = retentionRate >= 0.8
    ? 'home.mobile.retentionExcellent'
    : retentionRate >= 0.6
      ? 'home.mobile.retentionGood'
      : retentionRate > 0
        ? 'home.mobile.retentionNeedsWork'
        : 'common.no_data'

  return (
    <section
      className="mobile-page flex flex-col gap-3"
      data-mobile-dashboard="true"
      data-mobile-today-dashboard="true"
    >
      <article
        className={`mobile-panel relative overflow-hidden ${heroMode === 'review' ? 'flex items-center gap-3 px-4 py-3' : 'p-4'}`}
        data-mobile-today-hero={heroMode}
      >
        {heroMode === 'review' ? (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-secondary">
                {t('home.mobile.activeRecallLabel')}
              </p>
              <h3 className="mt-1 text-lg font-semibold leading-tight tracking-tight text-on-surface">
                {t('home.mobile.reviewDueToday', { count: reviewCount })}
              </h3>
            </div>
            <Link
              to={heroHref}
              className="mobile-primary-action flex min-h-12 shrink-0 items-center justify-center gap-1.5 px-4 text-sm transition-transform active:scale-95"
            >
              {t('home.mobile.reviewShortCta')}
              <span aria-hidden="true" className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </>
        ) : (
          <>
            <div className="relative flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-secondary">
                  {isResume ? t('home.mobile.trackingLabel') : t('home.mobile.suggestionLabel')}
                </p>
                <h3 className="mt-1.5 text-lg font-medium leading-tight text-on-surface">
                  {t(heroTitleKey)}
                </h3>
                {primaryTopic && (
                  <p className="mt-1 truncate text-sm font-medium text-primary">
                    {primaryTopic.name}
                  </p>
                )}
                <p className="mt-1 max-w-56 truncate text-xs font-medium text-on-surface-variant">
                  {t(heroDescKey, { count: reviewCount })}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-primary">
                <span aria-hidden="true" className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {heroMode === 'learn' ? 'school' : 'auto_stories'}
                </span>
              </div>
            </div>

            <Link
              to={heroHref}
              className="mobile-primary-action relative mt-3 flex min-h-11 items-center justify-center gap-2 px-4 text-sm transition-transform active:scale-95"
            >
              {t(heroCtaKey)}
              <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </>
        )}
      </article>

      <figure
        className="mobile-panel flex min-h-20 items-center justify-between gap-3 overflow-hidden px-4 py-3"
        data-mobile-motivation-strip="true"
      >
        <div className="min-w-0 flex-1">
          <figcaption className="text-[11px] font-medium leading-4 text-primary">
            {displayName
              ? t('home.mobile.greetingName', { name: displayName })
              : t('home.readyToday')}
          </figcaption>
          <blockquote className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-on-surface">
            “{currentQuote}”
          </blockquote>
          <Link
            to={nextHref}
            className="mt-2 inline-flex min-h-7 items-center rounded-full bg-primary-container px-3 text-[11px] font-medium text-on-primary-container"
          >
            {t('home.mobile.quickStudy')}
          </Link>
        </div>
        <CharacterReactionAvatar
          collection={collection}
          animationState="idle"
          animated
          size="sm"
          className="flex h-16 w-16 shrink-0 items-center justify-center"
        />
      </figure>

      <div className="grid grid-cols-2 gap-3">
        <div
          className="mobile-panel p-3"
          data-mobile-daily-progress={progressPct}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-on-surface-variant">
              {t('home.dailyMission')}
            </p>
            <span aria-hidden="true" className="material-symbols-outlined text-base text-primary">target</span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="text-lg font-medium leading-none text-primary">
              {newTodayTotal}
              <span className="text-xs font-medium text-on-surface-variant/45"> / {dailyGoal}</span>
            </p>
            <p className="text-[10px] font-medium text-on-surface-variant/55">
              {progressPct}%
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="mt-1.5 truncate text-[10px] font-medium text-on-surface-variant/60">
            {t('home.mobile.missionHint', { count: newTodayTotal })}
          </p>
        </div>

        <div className="mobile-panel p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-on-surface-variant">
              {t('home.retention')}
            </p>
            <span aria-hidden="true" className="material-symbols-outlined text-base text-secondary">psychology</span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="text-lg font-medium leading-none text-on-surface">
              {retentionRate > 0 ? `${Math.round(retentionRate * 100)}%` : '—'}
              {retentionRate > 0 && (
                <span className="ml-1 text-[10px] font-medium text-secondary">
                  · {t(retentionQualityKey)}
                </span>
              )}
            </p>
            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full bg-secondary transition-all"
                style={{ width: `${retentionRate > 0 ? Math.round(retentionRate * 100) : 0}%` }}
              />
            </div>
          </div>
          <p className="mt-1.5 truncate text-[10px] font-medium text-on-surface-variant/60">
            {retentionRate > 0
              ? t('home.mobile.stabilityHint', { days: avgStability.toFixed(1) })
              : t('common.no_data')}
          </p>
        </div>
      </div>

      <div className="mobile-panel p-3" data-mobile-forecast-panel="true">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-on-surface-variant">
              {t('home.forecast')}
            </p>
            <p className="mt-0.5 text-base font-semibold leading-tight text-on-surface">
              {t('home.mobile.forecastHint', { count: dueSoon })}
            </p>
          </div>
          <span className="rounded-full bg-surface-container-lowest/80 px-3 py-0.5 text-xs font-medium text-secondary">
            {dueSoon}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2" data-mobile-forecast-timeline="true">
          {forecastBars.map((count, index) => {
            const width = count > 0 ? Math.max(16, Math.round((count / maxForecast) * 100)) : 0
            return (
              <div
                key={index}
                className="rounded-xl bg-surface-container-lowest/55 px-2 py-1.5"
              >
                <div className="flex h-6 items-center justify-center">
                  <span className={`text-xs font-medium ${count > 0 ? 'text-on-surface' : 'text-on-surface-variant/35'}`}>
                    {count > 0 ? count : '—'}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-outline-variant/25">
                  <div
                    className="h-full rounded-full bg-secondary transition-all"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <span className="mt-1 block text-center text-[9px] font-medium text-on-surface-variant/45">
                  {index === 0
                    ? t('home.mobile.forecastToday')
                    : index === 1
                      ? t('home.mobile.forecastTomorrow')
                      : t('home.mobile.forecastPlus', { count: index })}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <article
        className={`mobile-panel relative overflow-hidden ${
          hasResumeTopic ? 'min-h-32 p-0' : 'flex items-center justify-between gap-3 p-3'
        }`}
        data-mobile-next-step="true"
      >
        {hasResumeTopic && primaryTopic ? (
          <>
            {primaryTopic.image_url && (
              <>
                <img
                  src={primaryTopic.image_url}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-on-surface/45" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-on-surface/75 to-transparent" aria-hidden="true" />
              </>
            )}

            <div className={`relative flex min-h-32 flex-col justify-between p-4 ${
              primaryTopic.image_url ? 'text-surface' : 'text-on-surface'
            }`}>
              <div className="max-w-[76%]">
                <p className={`text-xs font-medium ${
                  primaryTopic.image_url ? 'text-surface/80' : 'text-primary'
                }`}>
                  {t('home.mobile.nextStep')}
                </p>
                <h3 className="mt-1 text-xl font-semibold leading-tight tracking-tight">
                  {nextTitle}
                </h3>
                <p className={`mt-1 line-clamp-2 text-sm font-medium leading-5 ${
                  primaryTopic.image_url ? 'text-surface/80' : 'text-on-surface-variant'
                }`}>
                  {primaryTopic.description || t('home.mobile.nextStepHint')}
                </p>
              </div>

              <div className="flex items-end justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  primaryTopic.image_url
                    ? 'bg-surface/20 text-surface'
                    : 'bg-primary-container text-on-primary-container'
                }`}>
                  {t('home.mobile.quickStudyCta')}
                </span>
                <Link
                  to={nextHref}
                  aria-label={t('home.mobile.quickStudyCta')}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-transform active:scale-95"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-xl">arrow_forward</span>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="min-w-0">
              <p className="text-xs font-medium text-on-surface-variant">
                {t('home.mobile.nextStep')}
              </p>
              <h3 className="mt-1 truncate text-sm font-medium text-on-surface">
                {nextTitle}
              </h3>
              <p className="mt-0.5 truncate text-[11px] font-medium text-on-surface-variant/60">
                {t('home.mobile.nextStepHint')}
              </p>
            </div>
            <Link
              to={nextHref}
              className="flex min-h-11 shrink-0 items-center justify-center rounded-full border border-primary/20 px-4 text-xs font-medium text-primary transition-transform active:scale-95"
            >
              {t('home.mobile.startCta')}
            </Link>
          </>
        )}
      </article>

    </section>
  )
}
