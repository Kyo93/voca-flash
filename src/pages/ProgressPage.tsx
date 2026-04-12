import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  fetchDashboardStats, 
  fetchDashboardSummary, 
  fetchRoadmaps, 
  fetchRoadmapStats,
  fetchUserVocabulary,
  UserStats
} from '../lib/supabase-storage'
import { useNavigate, Link } from 'react-router-dom'
import ActivityHeatmap from '../components/ActivityHeatmap'

interface RoadmapProgress {
  id: string
  name: string
  slug: string
  total: number
  mastered: number
  percent: number
}

interface MemoryHealth {
  learning: number
  newToday: number
  mastered: number
  due: number
  orphaned: number
  weak: number
}

export default function ProgressPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [reviewCount, setReviewCount] = useState<number>(0)
  const [roadmapProgress, setRoadmapProgress] = useState<RoadmapProgress[]>([])
  const [memoryHealth, setMemoryHealth] = useState<MemoryHealth | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
        const [userStats, summary, allRoadmaps, vocabData] = await Promise.all([
          fetchDashboardStats(user.id),
          fetchDashboardSummary(user.id),
          fetchRoadmaps(),
          fetchUserVocabulary(user.id).catch(() => []) // Fallback to empty array on error
        ])

        setStats(userStats)
        setReviewCount(summary.globalReviewCount)

        // Calculate Memory Health
        if (vocabData.length > 0) {
          const now = new Date()
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          setMemoryHealth({
            learning: vocabData.filter(w => !w.mastered).length,
            newToday: vocabData.filter(w => new Date(w.first_encountered) >= today).length,
            mastered: vocabData.filter(w => w.mastered).length,
            due: vocabData.filter(w => w.next_review_at && new Date(w.next_review_at) <= now).length,
            orphaned: vocabData.filter(w => w.is_orphaned).length,
            weak: vocabData.filter(w => w.lapse_count > 2).length,
          })
        } else {
          setMemoryHealth({ learning: 0, newToday: 0, mastered: 0, due: 0, orphaned: 0, weak: 0 })
        }

        // Parallel fetch for each roadmap's stats
        const progressList = await Promise.all(
          allRoadmaps.map(async (rm) => {
            const roadmapStats = await fetchRoadmapStats(rm.id, user.id)
            return {
              id: rm.id,
              name: rm.name, // Corrected from rm.title
              slug: rm.slug,
              total: roadmapStats.total,
              mastered: roadmapStats.mastered,
              percent: roadmapStats.total > 0 
                ? Math.round((roadmapStats.mastered / roadmapStats.total) * 100) 
                : 0
            }
          })
        )
        setRoadmapProgress(progressList)
      } catch (err) {
        console.error('Failed to load progress data:', err)
        setMemoryHealth({ learning: 0, newToday: 0, mastered: 0, due: 0, orphaned: 0, weak: 0 })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const displayName = profile?.display_name ?? profile?.email?.split('@')[0] ?? 'Nhà thông thái'

  return (
    <div className="px-10 py-8 overflow-y-auto" style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-secondary tracking-tight mb-2">Tiến độ Mastery</h1>
          <p className="text-stone-500 font-medium">
            Chào mừng trở lại, <span className="text-primary font-bold">{displayName}</span>. Hãy tiếp tục hành trình của bạn.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 text-secondary font-bold text-xs rounded-xl hover:bg-stone-200 transition-all uppercase tracking-widest border border-stone-200/50">
          <span className="material-symbols-outlined text-sm">menu_book</span>
          Hành trình học tập
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        
        {/* Left Column: Stats Cards */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mastered Card */}
            <div className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all relative overflow-hidden group">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
                   <span className="material-symbols-outlined text-2xl font-variation-fill">military_tech</span>
                 </div>
                 <span className="px-3 py-1.5 bg-orange-50 text-orange-600 font-bold text-[10px] uppercase tracking-widest rounded-full">
                   +{memoryHealth?.newToday ?? 0} hôm nay
                 </span>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em]">Từ đã thuộc</p>
                <p className="text-5xl font-black text-secondary tracking-tight">{(stats?.mastered ?? 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Streak Card */}
            <div className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all relative overflow-hidden group">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-[#F3ECE1] rounded-2xl flex items-center justify-center text-[#A67C52] shrink-0">
                   <span className="material-symbols-outlined text-2xl font-variation-fill">calendar_month</span>
                 </div>
                 <div className="flex gap-1">
                   {['M', 'T', 'W'].map((day) => (
                      <span key={day} className="w-6 h-6 rounded-full bg-[#E5B551] text-white flex items-center justify-center text-[9px] font-black">{day}</span>
                   ))}
                 </div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em]">Chuỗi ngày</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-black text-secondary tracking-tight">{stats?.streakDays ?? 0}</p>
                  <span className="text-xl font-bold text-stone-300">ngày</span>
                </div>
              </div>
            </div>

            {/* Daily Target Card */}
            <div className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all relative overflow-hidden group">
               <div className="flex justify-between items-start mb-6">
                 <div className="space-y-1">
                    <p className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em] w-24">Mục tiêu ngày</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-5xl font-black text-secondary tracking-tight">
                         {profile?.daily_target ? Math.min(100, Math.round(((memoryHealth?.newToday ?? 0) / profile.daily_target) * 100)) : 0}
                      </p>
                      <span className="text-2xl font-black text-stone-300">%</span>
                    </div>
                    <p className="text-[10px] font-bold text-stone-400 italic mt-2">{memoryHealth?.newToday ?? 0}/{profile?.daily_target || 20} thẻ mới</p>
                 </div>
                 {/* Progress Ring Placeholder (Mock) */}
                 <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="stroke-stone-100" strokeWidth="12" fill="none" />
                      <circle cx="50" cy="50" r="40" className="stroke-[#D35400] drop-shadow-sm transition-all duration-1000 ease-out" strokeWidth="12" fill="none" strokeDasharray="251" strokeDashoffset={251 - (251 * (profile?.daily_target ? Math.min(100, Math.round(((memoryHealth?.newToday ?? 0) / profile.daily_target) * 100)) : 0)) / 100} strokeLinecap="round" />
                    </svg>
                    <span className="material-symbols-outlined text-[#D35400] absolute text-xl font-variation-fill">flag</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Memory Health Section */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-stone-400 text-lg">monitor_heart</span>
                 <h3 className="text-sm font-black text-secondary tracking-tight uppercase">Sức khỏe ghi nhớ</h3>
               </div>
               <Link to="/mastery" className="text-xs font-bold text-primary hover:text-orange-600 transition-colors">
                 Tới Kho từ vựng &rarr;
               </Link>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
               {[
                 { label: 'Đang học', value: memoryHealth?.learning ?? 0, icon: 'school', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100/50' },
                 { label: 'Mới hôm nay', value: memoryHealth?.newToday ?? 0, icon: 'new_releases', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100/50' },
                 { label: 'Đã thuộc', value: memoryHealth?.mastered ?? 0, icon: 'military_tech', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100/50' },
                 { label: 'Đến hạn', value: memoryHealth?.due ?? 0, icon: 'history_toggle_off', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100/50' },
                 { label: 'Mồ côi', value: memoryHealth?.orphaned ?? 0, icon: 'broken_image', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100/50' },
                 { label: 'Yếu', value: memoryHealth?.weak ?? 0, icon: 'trending_down', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100/50' }
               ].map(s => (
                 <div key={s.label} className={`p-4 bg-white/60 backdrop-blur-md rounded-2xl border ${s.border} shadow-sm flex flex-col justify-center items-center gap-2 group hover:bg-white hover:border-primary/20 hover:-translate-y-0.5 transition-all`}>
                   <div className={`w-8 h-8 ${s.bg} ${s.color} rounded-xl flex items-center justify-center shrink-0`}>
                     <span className="material-symbols-outlined text-[18px] font-variation-fill">{s.icon}</span>
                   </div>
                   <div className="text-center">
                     <p className="text-xl font-black text-secondary leading-none">{s.value}</p>
                     <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest mt-1 opacity-80">{s.label}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Arena Hero Card */}
          <div className="relative overflow-hidden p-10 rounded-[2.5rem] shadow-2xl shadow-primary/10 group bg-[#e67e22]">
            {/* Design uses a solid orange-ish with slight variations, matching project primary */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-orange-600 transition-opacity duration-700 opacity-90 group-hover:opacity-100"></div>
            
            <div className="relative z-10 flex flex-col gap-6">
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    HÀNH ĐỘNG NGAY
                  </span>
                </div>
                <h2 className="text-4xl font-black text-white leading-tight">Đấu Trường Arena đang chờ</h2>
                <div className="flex items-center gap-2 text-white/90">
                  <span className="material-symbols-outlined text-lg">notifications_active</span>
                  <p className="font-medium">
                    <strong>{reviewCount} từ</strong> cần ôn tập ngay bây giờ
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <Link 
                  to="/review"
                  className="inline-flex items-center gap-3 px-10 py-4 bg-white text-primary rounded-full font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  Bắt đầu Ôn tập
                  <span className="material-symbols-outlined text-lg font-variation-fill">bolt</span>
                </Link>
              </div>
            </div>
            
            {/* Decals for depth */}
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[200px] text-white/10 select-none pointer-events-none rotate-12">videogame_asset</span>
          </div>

          {/* Activity Heatmap */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 px-2">
               <span className="material-symbols-outlined text-stone-400 text-lg">calendar_month</span>
               <h3 className="text-sm font-black text-secondary tracking-tight uppercase">Biểu đồ hoạt động</h3>
             </div>
             <ActivityHeatmap streakDays={stats?.streakDays || 0} />
             <p className="text-center text-xs text-stone-400 font-medium italic mt-2">
               “Sự kiên trì là chìa khóa của sự thông thái.” — VocaFlash Mentor
             </p>
          </div>
        </div>

        {/* Right Column: Roadmap Progress List */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-secondary text-lg">conversion_path</span>
                <h3 className="text-sm font-black text-secondary tracking-tight uppercase">Lộ trình học tập</h3>
            </div>
            
            <div className="space-y-6">
              {roadmapProgress.map((rm) => (
                <div 
                  key={rm.id}
                  className="space-y-3 group cursor-pointer"
                  onClick={() => navigate(`/library/${rm.slug}`)}
                >
                  <div className="flex justify-between items-end">
                    <h4 className="font-black text-secondary text-sm group-hover:text-primary transition-colors">{rm.name}</h4>
                    <span className="text-xs font-black text-primary">{rm.percent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${rm.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <button 
               onClick={() => navigate('/library')}
               className="w-full mt-10 py-4 bg-stone-50 text-stone-500 font-bold text-xs rounded-2xl border border-stone-100 hover:bg-stone-100 hover:text-secondary transition-all flex items-center justify-center gap-2"
            >
              Xem tất cả lộ trình
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Quick Support Card */}
          <div className="p-8 bg-secondary text-white rounded-[2.5rem] relative overflow-hidden group">
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/5 select-none pointer-events-none group-hover:scale-110 transition-transform duration-700">lightbulb</span>
            <h4 className="font-black text-xl mb-3 relative z-10">Mẹo Mastery</h4>
            <p className="text-sm text-white/70 leading-relaxed relative z-10 font-medium">
              Ôn tập ngay khi từ vựng vừa đến hạn giúp tăng tỷ lệ ghi nhớ dài hạn lên gấp <strong className="text-white">3 lần</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
