import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { AnalyticsData } from '../../hooks/useAnalytics'
import { REWARD_BADGES } from '../../lib/rewards'
import type { RewardProgressView } from '../../lib/rewards'

interface RetentionSummary {
  hasData: boolean
  percent: number
}

interface MobileProgressViewProps {
  data: AnalyticsData
  reviewCount: number
  wordsToday: number
  totalWords: number
  retentionInfo: RetentionSummary
  userLevel: string
  greetingKey: string
  rewardProgress: RewardProgressView | null
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toLocaleString() : '0'
}

export default function MobileProgressView({
  data,
  reviewCount,
  wordsToday,
  totalWords,
  retentionInfo,
  userLevel,
  greetingKey,
  rewardProgress,
}: MobileProgressViewProps) {
  const { t } = useTranslation()

  const unlockedBadges = rewardProgress?.unlockedBadges.length ?? 0
  const totalBadges = REWARD_BADGES.length
  const nextBadge = rewardProgress?.nextBadge ? t(rewardProgress.nextBadge.titleKey) : t('achievements.allXpUnlocked')
  const retentionValue = retentionInfo.hasData ? `${retentionInfo.percent}%` : t('common.no_data')
  const weakWords = data.weak_words.slice(0, 3)

  const metrics = [
    {
      key: 'words',
      icon: 'book',
      label: t('profileMobile.wordsTotal'),
      value: formatNumber(totalWords),
      hint: wordsToday > 0 ? `+${wordsToday} ${t('progress.today_label')}` : t('progress.vocab_learned'),
    },
    {
      key: 'mastered',
      icon: 'verified',
      label: t('progress.masteredWords'),
      value: formatNumber(data.mastered_count),
      hint: t('progress.current_level'),
    },
    {
      key: 'streak',
      icon: 'local_fire_department',
      label: t('progress.streak_label'),
      value: formatNumber(data.streak_days),
      hint: t('common.days'),
    },
    {
      key: 'retention',
      icon: 'psychology',
      label: t('progress.retention_metric'),
      value: retentionValue,
      hint: t('profileMobile.learningPulse'),
    },
  ]

  const links = [
    { to: '/achievements', icon: 'workspace_premium', label: t('nav.achievements') },
    { to: '/characters', icon: 'face', label: t('nav.characters') },
    { to: '/settings', icon: 'settings', label: t('nav.settings') },
  ]

  return (
    <main data-mobile-progress className="mobile-page min-h-full">
      <section className="mobile-panel p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
          {t('profileMobile.hubEyebrow')}
        </p>
        <h1 className="mt-1 text-xl font-medium leading-tight text-on-surface">
          {t('profileMobile.hubTitle')}
        </h1>
        <p className="mt-2 text-sm font-medium leading-5 text-on-surface-variant">
          {t('profileMobile.hubSubtitle')}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-primary-container/65 p-3 text-on-primary-container">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider opacity-75">
              {t('progress.current_level')}
            </p>
            <p className="mt-1 truncate text-lg font-medium">{userLevel}</p>
            <p className="mt-0.5 truncate text-xs font-medium opacity-75">{t(greetingKey)}</p>
          </div>
          {reviewCount > 0 && (
            <Link
              to="/review"
              className="flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-2xl bg-primary px-3 text-xs font-medium text-on-primary active:scale-95"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">bolt</span>
              {t('profileMobile.reviewNow')}
            </Link>
          )}
        </div>
      </section>

      <section className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-on-surface">{t('profileMobile.quickLinks')}</h2>
          <span className="text-xs font-medium text-on-surface-variant">
            {t('profileMobile.badgesUnlocked', { unlocked: unlockedBadges, total: totalBadges })}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl bg-surface-container-low p-3 text-center text-xs font-medium text-on-surface-variant active:scale-95"
            >
              <span className="material-symbols-outlined text-xl text-primary" aria-hidden="true">{link.icon}</span>
              <span className="max-w-full truncate">{link.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-2" aria-label={t('profileMobile.progressOverview')}>
        {metrics.map(metric => (
          <article key={metric.key} className="rounded-2xl bg-surface-container-lowest p-3 shadow-sm ring-1 ring-outline-variant/30">
            <div className="flex items-center justify-between gap-2">
              <span className="material-symbols-outlined text-lg text-secondary" aria-hidden="true">{metric.icon}</span>
              <span className="truncate text-[10px] font-medium uppercase tracking-tight text-on-surface-variant/65">{metric.hint}</span>
            </div>
            <p className="mt-3 text-xl font-medium tabular-nums text-on-surface">{metric.value}</p>
            <p className="mt-1 text-xs font-medium text-on-surface-variant">{metric.label}</p>
          </article>
        ))}
      </section>

      <section className="mobile-panel mt-4 p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">{t('profileMobile.nextBadge')}</p>
        <p className="mt-1 text-lg font-medium leading-tight">{nextBadge}</p>
        {rewardProgress && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant">
              <span>{t('rewards.totalXp', { xp: rewardProgress.totalXp.toLocaleString() })}</span>
              <span>{rewardProgress.levelProgress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full rounded-full bg-secondary" style={{ width: `${rewardProgress.levelProgress}%` }} />
            </div>
          </div>
        )}
      </section>

      <section className="mobile-panel mt-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant/65">
              {t('profileMobile.learningPulse')}
            </p>
            <h2 className="mt-1 text-base font-medium text-on-surface">{t('progress.weak_clusters')}</h2>
          </div>
          <Link to="/review" className="text-xs font-medium text-primary">
            {t('progress.review_now')}
          </Link>
        </div>

        <div className="mt-3 space-y-2">
          {weakWords.length === 0 ? (
            <p className="rounded-2xl bg-surface-container-low p-3 text-sm font-medium text-on-surface-variant">
              {t('profileMobile.noWeakWords')}
            </p>
          ) : weakWords.map(word => (
            <div key={word.id} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-container-low p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-on-surface">{word.word}</p>
                <p className="truncate text-xs font-medium text-on-surface-variant">{word.meaning}</p>
              </div>
              <span className="rounded-full bg-primary-container px-2 py-1 text-[11px] font-medium text-primary">
                {word.fail_count}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
