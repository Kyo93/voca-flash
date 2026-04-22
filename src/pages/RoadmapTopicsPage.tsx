import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, Link, useOutletContext } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  fetchRoadmaps,
  fetchTopicsByRoadmap,
  fetchRoadmapStats,
  fetchTopicCompletionMap
} from '../lib/storage/roadmap'
import { fetchResumePointers } from '../lib/supabase-storage'

import type { Topic, Roadmap } from '../lib/types'
import TopicCard from '../components/roadmap/TopicCard'


export default function RoadmapTopicsPage() {
  const { roadmapSlug } = useParams<{ roadmapSlug: string }>()
  const { user } = useAuth()
  const { searchQuery } = useOutletContext<{ searchQuery: string }>()
  const { t } = useTranslation()

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



  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
          <p className="text-on-surface-variant font-bold">{t('roadmap.loading')}</p>
        </div>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-6">
        <h2 className="text-3xl font-black text-secondary mb-6 tracking-tight">{t('roadmap.notFound')}</h2>
        <Link to="/library" className="px-8 py-4 primary-gradient text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm">
          {t('roadmapDetail.back')}
        </Link>
      </div>
    )
  }

  const overallPercent = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0

  return (
    <div className="max-w-[1440px] mx-auto px-12 py-10 space-y-16">
      {/* Header Section */}
      <header className="space-y-8">
        <Link to="/library" className="inline-flex items-center gap-2 text-on-surface-variant font-semibold hover:text-primary transition-colors group">
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          {t('common.back')}
        </Link>
        <div className="flex flex-col md:flex-row md:items-end gap-10">
          <div className="w-28 h-28 shrink-0 bg-linear-to-br from-primary to-primary-container rounded-[24px] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(148,74,0,0.3)]">
            <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {roadmap.slug.includes('kids') ? 'child_care' : roadmap.slug.includes('business') ? 'business_center' : 'history_edu'}
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl font-bold editorial-asymmetry leading-none text-on-surface">
              {roadmap.name}
            </h1>
            <div className="flex items-center gap-4 bg-surface-container-low w-fit px-5 py-2.5 rounded-full">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <img 
                    key={i}
                    src={`https://i.pravatar.cc/100?u=${i + 40}`} 
                    className="w-8 h-8 rounded-full border-2 border-surface-container-low" 
                    alt="Scholar" 
                  />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-secondary-fixed flex items-center justify-center text-[10px] font-bold text-on-secondary-fixed">+2k</div>
              </div>
              <span className="text-sm font-semibold text-on-surface-variant italic">{t('roadmapDetail.social')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mastery Progress Board */}
      <section className="bg-surface-container-lowest rounded-[40px] p-10 shadow-[0_40px_60px_-10px_rgba(113,55,0,0.06)] border border-outline-variant/15">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-12">
          <div className="md:col-span-3">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-outline mb-2 block">{t('roadmapDetail.masteryProgress')}</span>
            <div className="text-7xl font-black tracking-tighter text-primary leading-none">{overallPercent}%</div>
          </div>
          <div className="md:col-span-6 space-y-6">
            <div className="relative h-4 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-[#829460] rounded-full liquid-shine transition-all duration-1000"
                style={{ width: `${overallPercent}%` }}
              ></div>
            </div>
            <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
              {t('roadmapDetail.topLearner')}
            </p>
          </div>
          <div className="md:col-span-3 grid grid-cols-1 gap-4 border-l border-surface-container-high pl-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container text-lg">book</span>
              <div>
                <div className="text-xl font-bold">{stats.total}</div>
                <div className="text-[10px] uppercase tracking-wider text-outline font-bold">{t('roadmapDetail.totalWords')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <div>
                <div className="text-xl font-bold">{stats.mastered}</div>
                <div className="text-[10px] uppercase tracking-wider text-outline font-bold">{t('roadmapDetail.masteredGems')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
        {filteredTopics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            roadmapId={roadmap.id}
            stats={getTopicStats(topic.id)}
            isFeatured={topic.id === featuredId}
            isUpNext={topic.id === upNextId}
            searchQuery={searchQuery}
          />
        ))}
      </section>

      {/* Scholar's Footer */}
      <footer className="bg-surface-container rounded-t-[60px] mt-20 -mx-12">
        <div className="flex flex-col md:flex-row justify-between items-end w-full px-16 py-20 max-w-[1440px] mx-auto gap-12">
          <div className="max-w-md space-y-6">
            <div className="text-xl font-bold text-on-surface">VocaFlash</div>
            <p className="font-headline italic text-lg leading-[1.6] text-on-surface-variant">
              {t('roadmapDetail.footer.quote')}
            </p>
            <p className="text-sm font-semibold text-outline">{t('roadmapDetail.footer.copyright')}</p>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-12 items-end">
            <div className="flex flex-col gap-4 text-right">
              <a className="text-on-surface-variant hover:text-primary transition-colors font-semibold" href="#">{t('roadmapDetail.footer.philosophy')}</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-semibold" href="#">{t('roadmapDetail.footer.research')}</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-semibold" href="#">{t('roadmapDetail.footer.privacy')}</a>
            </div>
            <div className="bg-secondary-container/40 p-10 rounded-[32px] space-y-6 w-full sm:w-[320px]">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-black text-on-secondary-container">{t('roadmapDetail.milestone.title')}</span>
                <h4 className="text-2xl font-bold mt-1 text-on-secondary-container">{t('roadmapDetail.milestone.name')}</h4>
              </div>
              <p className="text-sm text-on-secondary-container/80 leading-relaxed">{t('roadmapDetail.milestone.desc')}</p>
              <button className="w-full bg-secondary text-on-secondary py-4 rounded-full font-bold hover:shadow-lg hover:shadow-secondary/20 transition-all">{t('roadmapDetail.milestone.view')}</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
