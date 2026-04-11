import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchRoadmaps, fetchRoadmapStats } from '../lib/supabase-storage'
import type { Roadmap } from '../lib/types'

export default function LibraryPage() {
  const { user } = useAuth()
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [roadmapStats, setRoadmapStats] = useState<Record<string, { total: number, mastered: number }>>({})
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'All' | 'Kids' | 'Casual' | 'Professional' | 'Academic'>('All')

  useEffect(() => {
    async function loadRoadmaps() {
      setLoading(true)
      try {
        const data = await fetchRoadmaps()
        setRoadmaps(data)
        
        // Fetch stats for each roadmap
        const stats: Record<string, { total: number, mastered: number }> = {}
        await Promise.all(data.map(async (r) => {
          const s = await fetchRoadmapStats(r.id, user?.id)
          stats[r.id] = s
        }))
        setRoadmapStats(stats)
      } catch (err) {
        console.error('Error fetching roadmaps:', err)
      } finally {
        setLoading(false)
      }
    }
    loadRoadmaps()
  }, [user?.id])

  const filteredRoadmaps = useMemo(() => {
    if (activeFilter === 'All') return roadmaps
    return roadmaps.filter(r => {
      const name = r.name.toLowerCase()
      if (activeFilter === 'Kids') return name.includes('kids') || name.includes('trẻ em')
      if (activeFilter === 'Professional') return name.includes('business') || name.includes('công việc')
      if (activeFilter === 'Academic') return name.includes('ielts') || name.includes('toeic')
      if (activeFilter === 'Casual') return name.includes('daily') || name.includes('giao tiếp')
      return true
    })
  }, [roadmaps, activeFilter])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
          <p className="text-on-surface-variant font-bold">Đang tải các lộ trình...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <span className="label-md text-orange-600 font-bold">Curated Experience</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface text-editorial-asymmetry mt-2 mb-4">
              The Journey of Mastery
            </h2>
            <p className="text-stone-500 max-w-2xl leading-relaxed">
              Select a specialized roadmap designed to help you achieve your specific language goals.
              Each path contains curated modules and expert-selected vocabulary.
            </p>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-wrap items-center gap-3 mb-12">
            {(['All', 'Kids', 'Casual', 'Professional', 'Academic'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  activeFilter === filter 
                    ? 'bg-secondary text-white shadow-lg' 
                    : 'bg-white text-stone-500 hover:bg-stone-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Roadmaps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredRoadmaps.map(roadmap => {
              const stats = roadmapStats[roadmap.id] || { total: 0, mastered: 0 }
              const percent = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0
              const imageUrl = roadmap.slug.includes('kids') 
                ? 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80&w=800'
                : roadmap.slug.includes('business')
                ? 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'
                : 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800'

              return (
                <Link 
                  key={roadmap.id} 
                  to={`/library/${roadmap.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-stone-100"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={imageUrl} 
                      alt={roadmap.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                      <div className="text-white">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-orange-600 px-2 py-1 rounded mb-2 inline-block">
                          {roadmap.name.includes('Kids') ? 'Beginner' : 'Specialized'}
                        </span>
                        <h3 className="text-2xl font-bold">{roadmap.name}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-stone-500 text-sm line-clamp-2 mb-6">
                      {roadmap.description || 'Chương trình học bài bản được thiết kế để tối ưu lộ trình học tập của bạn.'}
                    </p>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Progress</span>
                        <span className="text-sm font-black text-secondary">{percent}%</span>
                      </div>
                      <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary transition-all duration-1000" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex-1 text-center py-2 bg-stone-50 rounded-lg">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Words</p>
                          <p className="text-lg font-black text-secondary">{stats.total}</p>
                        </div>
                        <div className="flex-1 text-center py-2 bg-stone-50 rounded-lg">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Mastery</p>
                          <p className="text-lg font-black text-secondary">{stats.mastered}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Specialized Path Banner */}
          <div className="mt-20 bg-secondary rounded-3xl p-10 relative overflow-hidden text-white flex flex-col md:flex-row items-center gap-10">
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary opacity-20 rounded-full blur-3xl"></div>
            <div className="flex-1 relative z-10 text-center md:text-left">
              <h4 className="text-3xl font-black mb-4">Request a Personalized Path</h4>
              <p className="text-stone-300 max-w-md leading-relaxed">
                Can't find the specific niche you're studying for? Our academic team can build a custom roadmap for your organization.
              </p>
              <button className="mt-8 px-8 py-3 bg-white text-secondary font-black rounded-xl hover:scale-105 active:scale-95 transition-transform">
                Contact Academic Team
              </button>
            </div>
            <div className="w-64 h-64 md:w-80 md:h-80 bg-stone-800/50 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
               <span className="material-symbols-outlined text-8xl text-white/20">school</span>
            </div>
          </div>
    </div>
  )
}
