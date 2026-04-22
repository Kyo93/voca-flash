import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'
import ActivityHeatmap from '../components/ActivityHeatmap'
import FSRSBins from '../components/progress/FSRSBins'
import WorkloadForecast from '../components/progress/WorkloadForecast'
import { LAYOUT_TOKENS, DESIGN_TOKENS } from '../lib/tokens'

export default function ProgressPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    initialData,
    roadmapProgress,
    stabilityBins,
    forecastData,
    loading,
    displayName
  } = useProgress()

  if (loading && !initialData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="px-10 py-8 overflow-y-auto" style={{ maxWidth: LAYOUT_TOKENS.MAX_WIDTH, margin: '0 auto', width: '100%' }}>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-secondary tracking-tight mb-2">{t('home.masteryProgress')}</h1>
          <p className="text-stone-500 font-medium">
            {t('progress.welcome', { name: displayName.startsWith('progress.') ? t(displayName) : displayName })}
          </p>
        </div>
        <button className={`flex items-center gap-2 px-5 py-2.5 bg-stone-100 text-secondary font-bold text-xs ${DESIGN_TOKENS.RADIUS.XL} hover:bg-stone-200 transition-all uppercase tracking-widest border border-stone-200/50`}>
          <span className="material-symbols-outlined text-sm">menu_book</span>
          {t('home.roadmapJourney')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        {/* Left Column: Analytics */}
        <div className="lg:col-span-2 space-y-8">

          <FSRSBins bins={stabilityBins} />

          <WorkloadForecast forecast={forecastData} />

          {/* Arena Hero Card */}
          <div className={`relative overflow-hidden p-10 ${DESIGN_TOKENS.RADIUS['4XL']} ${DESIGN_TOKENS.SHADOW.XL} shadow-primary/10 group bg-primary-container`}>
            <div className="absolute inset-0 bg-linear-to-br from-primary to-orange-600 transition-opacity duration-700 opacity-90 group-hover:opacity-100"></div>

            <div className="relative z-10 flex flex-col gap-6">
              <div className="space-y-2">
                <div className={`inline-block px-3 py-1 bg-white/20 backdrop-blur-md ${DESIGN_TOKENS.RADIUS.XL} border border-white/30`}>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    {t('home.arena.actionRequired')}
                  </span>
                </div>
                <h2 className="text-4xl font-black text-white leading-tight">{t('home.arena.title')}</h2>
                <div className="flex items-center gap-2 text-white/90">
                  <span className="material-symbols-outlined text-lg">notifications_active</span>
                  <p className="font-medium">
                    {t('home.arena.subtitle', { count: initialData?.health.due_today ?? 0 })}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  to="/review"
                  className={`inline-flex items-center gap-3 px-10 py-4 bg-white text-primary ${DESIGN_TOKENS.RADIUS.XL} font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all`}
                >
                  {t('home.arena.cta')}
                  <span className="material-symbols-outlined text-lg font-variation-fill">bolt</span>
                </Link>
              </div>
            </div>

            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[200px] text-white/10 select-none pointer-events-none rotate-12">videogame_asset</span>
          </div>

          {/* Activity Heatmap */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <span className="material-symbols-outlined text-stone-400 text-lg">calendar_month</span>
              <h3 className="text-sm font-black text-secondary tracking-tight uppercase">{t('progress.activityHeatmap')}</h3>
            </div>
            <ActivityHeatmap streakDays={initialData?.profile?.streak_days || 0} />
            <p className="text-center text-xs text-stone-400 font-medium italic mt-2">
              {t('progress.quote')}
            </p>
          </div>
        </div>

        {/* Right Column: Roadmap Progress List */}
        <div className="space-y-6">
          <div className={`bg-white p-8 ${DESIGN_TOKENS.RADIUS['3XL']} border border-stone-100 ${DESIGN_TOKENS.SHADOW.SM}`}>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-secondary text-lg">conversion_path</span>
              <h3 className="text-sm font-black text-secondary tracking-tight uppercase">{t('home.roadmapJourney')}</h3>
            </div>

            <div className="space-y-4">
              {roadmapProgress.map((rm) => (
                <div
                  key={rm.id}
                  className={`p-4 ${DESIGN_TOKENS.RADIUS['2XL']} border border-stone-50 bg-stone-50/30 hover:bg-white hover:border-primary/20 hover:${DESIGN_TOKENS.SHADOW.MD} hover:-translate-y-0.5 transition-all group cursor-pointer`}
                  onClick={() => navigate(`/library/${rm.slug}`)}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${DESIGN_TOKENS.RADIUS.LG} bg-white ${DESIGN_TOKENS.SHADOW.SM} flex items-center justify-center text-secondary group-hover:text-primary transition-colors`}>
                        <span className="material-symbols-outlined text-sm">bookmark</span>
                      </div>
                      <h4 className="font-black text-secondary text-[13px] tracking-tight">{rm.name}</h4>
                    </div>
                    <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{rm.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary to-orange-400 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${rm.percent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{t('progress.wordCount', { mastered: rm.mastered, total: rm.total })}</p>
                    <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">{t('progress.explore')} &rarr;</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/library')}
              className={`w-full mt-6 py-4 bg-white text-secondary font-black text-[10px] ${DESIGN_TOKENS.RADIUS['2XL']} border border-stone-100 ${DESIGN_TOKENS.SHADOW.SM} hover:border-primary/30 hover:bg-orange-50/30 transition-all flex items-center justify-center gap-2 uppercase tracking-[0.15em]`}
            >
              {t('progress.seeAllRoadmaps')}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Quick Support Card */}
          <div className={`p-8 bg-secondary text-white ${DESIGN_TOKENS.RADIUS['4XL']} relative overflow-hidden group`}>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/5 select-none pointer-events-none group-hover:scale-110 transition-transform duration-700">lightbulb</span>
            <h4 className="font-black text-xl mb-3 relative z-10">{t('progress.masteryTip')}</h4>
            <p className="text-sm text-white/70 leading-relaxed relative z-10 font-medium">
              {t('progress.masteryTipDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
