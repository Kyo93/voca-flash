import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { fetchDashboardSummary } from '../lib/supabase-storage'
import type { DashboardSummary } from '../lib/types'
import { useAuth } from '../contexts/AuthContext'
import { loadStreak } from '../lib/streak'
import type { StreakData } from '../lib/streak'

const QUOTES = [
  "Hành trình vạn dặm bắt đầu từ một bước chân.",
  "Học một ngoại ngữ là có thêm một cửa sổ để nhìn ra thế giới.",
  "Sự kiên trì là chìa khóa của thành công.",
  "Mỗi ngày một chút, kiến thức sẽ đong đầy.",
  "Đừng dừng lại cho đến khi bạn tự hào về bản thân.",
  "Kỹ năng ngôn ngữ là bản đồ của một nền văn hóa.",
  "Học tập là kho báu sẽ đi theo chủ nhân của nó khắp mọi nơi."
]

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user, profile, initialData } = useAuth()

  const [streak, setStreak] = useState<StreakData>(loadStreak())
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBanner, setShowBanner] = useState(false)
  const [currentQuote, setCurrentQuote] = useState("")
  const [newTodayTotal, setNewTodayTotal] = useState(0)

  useEffect(() => {
    setCurrentQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])
  }, [])

  // Sync with initialData from Context (Màn hình sẽ hiện số ngay lập tức)
  useEffect(() => {
    if (initialData) {
      setNewTodayTotal(initialData.health.new_today)
      
      // Map initialData to DashboardSummary legacy structure
      setDashboardData(prev => ({
        resumeTopic: prev?.resumeTopic || null,
        fallbackTopics: prev?.fallbackTopics || [],
        globalReviewCount: initialData.global_review_count
      }))
      
      if (initialData.profile) {
        setStreak({
          currentStreak: initialData.profile.streak_days,
          lastStudyDate: initialData.profile.last_study_date || null,
          longestStreak: initialData.profile.streak_days
        } as any)
      }
      
      // Nếu đã có data cơ bản, cất loader đi cho user sướng
      setLoading(false)
    }
  }, [initialData])

  useEffect(() => {
    async function load() {
      if (!user) {
        setStreak(loadStreak())
        setLoading(false)
        return
      }

      try {
        // Chỉ fetch những thứ KHÔNG có trong Mega RPC hoặc cần load sâu
        const [summary] = await Promise.all([
          fetchDashboardSummary(user.id),
        ])

        setDashboardData(summary)

        // Use new_today from initialData (pre-calculated by DB)
        if (initialData?.health) {
          setNewTodayTotal(initialData.health.new_today)
        }
        
        // Banner logic
        const today = new Date().toISOString().split('T')[0]
        const dismissed = sessionStorage.getItem('welcome_banner_dismissed') === 'true'
        if (profile?.last_study_date !== today && !dismissed) {
          setShowBanner(true)
        }
      } catch (err) {
        console.error('Dashboard deep load error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user, profile?.last_study_date])

  const dailyGoal = profile?.daily_target ?? 20
  const dailyProgress = Math.min(newTodayTotal, dailyGoal)
  const progressPct = dailyGoal > 0
    ? Math.round((dailyProgress / dailyGoal) * 100)
    : 0

  // Master Hub Data Resolution
  const resumeTopic = dashboardData?.resumeTopic
  const fallback1 = dashboardData?.fallbackTopics[0]
  const reviewCount = dashboardData?.globalReviewCount ?? 0

  const card1 = resumeTopic || fallback1
  const isResume = !!resumeTopic

  // Growth Stage Logic
  const currentStreak = streak?.currentStreak ?? 0
  const getGrowthStage = () => {
    if (currentStreak === 0) return { icon: 'potted_plant', label: 'Hạt mầm' }
    if (currentStreak < 3) return { icon: 'local_florist', label: 'Đang lớn' }
    return { icon: 'nature', label: 'Cây cổ thụ' }
  }
  const growth = getGrowthStage()

  return (
    <>
      {/* Scrollable Content */}
      <div className="flex-1 px-10 py-8 overflow-y-auto" style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
          
          {/* Hero Banner (Zen Hybrid Refined) */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-container to-primary px-10 py-8 mb-8 flex items-center shadow-2xl group border border-white/10">
            <div className="relative z-10 max-w-2xl animate-fade-in">
              <h3 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight leading-tight">
                Sẵn sàng bứt phá hôm nay chưa, <span className="text-amber-200">{profile?.display_name || 'Scholar'}</span>?
              </h3>
              
              <div className="pl-4 border-l-2 border-amber-200/50 mb-6 transform transition-all group-hover:translate-x-1 duration-500">
                <p className="text-lg text-white/80 font-medium italic leading-relaxed">
                  "{currentQuote || '...'}"
                </p>
              </div>

              <div className="flex items-center gap-6">
                <Link
                  to="/study"
                  className="flex items-center gap-2 px-8 py-3 bg-white text-primary font-black rounded-xl hover:bg-stone-50 transition-all shadow-lg active:scale-95 group/btn text-sm"
                >
                  {t('home.continueChallenge')}
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">bolt</span>
                </Link>
                
                {showBanner && (
                  <button 
                    onClick={() => {
                      setShowBanner(false)
                      sessionStorage.setItem('welcome_banner_dismissed', 'true')
                    }}
                    className="text-white/40 font-bold hover:text-white transition-colors text-xs"
                  >
                    Để sau
                  </button>
                )}
              </div>
            </div>
            
            {/* Visual Decor - Zen Wave & Seed (Idea 3) */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none group">
              {/* Waves */}
              <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none" viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg">
                <path className="animate-[wave_8s_ease-in-out_infinite]" fill="white" d="M400,0 L400,320 L200,320 C300,200 100,100 200,0 L400,0 Z" />
                <path className="animate-[wave_12s_ease-in-out_infinite] opacity-50" fill="white" d="M400,40 L400,280 L250,280 C320,180 180,100 250,40 L400,40 Z" />
              </svg>

              {/* Seed/Plant Icon */}
              <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center animate-fade-in">
                <div className="relative">
                  <span className="material-symbols-outlined text-[120px] text-white opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700">
                    {growth.icon}
                  </span>
                  {/* Subtle Glow */}
                  <div className="absolute inset-0 bg-amber-200/20 blur-3xl rounded-full scale-150 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                </div>
                
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  {growth.label}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Row (Memory Health & Mission) */}
          <div className="grid grid-cols-12 gap-6 mb-8">
            {/* 1. Retention & Stability (Memory Strength) */}
            <div className="col-span-5 bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-sm">psychology</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 block">Sức khỏe bộ nhớ</span>
              </div>
              
              <div className="flex gap-6 items-center">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" className="stroke-stone-50" strokeWidth="12" fill="none" />
                    <circle 
                      cx="50" cy="50" r="44" 
                      className="stroke-primary" 
                      strokeWidth="12" 
                      fill="none" 
                      strokeDasharray="276" 
                      strokeDashoffset={276 - (276 * (initialData?.health.retention_rate ?? 0.9))} 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-secondary">{Math.round((initialData?.health.retention_rate ?? 0.9) * 100)}%</span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-3">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">Khả năng ghi nhớ</p>
                    <p className="text-sm font-bold text-secondary mt-0.5">Xuất sắc</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">Độ bền trung bình</p>
                    <p className="text-sm font-bold text-primary mt-0.5">{initialData?.health.avg_stability.toFixed(1)} ngày</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Daily Mission (Workload) */}
            <div className="col-span-4 bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-orange-400 text-sm">target</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 block">Nhiệm vụ hôm nay</span>
              </div>

              <div className="text-3xl font-black text-secondary tracking-tight mb-2">
                {newTodayTotal} <span className="text-stone-300 font-medium text-xl">/ {dailyGoal}</span>
              </div>
              
              <div className="h-2 w-full bg-stone-50 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full" style={{ width: `${progressPct}%` }} />
              </div>
              
              <p className="text-[10px] font-bold text-stone-400">Đã học {newTodayTotal} từ mới</p>
            </div>

            {/* 3. Review Forecast (Mini Chart) */}
            <div className="col-span-3 bg-secondary p-8 rounded-[2.5rem] flex flex-col text-white shadow-lg shadow-secondary/20 relative overflow-hidden group">
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary-fixed text-sm">event_repeat</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block">Dự báo ôn tập</span>
                </div>
                
                <div className="flex-1 flex items-end gap-2 px-1">
                  {(initialData?.health.forecast || [0, 0, 0, 0, 0]).slice(0, 5).map((count, i) => {
                    const max = Math.max(...(initialData?.health.forecast || [1])) || 1
                    const height = Math.max(15, (count / max) * 100)
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-white/10 rounded-t-lg group-hover:bg-primary/40 transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-[8px] font-bold text-white/30">{i === 0 ? 'T2' : i === 1 ? 'T3' : i === 2 ? 'T4' : i === 3 ? 'T5' : 'T6'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
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
              {/* Card 1 — Resume or First Topic */}
              {card1 ? (
                <div className="group bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={card1.name} 
                      loading="lazy"
                      src={card1.image_url || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80"} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-4 left-4 px-3 py-1 bg-primary text-white text-[9px] font-black rounded-lg uppercase tracking-widest">
                      {isResume ? 'ĐANG THEO DÕI' : 'GỢI Ý'}
                    </span>
                  </div>
                  <div className="p-6">
                    <h5 className="text-xl font-black text-on-surface mb-2">{card1.name}</h5>
                    <p className="text-sm text-stone-400 mb-5 line-clamp-2">{card1.description || 'Tiếp tục lộ trình chinh phục từ vựng của bạn.'}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-300 text-[11px] font-black uppercase tracking-wider">
                        {isResume ? 'Bài học dở' : 'Bài học mới'}
                      </span>
                      <Link 
                        to={`/study?topic=${card1.slug}&topicId=${card1.id}&roadmapId=${card1.roadmap_id}`} 
                        className="text-secondary text-[11px] font-black uppercase tracking-wider flex items-center gap-1 hover:underline underline-offset-2"
                      >
                        {isResume ? 'Học tiếp' : 'Khám phá'} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-stone-50 rounded-3xl animate-pulse" />
              )}

              {/* Card 2 — Global Review */}
              <div className="group bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 overflow-hidden bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-7xl text-white opacity-40 group-hover:scale-110 transition-transform duration-500" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 to-transparent" />
                  <span className="absolute bottom-4 left-4 px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-[9px] font-black rounded-lg uppercase tracking-widest">ACTIVE RECALL</span>
                </div>
                <div className="p-6">
                  <h5 className="text-xl font-black text-on-surface mb-2">Bảo trì Kiến thức</h5>
                  <p className="text-sm text-stone-400 mb-5 line-clamp-2">Ôn tập tập trung không phân biệt chủ đề để ghi nhớ vĩnh viễn.</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      <span className="text-secondary text-[11px] font-black uppercase tracking-wider">
                        {loading ? '...' : `${reviewCount} từ cần ôn tập`}
                      </span>
                    </div>
                    <Link to="/review" className="text-secondary text-[11px] font-black uppercase tracking-wider flex items-center gap-1 hover:underline underline-offset-2">
                       Ôn tập ngay <span className="material-symbols-outlined text-sm">arrow_forward</span>
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
