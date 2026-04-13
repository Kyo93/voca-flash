import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  fetchProgressPageData
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


export default function ProgressPage() {
  const { user, profile, initialData } = useAuth()
  const navigate = useNavigate()
  const [roadmapProgress, setRoadmapProgress] = useState<RoadmapProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
        // Only fetch things NOT in the unified health RPC
        const data = await fetchProgressPageData(user.id)
        setRoadmapProgress(data.roadmap_progress)
      } catch (err) {
        console.error('Failed to load roadmap progress:', err)
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
        {/* Left Column: Analytics */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* FSRS Lifecycle Bins */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                label: 'Mới/Hạt mầm', 
                value: initialData?.health.stability_distribution?.fresh ?? 0, 
                desc: 'Độ bền < 5 ngày',
                color: 'text-emerald-500', 
                bg: 'bg-emerald-50',
                progress: 20
              },
              { 
                label: 'Vững chắc', 
                value: initialData?.health.stability_distribution?.stable ?? 0, 
                desc: 'Độ bền 5-30 ngày',
                color: 'text-blue-500', 
                bg: 'bg-blue-50',
                progress: 60
              },
              { 
                label: 'Dài hạn', 
                value: initialData?.health.stability_distribution?.rooted ?? 0, 
                desc: 'Độ bền > 30 ngày',
                color: 'text-purple-600', 
                bg: 'bg-purple-50',
                progress: 80
              }
            ].map((bin, i, arr) => {
              const total = arr.reduce((acc, b) => acc + b.value, 0) || 1
              return (
                <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 ${bin.bg} rounded-2xl flex items-center justify-center ${bin.color} shrink-0`}>
                      <span className="material-symbols-outlined text-2xl font-variation-fill">psychology</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest leading-none mb-1">Trạng thái</p>
                      <p className={`text-[11px] font-black ${bin.color} uppercase tracking-tight`}>{bin.label}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-5xl font-black text-secondary tracking-tight">{bin.value}</p>
                      <p className="text-[10px] font-bold text-stone-400 mt-1 italic">{bin.desc}</p>
                    </div>
                    <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                      <div className={`h-full bg-current ${bin.color} opacity-60`} style={{ width: `${Math.max(5, (bin.value / total) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Workload Forecast Chart */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">event_repeat</span>
                <h3 className="text-sm font-black text-secondary tracking-tight uppercase">Dự báo khối lượng ôn tập (7 ngày)</h3>
              </div>
            </div>
            
            <div className="h-48 flex items-end gap-4 px-2">
              {(initialData?.health.forecast || [0, 0, 0, 0, 0]).slice(0, 7).map((count, i) => {
                const max = Math.max(...(initialData?.health.forecast || [1])) || 1
                const height = Math.max(10, (count / max) * 100)
                const isToday = i === 0
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="relative w-full flex flex-col items-center">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10">
                        {count} từ
                      </div>
                      <div 
                      className={`w-full rounded-t-lg transition-all duration-700 ${
                        isToday 
                          ? 'bg-orange-500 shadow-[0_4px_12px_rgba(249,115,22,0.3)]' 
                          : 'bg-blue-500/10 group-hover:bg-blue-500/20'
                      }`}
                      style={{ 
                        height: `${height}%`,
                        transitionDelay: `${i * 100}ms`
                      }}
                    />
                    </div>
                    <div className="text-center">
                      <p className={`text-[9px] font-black uppercase tracking-tighter ${isToday ? 'text-primary' : 'text-stone-300'}`}>
                        {isToday ? 'H.Nay' : `Ngày ${i + 1}`}
                      </p>
                    </div>
                  </div>
                )
              })}
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
                    Có <strong>{initialData?.health.due_today ?? 0} từ</strong> cần ôn tập ngay bây giờ
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
             <ActivityHeatmap streakDays={profile?.streak_days || 0} />
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
            
            <div className="space-y-4">
              {roadmapProgress.map((rm) => (
                <div 
                  key={rm.id}
                  className="p-4 rounded-2xl border border-stone-50 bg-stone-50/30 hover:bg-white hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
                  onClick={() => navigate(`/library/${rm.slug}`)}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-secondary group-hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-sm">bookmark</span>
                       </div>
                       <h4 className="font-black text-secondary text-[13px] tracking-tight">{rm.name}</h4>
                    </div>
                    <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{rm.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${rm.percent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                     <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{rm.mastered} / {rm.total} từ</p>
                     <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Khám phá &rarr;</p>
                  </div>
                </div>
              ))}
            </div>

            <button 
               onClick={() => navigate('/library')}
               className="w-full mt-6 py-4 bg-white text-secondary font-black text-[10px] rounded-2xl border border-stone-100 shadow-sm hover:border-primary/30 hover:bg-orange-50/30 transition-all flex items-center justify-center gap-2 uppercase tracking-[0.15em]"
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
