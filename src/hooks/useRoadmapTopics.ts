import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  fetchRoadmaps,
  fetchTopicsByRoadmap,
  fetchRoadmapStats,
  fetchTopicCompletionMap
} from '../lib/storage/roadmap'
import { fetchResumePointers } from '../lib/supabase-storage'
import type { Topic, Roadmap } from '../lib/types'

export function useRoadmapTopics(roadmapSlug: string | undefined, searchQuery: string) {
  const { user } = useAuth()
  
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

  return {
    roadmap,
    topics: filteredTopics,
    stats,
    loading,
    featuredId,
    upNextId,
    getTopicStats
  }
}
