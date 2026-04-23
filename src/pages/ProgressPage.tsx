import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAnalytics } from '../hooks/useAnalytics'
import RoadmapForecast from '../components/progress/RoadmapForecast'
import WeakWordsList from '../components/progress/WeakWordsList'
import BadgeGallery from '../components/progress/BadgeGallery'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import MasterySunburst from '../components/progress/MasterySunburst'
import { PROGRESS_THRESHOLDS } from '../lib/constants'
import { getUserLevel, getRetentionDisplay, getGreetingKey } from '../lib/progress-utils'

export default function ProgressPage() {
  const { t } = useTranslation()
  const { data, isLoading, error } = useAnalytics()
  const { initialData } = useAuth()
  const reviewCount = initialData?.global_review_count ?? 0
  // Source-of-truth for "new words today": health.new_today (count of NEW SRS
  // records created since 4am Asia/Ho_Chi_Minh). Must match Dashboard's
  // DailyMissionCard — do NOT derive from review_activity (which counts review
  // actions in UTC, leading to mismatch between the two pages).
  const wordsToday = initialData?.health?.new_today ?? 0

  const { totalWords, retentionInfo, userLevel, greetingKey } = useMemo(() => {
    const masteryDistribution = data?.mastery_distribution || {}
    const total = (masteryDistribution.new || 0) + (masteryDistribution.learning || 0) + (masteryDistribution.review || 0) + (masteryDistribution.relearning || 0)
    const info = getRetentionDisplay(data?.retention_rate ?? 0, data?.review_activity)
    const level = getUserLevel(total, data?.retention_rate ?? 0)
    
    const currentHour = new Date().getHours()
    const gKey = getGreetingKey(currentHour)
    
    return { totalWords: total, retentionInfo: info, userLevel: level, greetingKey: gKey }
  }, [data])

  if (isLoading) return <div className="p-12 animate-pulse text-stone-400 font-medium">{t('progress.loading')}</div>
  if (error) return <div className="p-12 text-red-500">{t('progress.error')}</div>
  if (!data) return null

  return (
    <div className="min-h-screen bg-surface">
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-8">

        {/* Hero Header */}
        <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-on-surface mb-2">
              {t(greetingKey)}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <p className="text-lg text-on-surface-variant">
                {t('progress.subtitle_scholar')}
              </p>
              {typeof reviewCount === 'number' && (
                <Link 
                  to="/review"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm-accent text-white text-sm font-bold rounded-full hover:opacity-90 transition-opacity shadow-sm"
                >
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  {t('progress.words_due', { count: reviewCount })}
                </Link>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
              {t('progress.current_level')}
            </p>
            <p className="text-3xl font-bold bg-linear-to-r from-primary to-primary-dim bg-clip-text text-transparent">
              {userLevel}
            </p>
          </div>
        </section>

        {/* 4 Key Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Words Learned */}
          <div className="bg-surface-container-lowest rounded-xl p-7 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)] hover:bg-surface-container-low transition-colors group">
            <div className="flex justify-between items-start mb-5">
              <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-white">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>book</span>
              </div>
              {wordsToday > 0 && (
                <span className="text-secondary font-medium bg-secondary-container/30 px-3 py-1 rounded-full text-xs">
                  +{wordsToday} {t('progress.today_label')}
                </span>
              )}
            </div>
            <h3 className="text-4xl font-bold text-on-surface mb-1">{totalWords.toLocaleString()}</h3>
            <p className="text-on-surface-variant font-medium text-sm">{t('progress.vocab_learned')}</p>
          </div>

          {/* Mastered Words */}
          <div className="bg-surface-container-lowest rounded-xl p-7 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)] hover:bg-surface-container-low transition-colors group">
            <div className="flex justify-between items-start mb-5">
              <div className="w-11 h-11 rounded-full bg-success flex items-center justify-center text-white">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              {data.mastered_count > 0 && (
                <span className="text-success font-medium bg-success-container px-3 py-1 rounded-full text-xs">
                  {Math.round((data.mastered_count / totalWords) * 100)}%
                </span>
              )}
            </div>
            <h3 className="text-4xl font-bold text-on-surface mb-1">{data.mastered_count.toLocaleString()}</h3>
            <p className="text-on-surface-variant font-medium text-sm">{t('progress.masteredWords')}</p>
          </div>

          {/* Streak */}
          <div className="bg-surface-container-lowest rounded-xl p-7 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)] hover:bg-surface-container-low transition-colors group">
            <div className="flex justify-between items-start mb-5">
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </div>
              {data.streak_days >= PROGRESS_THRESHOLDS.STREAK_RECORD && (
                <span className="text-primary font-medium bg-primary-container/20 px-3 py-1 rounded-full text-xs">
                  {t('progress.new_record')}
                </span>
              )}
            </div>
            <h3 className="text-4xl font-bold text-on-surface mb-1">{data.streak_days}</h3>
            <p className="text-on-surface-variant font-medium text-sm">{t('progress.streak_label')}</p>
          </div>

          {/* Retention */}
          <div className="bg-surface-container-lowest rounded-xl p-7 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)] hover:bg-surface-container-low transition-colors group">
            <div className="flex justify-between items-start mb-5">
              <div className="w-11 h-11 rounded-full bg-warm-accent flex items-center justify-center text-white">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <span className="text-warm-accent font-medium bg-warm-accent-container/20 px-3 py-1 rounded-full text-xs">
                {!retentionInfo.hasData
                  ? t('progress.no_data')
                  : retentionInfo.percent >= PROGRESS_THRESHOLDS.STABLE_RETENTION
                    ? t('progress.stable')
                    : t('progress.needs_work')}
              </span>
            </div>
            <h3 className="text-4xl font-bold text-on-surface mb-1">
              {retentionInfo.hasData ? `${retentionInfo.percent}%` : '—'}
            </h3>
            <p className="text-on-surface-variant font-medium text-sm">{t('progress.retention_metric')}</p>
          </div>
        </section>

        {/* Bento Grid: Roadmap + Mentor */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roadmap Forecast - 2 cols */}
          <div className="lg:col-span-2">
            <RoadmapForecast
              velocity={data.learning_velocity}
              totalWords={totalWords}
              masteredWords={data.mastered_count}
            />
          </div>

          {/* Mentor Advice - 1 col */}
          <div className="bg-secondary text-on-secondary rounded-xl p-7 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <span className="material-symbols-outlined absolute -top-4 -right-4 text-8xl opacity-10" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-secondary-container mb-5">
                {t('progress.mentor_advice_title')}
              </h3>
              <p className="text-lg font-medium leading-relaxed mb-6">
                "{t('progress.mentor_quote')}"
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary-container text-lg font-bold">
                E
              </div>
              <div>
                <p className="font-bold text-on-secondary text-sm">{t('progress.mentor_name')}</p>
                <p className="text-xs text-secondary-container">{t('progress.mentor_role')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Weak Areas + Knowledge Structure + Achievements */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - 2 parts */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weak Areas */}
            <WeakWordsList words={data.weak_words} />

            {/* Knowledge Structure Donut */}
            <MasterySunburst topicStats={data.topic_stats} />
          </div>

          {/* Achievements */}
          <div>
            <BadgeGallery
              streak={data.streak_days}
              totalMastered={data.mastered_count}
              totalTimeMs={data.total_time_ms}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
