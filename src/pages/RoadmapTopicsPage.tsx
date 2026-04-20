import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useOutletContext } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  fetchRoadmaps, 
  fetchTopicsByRoadmap, 
  fetchRoadmapStats, 
  fetchTopicCompletionMap,
  fetchResumePointers
} from '../lib/supabase-storage'
import type { Topic, Roadmap } from '../lib/types'

export default function RoadmapTopicsPage() {
  const { roadmapSlug } = useParams<{ roadmapSlug: string }>()
  const { user } = useAuth()
  const { searchQuery } = useOutletContext<{ searchQuery: string }>()
  
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [stats, setStats] = useState({ total: 0, mastered: 0 })
  const [topicProgress, setTopicProgress] = useState<Record<string, { total: number, learned: number, percent: number }>>({})
  const [featuredId, setFeaturedId] = useState<string | null>(null)
  const [upNextId, setUpNextId] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!roadmapSlug) return
      setLoading(true)
      
      try {
        // 1. Fetch Roadmap and its topics
        const [allRoadmaps, roadmapTopics] = await Promise.all([
          fetchRoadmaps(),
          fetchTopicsByRoadmap(roadmapSlug)
        ])
        
        const currentRoadmap = allRoadmaps.find(r => r.slug === roadmapSlug)
        if (!currentRoadmap) {
          setLoading(false)
          return
        }
        
        setRoadmap(currentRoadmap)
        
        // 2. Fetch stats and progress
        const [roadmapStats, topicProgMapRaw, learningStates] = await Promise.all([
          fetchRoadmapStats(currentRoadmap.id, user?.id),
          user?.id ? fetchTopicCompletionMap(user.id, roadmapTopics.map(t => t.id)) : Promise.resolve({} as Record<string, { total: number, learned: number, percent: number }>),
          user?.id ? fetchResumePointers(user.id) : Promise.resolve(new Map())
        ])
        
        const topicProgMap = topicProgMapRaw as Record<string, { total: number, learned: number, percent: number }>
        setStats(roadmapStats)
        setTopicProgress(topicProgMap)
        
        // 3. Determine Featured and Up Next topics
        const lastTopicId = learningStates.get(currentRoadmap.id)?.last_topic_id
        
        // featured is always the one you just studied, or the first one
        let fId = lastTopicId || roadmapTopics[0]?.id
        setFeaturedId(fId)
        
        // upNext is the first one in curriculum order that is:
        // - not the featured one
        // - not 100% perfected (learned < total)
        const nextTopic = roadmapTopics.find(t => {
          if (t.id === fId) return false
          const p = topicProgMap[t.id]
          if (!p) return true // No progress yet = unstudied
          return p.learned < p.total
        })
        setUpNextId(nextTopic?.id || null)

        // 4. Sort topics (featured first, upNext second)
        const featuredIndex = roadmapTopics.findIndex(t => t.id === fId)
        let finalTopics = [...roadmapTopics]
        
        if (featuredIndex > -1) {
          const featuredTopic = roadmapTopics[featuredIndex]
          const others = roadmapTopics.filter((_, i) => i !== featuredIndex)
          
          // Find nextTopic in others
          const nextId = nextTopic?.id
          const nextIndexInOthers = others.findIndex(t => t.id === nextId)
          
          if (nextIndexInOthers > -1) {
            const nextT = others[nextIndexInOthers]
            const remaining = others.filter((_, i) => i !== nextIndexInOthers)
            finalTopics = [featuredTopic, nextT, ...remaining]
          } else {
            finalTopics = [featuredTopic, ...others]
          }
        }
        
        setTopics(finalTopics)
        
      } catch (err) {
        console.error('Error loading roadmap topics:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [roadmapSlug, user?.id])

  const filteredTopics = useMemo(() => {
    if (!searchQuery) return topics
    const q = searchQuery.toLowerCase()
    return topics.filter(t => 
      t.name.toLowerCase().includes(q) || 
      (t.description?.toLowerCase().includes(q) ?? false)
    )
  }, [topics, searchQuery])

  // Helper to get stats for a specific topic
  const getTopicStats = (topicId: string) => {
    return topicProgress[topicId] || { total: 0, learned: 0, percent: 0 }
  }

  // --- Aesthetic Helpers ---
  const getPastelStyles = (hexColor: string | null) => {
    const color = hexColor || '#D35400'
    // Slightly more visible pastel for the whole block
    return {
      bg: `${color}12`, // ~7% opacity - noticeable but soft
      border: `${color}25`, // ~15% opacity
      accent: color
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
          <p className="text-on-surface-variant font-bold">Đang tải lộ trình...</p>
        </div>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-6">
        <h2 className="text-2xl font-black text-secondary mb-4">Không tìm thấy lộ trình</h2>
        <Link to="/library" className="px-6 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg">
          Quay lại Thư viện
        </Link>
      </div>
    )
  }

  const overallPercent = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0

  return (
    <div className="p-10 max-w-7xl mx-auto">
      {/* Breadcrumb / Back button */}
      <Link to="/library" className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-6 group transition-colors">
        <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="text-sm font-bold uppercase tracking-widest">Back to Roadmaps</span>
      </Link>

      {/* Hero Header Section */}
      <div className="mb-12 relative w-full">
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
          <div className="w-24 h-24 rounded-xl primary-gradient flex items-center justify-center sun-drenched-shadow shrink-0">
            <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {roadmap.slug.includes('kids') ? 'child_care' : roadmap.slug.includes('business') ? 'business_center' : 'history_edu'}
            </span>
          </div>
          <div>
            <span className="label-md uppercase tracking-widest text-secondary font-bold text-xs block mb-1">Roadmap Overview</span>
            <h2 className="text-4xl font-extrabold text-on-surface text-editorial-asymmetry mt-1 leading-tight w-full max-w-3xl">
              {roadmap.name}
            </h2>
          </div>
        </div>

        {/* Progress Board */}
        <div className="bg-surface-container-low rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-secondary-container opacity-20 rounded-full blur-3xl z-0"></div>
          <div className="w-full flex-1 relative z-10">
            <div className="flex justify-between items-end mb-4">
              <span className="text-lg font-medium text-on-surface-variant">Overall Completion</span>
              <span className="text-3xl font-black text-secondary">{overallPercent}%</span>
            </div>
            <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary rounded-full transition-all duration-1000" 
                style={{ width: `${overallPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="flex gap-8 border-t border-outline-variant/20 md:border-t-0 md:border-l pl-0 md:pl-12 pt-6 md:pt-0 w-full md:w-auto relative z-10">
            <div className="text-center">
              <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-tighter mb-1">Total Words</p>
              <p className="text-2xl font-black text-on-surface">{stats.total}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-tighter mb-1">Mastered</p>
              <p className="text-2xl font-black text-on-surface">{stats.mastered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-12 gap-8">
        {filteredTopics.map((topic) => {
          const topicStats = getTopicStats(topic.id)
          const isCompleted = topicStats.total > 0 && topicStats.learned >= topicStats.total
          const isStarted = topicStats.percent > 0
          const styles = getPastelStyles(topic.color)
          
          const isMainLarge = topic.id === featuredId && !searchQuery
          const isUpNext = topic.id === upNextId && !searchQuery

          if (isMainLarge) {
            return (
              <Link
                key={topic.id}
                to={`/study?topic=${topic.slug}&topicId=${topic.id}&roadmapId=${roadmap.id}`}
                className="col-span-12 md:col-span-7 group relative bg-white rounded-3xl p-8 sun-drenched-shadow-lg transition-all hover:scale-[1.01] cursor-pointer overflow-hidden block border border-stone-100"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl ${isCompleted ? 'bg-secondary/10 text-secondary' : 'bg-primary-fixed text-primary'} flex items-center justify-center shadow-inner`}>
                        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {isCompleted ? 'check_circle' : (topic.icon || (topic.slug.includes('animal') ? 'pets' : 'menu_book'))}
                        </span>
                      </div>
                      <div>
                        {isStarted && !isCompleted && (
                          <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest mb-1 inline-block">ĐANG HỌC</span>
                        )}
                        <h3 className="text-2xl font-black text-secondary tracking-tight">{topic.name}</h3>
                        <p className="text-on-surface-variant mt-1 text-sm font-bold opacity-70">
                          {topicStats.total} Words • {topicStats.percent}% mastered
                        </p>
                      </div>
                    </div>
                    {topic.description && (
                      <p className="text-on-surface-variant max-w-sm leading-relaxed line-clamp-2 mt-4 text-[15px] font-medium italic">
                        {topic.description}
                      </p>
                    )}
                    <button className={`${isCompleted ? 'bg-secondary' : 'primary-gradient'} text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 group-hover:shadow-2xl transition-all active:scale-95 mt-6 border-none uppercase tracking-widest `}>
                      <span>{isCompleted ? 'Hoàn thành' : isStarted ? 'Học tiếp (Resume)' : 'Bắt đầu học'}</span>
                      {!isCompleted && <span className="material-symbols-outlined font-variation-fill">bolt</span>}
                    </button>
                  </div>
                  <div className="w-56 h-56 relative hidden xl:block select-none pointer-events-none shrink-0 ml-4 group">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700"></div>
                    <img 
                      alt="Topic illustration" 
                      src={topic.image_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80'} 
                      className="w-full h-full object-cover rounded-[2rem] shadow-2xl relative z-10 transform -rotate-3 group-hover:rotate-0 group-hover:scale-105 transition-all duration-700" 
                    />
                  </div>
                </div>
              </Link>
            )
          }

          if (isUpNext) {
            return (
              <Link
                key={topic.id}
                to={`/study?topic=${topic.slug}&topicId=${topic.id}&roadmapId=${roadmap.id}`}
                className="col-span-12 md:col-span-5 relative group overflow-hidden rounded-3xl"
              >
                {/* Dynamic Wow Border */}
                <div className="absolute inset-0 border-gradient-wow z-0"></div>
                
                <div className="absolute inset-[2px] glass-wow-card rounded-[calc(1.5rem-2px)] z-10 p-8 flex flex-col justify-between transition-all group-hover:bg-white/60">
                  <div className="flex justify-between items-start mb-12">
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        {/* Kinetic Glow Aura (Behind) */}
                        <div className="absolute -inset-4 primary-gradient rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-all duration-500 scale-50 group-hover:scale-100"></div>
                        
                        {/* Main Interaction Circle */}
                        <div 
                          className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl animate-float relative z-10 primary-gradient text-white transition-all duration-500 group-hover:rotate-[10deg]"
                        >
                          {/* Topic Icon: Dissolves on Hover */}
                          <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 group-hover:scale-0">
                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {topic.icon || 'palette'}
                            </span>
                          </div>

                          {/* Play Trigger: Appears on Hover */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-110">
                            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                              play_arrow
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                       <span className="bg-secondary/10 text-secondary text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-sm">UP NEXT</span>
                       <span className="text-[10px] font-black text-stone-400">TARGET: 100%</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-secondary tracking-tight mb-2">{topic.name}</h3>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest opacity-60">
                        {topicStats.total} Words Progress
                      </p>
                      <span className="text-sm font-black text-secondary">{topicStats.percent}%</span>
                    </div>
                    
                    <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-100 shadow-inner p-[2px]">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 liquid-progress primary-gradient" 
                        style={{ width: `${topicStats.percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          }

          {/* Standard Topic: Pastel Card Logic */}
          return (
            <Link
              key={topic.id}
              to={`/study?topic=${topic.slug}&topicId=${topic.id}&roadmapId=${roadmap.id}`}
              className="col-span-12 md:col-span-4 rounded-3xl p-6 transition-all hover:scale-[1.03] hover:shadow-2xl cursor-pointer group block relative overflow-hidden border border-transparent shadow-sm"
              style={{ backgroundColor: styles.bg }}
            >
              <div className="flex items-center gap-5 mb-8">
                <div 
                  className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 bg-white"
                >
                  <span className="material-symbols-outlined text-2xl text-secondary" style={{ fontVariationSettings: "'FILL' 0" }}>
                    {isCompleted ? 'verified' : (topic.icon || 'school')}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-secondary text-[16px] tracking-tight leading-none mb-1.5">{topic.name}</h4>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: styles.accent }}
                    ></span>
                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">
                      {topicStats.total} Từ • {topicStats.percent}%
                    </p>
                  </div>
                </div>
              </div>

              {topic.description && (
                <p className="text-xs text-on-surface-variant/80 mb-6 leading-relaxed line-clamp-2 font-medium">
                  {topic.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-auto">
                {isCompleted ? (
                  <div className="flex items-center gap-2 text-secondary transition-colors">
                    <span className="material-symbols-outlined text-[18px] font-variation-fill">check_circle</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Mastered</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-stone-400 group-hover:text-secondary transition-colors">
                    <span className="material-symbols-outlined text-[18px] font-variation-fill">bolt</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {isStarted ? 'Tiếp tục' : 'Bắt đầu'}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Asymmetric Editorial Quote/Tip Section */}
      <div className="mt-20 flex flex-col md:flex-row items-center gap-12 border-t border-outline-variant/10 pt-12 mb-10">
        <div className="w-full md:w-1/3 relative">
          <div className="absolute -top-4 -left-4 w-12 h-12 bg-tertiary rounded-full opacity-10 blur-xl"></div>
          <p className="text-sm font-label uppercase tracking-[0.2em] text-tertiary mb-2">Scholar's Tip</p>
          <p className="text-xl font-headline italic text-on-surface leading-relaxed">
            "Visualizing words as objects in your mind creates stronger neural pathways for long-term retention."
          </p>
        </div>
        <div className="flex-1 w-full bg-tertiary-container/10 p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-tertiary/10">
          <div className="flex gap-4 items-center">
            <span className="material-symbols-outlined text-tertiary text-4xl">emoji_events</span>
            <div>
              <h5 className="font-bold text-on-surface">Milestone Ahead!</h5>
              <p className="text-sm text-on-surface-variant mt-1">Complete more topics to unlock new achievements.</p>
            </div>
          </div>
          <button className="bg-tertiary text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:brightness-110 active:scale-95 transition-all w-full md:w-auto shadow-sm border-none">
            View Achievements
          </button>
        </div>
      </div>

      {/* Floating Action Element (Contextual) */}
      <div className="fixed bottom-8 right-8 z-30">
        <button className="w-14 h-14 md:w-16 md:h-16 primary-gradient rounded-full sun-drenched-shadow flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-transform shadow-lg border-none cursor-pointer">
          <span className="material-symbols-outlined text-2xl md:text-3xl">question_mark</span>
        </button>
      </div>
    </div>
  )
}
