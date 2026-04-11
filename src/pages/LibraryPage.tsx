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

  const getCardSpecs = (roadmap: Roadmap) => {
    const name = roadmap.name.toLowerCase()
    if (name.includes('kids') || name.includes('trẻ em')) {
      return {
        badge: 'Ages 6-12',
        badgeClass: 'bg-secondary-fixed text-on-secondary-fixed-variant',
        btnClass: 'bg-secondary text-white',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3KhF9uR-xXVpSv6pn_s5MQArtNHLaeqZGVy3Z1o8xNmBkFmfxNnZp7gcv1PSl2Sui7tp_wq30ZFTD0fn4Di9SXLalR56TsGULlKBzBNhuor8gGRyhtlhT4ykI0TLXLG0GD0g0eVkdsZBmGd9j0E9ljzUy2C8l2Ln4HckEqW1xJWd_XvSuD-F5KC4apFAdrroQ-vDle39KLdRXq_NXToCtNeTGGcJGA8r1R4tSVU_cuNJJ0UGhgNE562HfPPztOnlnKIlBAEWioho'
      }
    }
    if (name.includes('business') || name.includes('công việc')) {
      return {
        badge: 'Professional',
        badgeClass: 'bg-primary-fixed text-on-primary-fixed-variant',
        btnClass: 'bg-gradient-to-r from-primary-container to-primary text-white shadow-lg shadow-primary-container/20',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDnvQt2zo_EDPwxAYPXR7-KIeaoANUjFGbYCaJBfj0VR8mgdHvTG8Q7RZ_NsCv9tzjwMaJxM78BI9UGmaBRuTBPUquXV9G8GtSOrItJDlzvSxbhXYwslqJbaDA7Lj9511sLVv84X74_Y3LRLTIMK4l5yVYjSVZDUkqGoHrGRA78m1B0oK7YM5prChBWsL_i7Cfz-IGZQlPU3WZX1S-rbqFyPGwT5OWtKEnTyWUfFbOMl1wW8GKfCLNMc0Lgn3e493I9W9xIsQxCX8'
      }
    }
    if (name.includes('ielts') || name.includes('toeic') || name.includes('academic')) {
      return {
        badge: 'Advanced',
        badgeClass: 'bg-secondary-fixed text-on-secondary-fixed-variant',
        btnClass: 'bg-secondary text-white',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPJEqmnzoRrR1BbMfXTHBs2ch9r39_lFHhulD2Ftx01n28O2cJxjSatgcsWutM0qM1H0Hv9GLac8Ep714BrXAPLtgH_Fb447ADD_iGk3DCG1LfgAESAM13fKC1GLFvnkyZapG3GI1ZZYU9EZjBDZkS76eueZh8O-zK6VXMBsYtJuHYoWKbiqVdc_gghQUML1vec2ch2u9My0T8_AasOuwYu9uAi1A3G4uXh0GiM2soKvWK_9H-Wwg3DNe-JHgRKm2BopzdAUhVJ1k'
      }
    }
    return {
      badge: 'Lifestyle',
      badgeClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
      btnClass: 'bg-stone-800 text-stone-50 hover:bg-stone-900',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiyIjOjwPdwiMBMhbuizstF4hKOR0vrGilIbGfOIQaJc06MHpzex_nm8hiyB0P0VJPWghNJUkY-nCagX_KZKuI7vJF-qBTRgzoc9f01jhrB-gap49brEt6cayhEmJ_PllwUe39FEjmcuV8tsVhgYweGgOSezeAOl5x6T6GWqzXo7E8TCMgcKvAbiKvuh1NIaEg6XRaR2WbvX2GWw7yXptQ3m9xhyRwgZGBvATJmZ-YB8K6BA9U_cBoFMVDi8IYq9drtl7JjAyANag'
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-8 pt-10 pb-16">
      {/* Hero Section */}
      <div className="mb-12 relative flex items-end justify-between">
        <div className="relative">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl -z-10"></div>
          <span className="label-md uppercase tracking-[0.2em] text-secondary font-bold mb-3 block">Curated Pathways</span>
          <h2 className="text-5xl font-black text-on-surface tracking-tight mb-4">Choose Your Journey</h2>
          <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
            Select a roadmap tailored to your goals. Our tactile learning system adapts to your pace and interests.
          </p>
        </div>
        <div className="hidden xl:block pb-2">
          <div className="flex gap-2">
            <div className="w-12 h-1 bg-primary rounded-full"></div>
            <div className="w-3 h-1 bg-stone-300 rounded-full"></div>
            <div className="w-3 h-1 bg-stone-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Categories Filter - Restyled to match new design */}
      <div className="flex flex-wrap items-center gap-3 mb-10">
        {(['All', 'Kids', 'Casual', 'Professional', 'Academic'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
              activeFilter === filter 
                ? 'bg-secondary text-white shadow-md' 
                : 'bg-surface-container-low text-stone-500 hover:bg-surface-container'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Roadmaps Grid */}
      <div className="asymmetric-grid">
        {filteredRoadmaps.map(roadmap => {
          const specs = getCardSpecs(roadmap)
          
          return (
            <Link 
              key={roadmap.id} 
              to={`/library/${roadmap.slug}`}
              className="group relative bg-surface-container hover:bg-surface-container-lowest p-6 rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-start overflow-hidden border border-transparent hover:border-secondary/10"
            >
              <div className="w-full h-40 bg-secondary-container/30 rounded-xl mb-6 flex items-center justify-center overflow-hidden relative">
                <img 
                  src={roadmap.image_url || specs.image} 
                  alt={roadmap.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <span className={`${specs.badgeClass} text-[9px] font-bold px-2 py-1 rounded mb-3 uppercase tracking-wider`}>
                {specs.badge}
              </span>
              <h3 className="text-xl font-bold mb-2 text-on-surface">{roadmap.name}</h3>
              <p className="text-on-surface-variant mb-6 text-xs leading-relaxed line-clamp-3">
                {roadmap.description || 'Chương trình học bài bản được thiết kế để tối ưu lộ trình học tập của bạn.'}
              </p>
              
              <button className={`mt-auto w-full py-3 ${specs.btnClass} text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95`}>
                Start Journey
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </Link>
          )
        })}
      </div>

      {/* Assessment Footer Banner */}
      <div className="mt-12 p-8 bg-surface-container-low border border-outline/10 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">quiz</span>
          </div>
          <div>
            <h4 className="text-lg font-bold text-on-surface">Not sure where to start?</h4>
            <p className="text-on-surface-variant text-sm">Our AI assessment recommends the perfect path based on your current level and goals.</p>
          </div>
        </div>
        <button className="px-8 py-3 bg-white text-primary font-bold rounded-xl border-2 border-primary/10 hover:border-primary/30 transition-all active:scale-95 shadow-sm whitespace-nowrap">
          Take Assessment
        </button>
      </div>
    </div>
  )
}
