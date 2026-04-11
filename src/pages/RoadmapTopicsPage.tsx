import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useOutletContext } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  fetchRoadmaps, 
  fetchTopicsByRoadmap, 
  fetchRoadmapStats, 
  fetchUserProgress,
  fetchWords
} from '../lib/supabase-storage'
import type { Topic, Roadmap, CardProgress } from '../lib/types'

export default function RoadmapTopicsPage() {
  const { roadmapSlug } = useParams<{ roadmapSlug: string }>()
  const { user } = useAuth()
  const { searchQuery } = useOutletContext<{ searchQuery: string }>()
  
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [stats, setStats] = useState({ total: 0, mastered: 0 })
  const [userProgress, setUserProgress] = useState<Map<string, CardProgress>>(new Map())
  const [topicWords, setTopicWords] = useState<Record<string, string[]>>({}) // topicId -> wordIds
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!roadmapSlug) return
      setLoading(true)
      
      try {
        // 1. Fetch Roadster and its topics
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
        setTopics(roadmapTopics)
        
        // 2. Fetch stats and progress
        const [roadmapStats, progress] = await Promise.all([
          fetchRoadmapStats(currentRoadmap.id, user?.id),
          user?.id ? fetchUserProgress(user.id) : Promise.resolve(new Map())
        ])
        
        setStats(roadmapStats)
        setUserProgress(progress)
        
        // 3. Fetch words for each topic to calculate per-topic progress
        const wordsByTopic: Record<string, string[]> = {}
        await Promise.all(roadmapTopics.map(async (topic) => {
          const cards = await fetchWords(topic.slug)
          wordsByTopic[topic.id] = cards.map(c => c.id)
        }))
        setTopicWords(wordsByTopic)
        
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
    const wordIds = topicWords[topicId] || []
    if (wordIds.length === 0) return { total: 0, mastered: 0, percent: 0 }
    
    const mastered = wordIds.filter(id => userProgress.get(id)?.mastered).length
    return {
      total: wordIds.length,
      mastered,
      percent: Math.round((mastered / wordIds.length) * 100)
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {/* Breadcrumb / Back button */}
          <Link to="/library" className="flex items-center gap-2 text-stone-500 hover:text-primary mb-6 group transition-colors">
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="text-sm font-bold uppercase tracking-widest">Back to Roadmaps</span>
          </Link>

          {/* Hero Header Section */}
          <div className="mb-12 relative">
            <div className="flex items-end gap-6 mb-8">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl primary-gradient flex items-center justify-center sun-drenched-shadow shrink-0">
                <span className="material-symbols-outlined text-white text-4xl md:text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {roadmap.slug.includes('kids') ? 'child_care' : roadmap.slug.includes('business') ? 'business_center' : 'history_edu'}
                </span>
              </div>
              <div>
                <span className="label-md uppercase tracking-widest text-secondary font-bold text-xs">Roadmap Overview</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface text-editorial-asymmetry mt-1 leading-tight">
                  {roadmap.name}
                </h2>
              </div>
            </div>

            {/* Progress Board */}
            <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 relative overflow-hidden shadow-sm border border-stone-100">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-orange-100 opacity-20 rounded-full blur-3xl"></div>
              <div className="w-full flex-1">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-base md:text-lg font-medium text-on-surface-variant">Overall Completion</span>
                  <span className="text-2xl md:text-3xl font-black text-secondary">{overallPercent}%</span>
                </div>
                <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary rounded-full transition-all duration-1000" 
                    style={{ width: `${overallPercent}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex gap-8 border-t md:border-t-0 md:border-l border-stone-100 w-full md:w-auto pt-6 md:pt-0 md:pl-12">
                <div className="text-center">
                  <p className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-tighter mb-1">Total Words</p>
                  <p className="text-xl md:text-2xl font-black text-on-surface">{stats.total}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-tighter mb-1">Mastered</p>
                  <p className="text-xl md:text-2xl font-black text-on-surface">{stats.mastered}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-12 gap-6 md:gap-8">
            {filteredTopics.map((topic, index) => {
              const topicStats = getTopicStats(topic.id)
              const isLarge = index === 0 && !searchQuery // First one is larger
              
              return (
                <div 
                  key={topic.id}
                  className={`${isLarge ? 'col-span-12 md:col-span-7' : 'col-span-12 md:col-span-5 lg:col-span-4'} group relative bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-stone-100 transition-all hover:bg-orange-50/20 hover:border-orange-200/50 cursor-pointer overflow-hidden flex flex-col justify-between`}
                >
                  <div className={`flex ${isLarge ? 'flex-row items-center gap-6' : 'flex-col items-start'}`}>
                    <div className={`${isLarge ? 'w-16 h-16' : 'w-12 h-12 mb-6'} rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0`}>
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {topic.slug.includes('animal') ? 'pets' : 'menu_book'}
                      </span>
                    </div>
                    <div>
                      <h3 className={`${isLarge ? 'text-2xl' : 'text-xl'} font-bold text-on-surface`}>{topic.name}</h3>
                      <p className="text-on-surface-variant text-sm mt-1">
                        {topicStats.total} Words • {topicStats.percent}% mastered
                      </p>
                    </div>
                  </div>

                  {!isLarge && (
                    <div className="mt-8 mb-6">
                      <div className="h-2 w-full bg-stone-100 rounded-full">
                        <div 
                          className="h-full bg-secondary rounded-full" 
                          style={{ width: `${topicStats.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {isLarge && topic.description && (
                    <p className="text-on-surface-variant mt-6 mb-8 leading-relaxed max-w-sm">
                      {topic.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <Link 
                      to={`/study?topic=${topic.slug}`}
                      className={`primary-gradient text-white ${isLarge ? 'px-8 py-3' : 'px-4 py-2 text-sm'} rounded-xl font-bold flex items-center gap-2 group-hover:shadow-lg transition-all active:scale-95`}
                    >
                      <span>{topicStats.percent > 0 ? 'Continue' : 'Start'}</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>

                  {/* Icon reflection for flair */}
                  <span className="absolute -right-4 -bottom-4 text-8xl text-orange-100 opacity-10 material-symbols-outlined group-hover:scale-110 transition-transform select-none pointer-events-none">
                    {topic.slug.includes('animal') ? 'pets' : 'menu_book'}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Scholar's Tip Section */}
          <div className="mt-20 flex flex-col md:flex-row items-center gap-8 md:gap-12 border-t border-stone-100 pt-12">
            <div className="md:w-1/3 relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-orange-200 rounded-full opacity-20 blur-xl"></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600 mb-2">Scholar's Tip</p>
              <p className="text-lg italic text-on-surface leading-relaxed font-medium">
                "Visualizing words as objects in your mind creates stronger neural pathways for long-term retention."
              </p>
            </div>
            <div className="flex-1 bg-stone-100/50 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex gap-4 items-center">
                <span className="material-symbols-outlined text-orange-600 text-4xl">emoji_events</span>
                <div>
                  <h5 className="font-bold text-on-surface">Milestone Ahead!</h5>
                  <p className="text-sm text-on-surface-variant">Complete more topics to unlock new achievements.</p>
                </div>
              </div>
              <button className="bg-secondary text-white px-6 py-2 rounded-xl text-sm font-bold hover:brightness-110 active:scale-95 transition-all w-full md:w-auto">
                View Achievements
              </button>
            </div>
          </div>
    </div>
  )
}
