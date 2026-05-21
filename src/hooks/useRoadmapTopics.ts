import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchRoadmapDetailData } from '../lib/storage/roadmap'
import type { Topic, Roadmap } from '../lib/types'

export function useRoadmapTopics(roadmapSlug: string | undefined, searchQuery: string) {
  const { user } = useAuth()
  
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [stats, setStats] = useState({ total: 0, learned: 0, mastered: 0 })
  const [topicProgress, setTopicProgress] = useState<Record<string, { total: number, learned: number, mastered: number, percent: number }>>({})
  const [featuredId, setFeaturedId] = useState<string | null>(null)
  const [upNextId, setUpNextId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!roadmapSlug) {
        setLoading(false)
        return
      }
      setLoading(true)

      try {
        const detail = await fetchRoadmapDetailData(user?.id, roadmapSlug)

        setRoadmap(detail.roadmap)
        setStats(detail.stats)
        setTopicProgress(detail.topicProgress)
        setFeaturedId(detail.featuredId)
        setUpNextId(detail.upNextId)
        setTopics(detail.topics)

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
    return topicProgress[topicId] || { total: 0, learned: 0, mastered: 0, percent: 0 }
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
