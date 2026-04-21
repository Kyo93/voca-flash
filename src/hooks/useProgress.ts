import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchProgressPageData } from '../lib/supabase-storage'

interface RoadmapProgress {
  id: string
  name: string
  slug: string
  total: number
  mastered: number
  percent: number
}

export function useProgress() {
  const { user, profile, initialData } = useAuth()
  const [roadmapProgress, setRoadmapProgress] = useState<RoadmapProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
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

  const stabilityBins = useMemo(() => {
    if (!initialData?.health.stability_distribution) return []
    
    const fresh = initialData.health.stability_distribution.fresh ?? 0
    const stable = initialData.health.stability_distribution.stable ?? 0
    const rooted = initialData.health.stability_distribution.rooted ?? 0
    const total = fresh + stable + rooted || 1

    return [
      { 
        label: 'status.fresh', 
        value: fresh, 
        desc: 'Độ bền < 5 ngày',
        color: 'text-emerald-500', 
        bg: 'bg-emerald-50',
        pct: (fresh / total) * 100
      },
      { 
        label: 'status.stable', 
        value: stable, 
        desc: 'Độ bền 5-30 ngày',
        color: 'text-blue-500', 
        bg: 'bg-blue-50',
        pct: (stable / total) * 100
      },
      { 
        label: 'status.rooted', 
        value: rooted, 
        desc: 'Độ bền > 30 ngày',
        color: 'text-purple-600', 
        bg: 'bg-purple-50',
        pct: (rooted / total) * 100
      }
    ]
  }, [initialData?.health.stability_distribution])

  const forecastData = useMemo(() => {
    return initialData?.health.forecast || []
  }, [initialData?.health.forecast])

  return {
    profile,
    initialData,
    roadmapProgress,
    stabilityBins,
    forecastData,
    loading,
    displayName: profile?.display_name ?? profile?.email?.split('@')[0] ?? 'Nhà thông thái'
  }
}
