import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import DashboardHero from '../components/dashboard/DashboardHero'
import MemoryHealthCard from '../components/dashboard/MemoryHealthCard'
import DailyMissionCard from '../components/dashboard/DailyMissionCard'
import ForecastMiniChart from '../components/dashboard/ForecastMiniChart'
import { LAYOUT_TOKENS, DESIGN_TOKENS } from '../lib/tokens'

export default function DashboardPage() {
  const { t } = useTranslation()
  const {
    profile,
    initialData,
    loading,
    showBanner,
    dismissBanner,
    currentQuote,
    newTodayTotal,
    dailyGoal,
    growth,
    reviewCount,
    resumeTopic,
    fallback1
  } = useDashboard()

  const card1 = resumeTopic || fallback1
  const isResume = !!resumeTopic

  if (loading && !initialData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="flex-1 px-10 py-8 overflow-y-auto" style={{ maxWidth: LAYOUT_TOKENS.MAX_WIDTH, margin: '0 auto', width: '100%' }}>

      <DashboardHero
        profile={profile}
        currentQuote={currentQuote}
        showBanner={showBanner}
        setShowBanner={dismissBanner}
        t={t}
        growth={growth}
      />

      {/* Stats Row (Memory Health & Mission) */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <MemoryHealthCard
          retentionRate={initialData?.health.retention_rate ?? 0.9}
          avgStability={initialData?.health.avg_stability ?? 0}
        />

        <DailyMissionCard
          count={newTodayTotal}
          target={dailyGoal}
        />

        <ForecastMiniChart
          forecast={initialData?.health.forecast || []}
        />
      </div>

      {/* Continue Learning */}
      <div className="mt-12">
        <div className="flex justify-between items-baseline mb-8">
          <div>
            <h4 className="text-3xl font-black text-on-surface tracking-tight">{t('home.continueLearning')}</h4>
            <div className="flex items-center gap-2 mt-2">
               <span className="w-8 h-px bg-primary/20" />
               <p className="text-stone-400 font-medium text-sm italic">{t('home.continueDesc')}</p>
            </div>
          </div>
          <Link className="text-primary font-black text-[11px] uppercase tracking-widest hover:text-secondary transition-all" to="/library">{t('home.viewLibrary')}</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 — Resume or First Topic */}
          {card1 ? (
            <div className={`topic-card group bg-surface-container rounded-4xl sun-drenched-shadow overflow-hidden hover:bg-surface-container-lowest transition-all duration-500`}>
              <div className="relative h-56 overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={card1.name}
                  loading="lazy"
                  src={card1.image_url || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80"}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                <span className={`absolute bottom-4 left-4 px-3 py-1 bg-primary text-white text-[9px] font-black ${DESIGN_TOKENS.RADIUS.LG} uppercase tracking-widest`}>
                  {isResume ? t('home.tracking') : t('home.suggestion')}
                </span>
              </div>
              <div className="p-6">
                <h5 className="text-xl font-black text-on-surface mb-2">{card1.name}</h5>
                <p className="text-sm text-stone-400 mb-5 line-clamp-2">{card1.description || t('home.continueLearning')}</p>
                <div className="flex justify-between items-center">
                  <span className="text-stone-300 text-[10px] font-black uppercase tracking-[0.2em]">
                    {isResume ? t('home.unfinished') : t('home.newModule')}
                  </span>
                  <Link
                    to={`/study?topic=${card1.slug}&topicId=${card1.id}&roadmapId=${card1.roadmap_id}`}
                    className="text-secondary text-[11px] font-black uppercase tracking-wider flex items-center gap-1 hover:underline underline-offset-2"
                  >
                    {isResume ? t('home.studyNext') : t('home.explore')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className={`h-48 bg-stone-50 ${DESIGN_TOKENS.RADIUS['2XL']} animate-pulse`} />
          )}

          {/* Card 2 — Global Review */}
          <div className={`group bg-surface-container rounded-4xl sun-drenched-shadow overflow-hidden hover:bg-surface-container-lowest transition-all duration-500`}>
            <div className="relative h-56 overflow-hidden bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-7xl text-secondary opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              <div className="absolute inset-0 bg-linear-to-t from-secondary/10 to-transparent" />
              <span className={`absolute bottom-6 left-6 px-4 py-1.5 bg-secondary text-white text-[9px] font-black rounded-lg uppercase tracking-[0.2em]`}>ACTIVE RECALL</span>
            </div>
            <div className="p-6">
              <h5 className="text-xl font-black text-on-surface mb-2">{t('home.maintenanceTitle')}</h5>
              <p className="text-sm text-stone-400 mb-5 line-clamp-2">{t('home.maintenanceDesc')}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-secondary text-[11px] font-black uppercase tracking-wider">
                    {loading ? '...' : t('home.wordsDue', { count: reviewCount })}
                  </span>
                </div>
                <Link to="/review" className="text-secondary text-[11px] font-black uppercase tracking-wider flex items-center gap-1 hover:underline underline-offset-2">
                  {t('home.reviewNow')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
