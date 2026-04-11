import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { fetchUserStats, fetchTopicWordCounts } from '../lib/supabase-storage'
import { useAuth } from '../contexts/AuthContext'
import { fetchStreakFromSupabase, loadStreak } from '../lib/streak'
import type { StreakData } from '../lib/streak'

const DAILY_GOAL = 10

interface DashboardStats {
  totalWords: number
  mastered: number
  learning: number
  topicCounts: Record<string, number>
}



export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [streak, setStreak] = useState<StreakData>(loadStreak())
  const [stats, setStats] = useState<DashboardStats>({
    totalWords: 0,
    mastered: 0,
    learning: 0,
    topicCounts: {},
  })
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) {
        // Not logged in — use localStorage fallback
        setStreak(loadStreak())
        setLoading(false)
        return
      }

      // Logged in — fetch from Supabase
      const [streakData, userStats, topicData] = await Promise.all([
        fetchStreakFromSupabase(user.id),
        fetchUserStats(user.id),
        fetchTopicWordCounts(),
      ])

      setStreak(streakData)
      setStats({
        totalWords: userStats.totalWords,
        mastered: userStats.mastered,
        learning: userStats.learning,
        topicCounts: userStats.totalWords > 0 ? topicData : {},
      })
      setTopicCounts(topicData)
      setLoading(false)
    }

    load()
  }, [user])

  const dailyProgress = Math.min(stats.learning + stats.mastered, DAILY_GOAL)
  const progressPct = stats.totalWords > 0
    ? Math.round((dailyProgress / DAILY_GOAL) * 100)
    : 0

  // Topic counts from Supabase
  const dailyCount = topicCounts['daily'] ?? 0
  const travelCount = topicCounts['travel'] ?? 0

  return (
    <>
      {/* Scrollable Content */}
      <div className="flex-1 px-10 py-8 overflow-y-auto" style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>

          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-container to-primary px-12 py-12 mb-8 min-h-[260px] flex items-center shadow-lg">
            <div className="relative z-10 max-w-lg">
              <h3 className="text-5xl font-black text-white mb-3 tracking-tight leading-tight">{t('home.welcome')}</h3>
              <p className="text-lg text-white/80 font-medium mb-8 max-w-sm">
                Bắt đầu học tập hôm nay. Hãy tiếp tục!
              </p>
              <Link
                to="/study"
                className="inline-block px-8 py-3.5 bg-white text-primary font-black rounded-2xl hover:bg-stone-50 transition-all shadow-xl"
              >
                {t('home.continueChallenge')}
              </Link>
            </div>
            <div className="absolute right-8 top-0 bottom-0 w-1/4 flex items-center justify-center opacity-10">
              <span className="material-symbols-outlined text-[280px] text-white rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-12 gap-6 mb-8">
            {/* Daily Goal */}
            <div className="col-span-8 bg-white p-8 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-8">
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2 block">{t('home.currentGoal')}</span>
                <div className="text-3xl font-black text-on-surface mb-4">
                  {loading ? (
                    <span className="inline-block w-16 h-8 bg-stone-100 rounded animate-pulse" />
                  ) : (
                    <>
                      {dailyProgress} <span className="text-stone-300 font-medium text-xl">/ {DAILY_GOAL} {t('home.newWords')}</span>
                    </>
                  )}
                </div>
                <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${Math.min(100, progressPct)}%` }} />
                </div>
              </div>
              <div className="w-32 h-32 rounded-full border-[6px] border-secondary/10 bg-secondary/5 flex flex-col items-center justify-center shrink-0">
                {loading ? (
                  <span className="w-12 h-12 bg-stone-100 rounded-full animate-pulse" />
                ) : (
                  <>
                    <span className="text-3xl font-black text-secondary">{Math.min(100, progressPct)}%</span>
                    <span className="text-[9px] font-bold text-secondary/60 uppercase tracking-tighter mt-1">{t('progress.completed')}</span>
                  </>
                )}
              </div>
            </div>
            {/* Rank */}
            <div className="col-span-4 bg-secondary-container px-8 py-8 rounded-3xl flex flex-col justify-center items-center border border-secondary/10 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              </div>
              <p className="font-black text-xl text-on-secondary-container">Newcomer Rank</p>
              <p className="text-xs font-medium text-on-secondary-container/70 mt-1 opacity-70">{DAILY_GOAL - dailyProgress} XP đến cấp kế</p>
            </div>
          </div>

          {/* Continue Learning */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h4 className="text-2xl font-black text-on-surface">{t('home.continueLearning')}</h4>
                <p className="text-stone-400 font-medium text-sm mt-1">Tiếp tục học từ các bài đã chọn.</p>
              </div>
              <Link className="text-primary font-bold text-sm hover:underline underline-offset-4 transition-all shrink-0 ml-4" to="/library">{t('home.viewLibrary')}</Link>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {/* Card 1 — Daily */}
              <div className="group bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Giao tiếp hằng ngày" src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-4 left-4 px-3 py-1 bg-primary text-white text-[9px] font-black rounded-lg uppercase tracking-widest">BẢN TIN</span>
                </div>
                <div className="p-6">
                  <h5 className="text-xl font-black text-on-surface mb-2">{t('topics.daily')}</h5>
                  <p className="text-sm text-stone-400 mb-5 line-clamp-2">Tăng vốn giao tiếp hàng ngày của bạn.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-300 text-[11px] font-black uppercase tracking-wider">
                      {loading ? '...' : `${dailyCount} ${t('topics.words')}`}
                    </span>
                    <Link to="/study?topic=daily" className="text-secondary text-[11px] font-black uppercase tracking-wider flex items-center gap-1 hover:underline underline-offset-2">
                      {t('home.resume')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
              {/* Card 2 — Travel */}
              <div className="group bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Du lịch" src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-4 left-4 px-3 py-1 bg-secondary text-white text-[9px] font-black rounded-lg uppercase tracking-widest">P3.5</span>
                </div>
                <div className="p-6">
                  <h5 className="text-xl font-black text-on-surface mb-2">{t('topics.travel')}</h5>
                  <p className="text-sm text-stone-400 mb-5 line-clamp-2">Tăng vốn từ vựng du lịch.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-300 text-[11px] font-black uppercase tracking-wider">
                      {loading ? '...' : `${travelCount} ${t('topics.words')}`}
                    </span>
                    <Link to="/study?topic=travel" className="text-secondary text-[11px] font-black uppercase tracking-wider flex items-center gap-1 hover:underline underline-offset-2">
                      {t('home.resume')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>

    </>
  )
}
