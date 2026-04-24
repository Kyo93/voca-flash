import { useEffect, useState } from 'react'
import i18n from '../i18n'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface AnalyticsData {
  retention_rate: number
  review_activity: { date: string; reviews: number; duration_ms: number }[]
  weak_words: { id: string; word: string; meaning: string; fail_count: number }[]
  total_time_ms: number
  mastered_count: number
  mastery_distribution: {
    new?: number
    learning?: number
    review?: number
    relearning?: number
  }
  workload_forecast: { date: string; count: number }[]
  heatmap_data: { date: string; count: number }[]
  streak_days: number
  topic_stats: {
    topic: string
    states: {
      new?: number
      learning?: number
      review?: number
      relearning?: number
    }
  }[]
  learning_velocity: {
    avg_new_per_day: number
    avg_reviews_per_day: number
  }
}

export function useAnalytics() {
  const { user } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    async function fetchAnalytics() {
      try {
        setIsLoading(true)
        const { data: result, error: rpcError } = await supabase.rpc('get_user_progress_analytics', {
          p_user_id: user?.id
        })

        if (rpcError) throw rpcError
        setData(result as AnalyticsData)
      } catch (err) {
        console.error('[useAnalytics] Error:', err)
        setError(i18n.t('analytics.errors.loadFailed'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [user?.id])

  return { data, isLoading, error }
}
