import { useTranslation } from 'react-i18next'
import { useAnalytics } from '../hooks/useAnalytics'
import { getWordsToday, getUserLevel, getRetentionDisplay } from '../lib/progress-utils'
import RoadmapForecast from '../components/progress/RoadmapForecast'
import WeakWordsList from '../components/progress/WeakWordsList'
import BadgeGallery from '../components/progress/BadgeGallery'
import MasterySunburst from '../components/progress/MasterySunburst'

export default function ProgressPage() {
  const { t } = useTranslation()
  const { data, isLoading, error } = useAnalytics()

  if (isLoading) return <div className="p-12 animate-pulse text-stone-400 font-medium">Analyzing scholarly metrics...</div>
  if (error) return <div className="p-12 text-red-500">Error loading progress data.</div>
  if (!data) return null

  const dist = data.mastery_distribution || {}
  const totalWords = (dist.new || 0) + (dist.learning || 0) + (dist.review || 0) + (dist.relearning || 0)

  const retentionInfo = getRetentionDisplay(data.retention_rate, data.review_activity)
  const wordsToday = getWordsToday(data.review_activity)
  const userLevel = getUserLevel(totalWords, data.retention_rate)

  const greetingKey = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'progress.greeting_morning'
    if (h < 18) return 'progress.greeting_afternoon'
    return 'progress.greeting_evening'
  })()

  return (
    <div className="min-h-screen bg-surface">
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-8">

        {/* Hero Header */}
        <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-on-surface mb-2">
              {t(greetingKey, { defaultValue: 'Chào buổi sáng, Học giả.' })}
            </h1>
            <p className="text-lg text-on-surface-variant">
              {t('progress.subtitle_scholar', { defaultValue: 'Đây là phân tích tiến độ học tập chuyên sâu của bạn hôm nay.' })}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
              {t('progress.current_level', { defaultValue: 'Cấp độ hiện tại' })}
            </p>
            <p className="text-3xl font-bold bg-linear-to-r from-primary to-[#944A00] bg-clip-text text-transparent">
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
                  +{wordsToday} {t('progress.today_label', { defaultValue: 'hôm nay' })}
                </span>
              )}
            </div>
            <h3 className="text-4xl font-bold text-on-surface mb-1">{totalWords.toLocaleString()}</h3>
            <p className="text-on-surface-variant font-medium text-sm">{t('progress.vocab_learned', { defaultValue: 'Từ vựng đã học' })}</p>
          </div>

          {/* Mastered Words */}
          <div className="bg-surface-container-lowest rounded-xl p-7 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)] hover:bg-surface-container-low transition-colors group">
            <div className="flex justify-between items-start mb-5">
              <div className="w-11 h-11 rounded-full bg-[#2E7D32] flex items-center justify-center text-white">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              {data.mastered_count > 0 && (
                <span className="text-[#2E7D32] font-medium bg-[#E8F5E9] px-3 py-1 rounded-full text-xs">
                  {Math.round((data.mastered_count / totalWords) * 100)}%
                </span>
              )}
            </div>
            <h3 className="text-4xl font-bold text-on-surface mb-1">{data.mastered_count.toLocaleString()}</h3>
            <p className="text-on-surface-variant font-medium text-sm">{t('progress.masteredWords', { defaultValue: 'Từ đã nhuần nhuyễn' })}</p>
          </div>

          {/* Streak */}
          <div className="bg-surface-container-lowest rounded-xl p-7 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)] hover:bg-surface-container-low transition-colors group">
            <div className="flex justify-between items-start mb-5">
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </div>
              {data.streak_days >= 7 && (
                <span className="text-primary font-medium bg-primary-container/20 px-3 py-1 rounded-full text-xs">
                  {t('progress.new_record', { defaultValue: 'Kỷ lục mới!' })}
                </span>
              )}
            </div>
            <h3 className="text-4xl font-bold text-on-surface mb-1">{data.streak_days}</h3>
            <p className="text-on-surface-variant font-medium text-sm">{t('progress.streak_label', { defaultValue: 'Ngày liên tiếp (Streak)' })}</p>
          </div>

          {/* Retention */}
          <div className="bg-surface-container-lowest rounded-xl p-7 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)] hover:bg-surface-container-low transition-colors group">
            <div className="flex justify-between items-start mb-5">
              <div className="w-11 h-11 rounded-full bg-[#755A33] flex items-center justify-center text-white">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <span className="text-[#755A33] font-medium bg-[#B49469]/20 px-3 py-1 rounded-full text-xs">
                {!retentionInfo.hasData
                  ? t('progress.no_data', { defaultValue: 'Chưa có dữ liệu' })
                  : retentionInfo.percent >= 80
                    ? t('progress.stable', { defaultValue: 'Ổn định' })
                    : t('progress.needs_work', { defaultValue: 'Cần cải thiện' })}
              </span>
            </div>
            <h3 className="text-4xl font-bold text-on-surface mb-1">
              {retentionInfo.hasData ? `${retentionInfo.percent}%` : '—'}
            </h3>
            <p className="text-on-surface-variant font-medium text-sm">{t('progress.retention_metric', { defaultValue: 'Độ bám trí nhớ (Retention)' })}</p>
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
                {t('progress.mentor_advice_title', { defaultValue: 'Lời khuyên từ Mentor' })}
              </h3>
              <p className="text-lg font-medium leading-relaxed mb-6">
                "{t('progress.mentor_quote', { defaultValue: 'Việc học ngôn ngữ không phải là cuộc đua nước rút, mà là quá trình bồi đắp từng lớp phù sa kiến thức mỗi ngày.' })}"
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary-container text-lg font-bold">
                E
              </div>
              <div>
                <p className="font-bold text-on-secondary text-sm">GS. Eleanor Vance</p>
                <p className="text-xs text-secondary-container">{t('progress.mentor_role', { defaultValue: 'Trưởng khoa Ngôn ngữ học' })}</p>
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
