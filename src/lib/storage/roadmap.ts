import { supabase } from '../supabase'
import type { Topic, Roadmap, InitialAppData, ProgressPageData, LibraryPageData, DashboardSummary } from '../types'

export async function fetchInitialAppData(userId: string): Promise<InitialAppData> {
  const { data, error } = await supabase.rpc('get_initial_app_data_v2', { p_user_id: userId })

  if (error) {
    console.error('[Storage] Error fetching initial app data:', error)
    // Fallback: load profile directly from user_profiles table
    // (handles case where RPC not deployed yet on Supabase)
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    return {
      profile: profileData || null,
      stats: { total_words: 0, mastered: 0, learning: 0 },
      health: {
        retention_rate: 0.9,
        avg_stability: 0,
        new_today: 0,
        due_today: 0,
        stability_distribution: { fresh: 0, stable: 0, rooted: 0 },
        forecast: [0, 0, 0, 0, 0, 0, 0]
      },
      active_roadmap: null,
      global_review_count: 0
    }
  }

  const result = data || {}
  const health = result.health || {}
  
  return {
    profile: result.profile || null,
    stats: result.stats || { total_words: 0, mastered: 0, learning: 0 },
    health: { 
      retention_rate: health.retention_rate ?? 0.9, 
      avg_stability: health.avg_stability ?? 0, 
      new_today: health.new_today ?? 0, 
      due_today: health.due_today ?? 0, 
      mastered_today: health.mastered_today ?? 0, 
      forecast: health.forecast ?? [0, 0, 0, 0, 0, 0, 0],
      stability_distribution: health.stability_distribution || { fresh: 0, stable: 0, rooted: 0 }
    },
    active_roadmap: result.active_roadmap || null,
    global_review_count: result.global_review_count || 0
  } as InitialAppData
}

export async function fetchProgressPageData(userId: string): Promise<ProgressPageData> {
  const { data, error } = await supabase.rpc('get_progress_page_data_v2', { p_user_id: userId })
  
  if (error) {
    console.error('[Storage] Error fetching progress page data:', error)
    return {
      memory_health: { learning: 0, new_today: 0, mastered: 0, mastered_today: 0, due: 0, orphaned: 0, weak: 0 },
      roadmap_progress: [],
      overall_stats: { streak_days: 0, total_mastered: 0 }
    }
  }

  return (data || {
    memory_health: { learning: 0, new_today: 0, mastered: 0, mastered_today: 0, due: 0, orphaned: 0, weak: 0 },
    roadmap_progress: [],
    overall_stats: { streak_days: 0, total_mastered: 0 }
  }) as ProgressPageData
}

export async function fetchLibraryPageData(userId: string | undefined): Promise<LibraryPageData[]> {
  const { data, error } = await supabase.rpc('get_library_page_data', { 
    p_user_id: userId || '00000000-0000-0000-0000-000000000000'
  })
  if (error) throw error
  return (data || []) as LibraryPageData[]
}

export async function fetchRoadmaps(): Promise<Roadmap[]> {
  const { data, error } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('is_active', true)
    .order('created_at')
  if (error) return []
  return (data as Roadmap[]) ?? []
}

export async function fetchTopicsByRoadmap(roadmapSlug: string): Promise<Topic[]> {
  const { data: roadmap } = await supabase.from('roadmaps').select('id').eq('slug', roadmapSlug).single()
  if (!roadmap) return []

  const { data, error } = await supabase.from('topics').select('*').eq('roadmap_id', roadmap.id).order('sort_order')
  if (error) return []
  return (data as Topic[]) ?? []
}

export async function fetchAllTopics(): Promise<Topic[]> {
  const { data, error } = await supabase.from('topics').select('*').order('name')
  if (error) throw error
  return data || []
}

export async function fetchRoadmapStats(roadmapId: string, userId?: string) {
  const { data: topics } = await supabase.from('topics').select('id').eq('roadmap_id', roadmapId)
  if (!topics?.length) return { total: 0, learned: 0, mastered: 0 }

  const topicIds = topics.map(t => t.id)
  const { data: junctions } = await supabase.from('topic_words').select('word_id').in('topic_id', topicIds)
  const wordIds = [...new Set((junctions ?? []).map(j => j.word_id))]
  const total = wordIds.length

  if (!userId || total === 0) return { total, learned: 0, mastered: 0 }

  const { data: progress } = await supabase
    .from('user_srs_records')
    .select('mastered')
    .eq('user_id', userId)
    .in('word_id', wordIds)

  if (!progress) return { total, learned: 0, mastered: 0 }

  const learned = progress.length
  const mastered = progress.filter(p => p.mastered).length

  return { total, learned, mastered }
}

export async function fetchTopicCompletionMap(
  userId: string,
  topicIds: string[]
): Promise<Record<string, { total: number; learned: number; mastered: number; percent: number }>> {
  const { data, error } = await supabase.rpc('get_topic_completion_stats', { 
    p_user_id: userId, 
    p_topic_ids: topicIds 
  })

  if (error) {
    console.error('[Storage] fetchTopicCompletionMap error:', error)
    return Object.fromEntries(topicIds.map(id => [id, { total: 0, learned: 0, mastered: 0, percent: 0 }]))
  }

  const result: Record<string, { total: number; learned: number; mastered: number; percent: number }> = {}
  for (const row of (data || [])) {
    result[row.topic_id] = {
      total: Number(row.total_words),
      learned: Number(row.learned_count),
      mastered: Number(row.mastered_count),
      percent: Number(row.percent_complete)
    }
  }
  return result
}

export async function fetchDashboardSummary(userId: string): Promise<DashboardSummary> {
  const { count: globalReviewCount } = await supabase
    .from('user_srs_records')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('mastered', false)
    .lte('next_review_at', new Date().toISOString())

  const { data: pointer } = await supabase
    .from('user_resume_pointers')
    .select('last_topic_id, roadmap_id')
    .eq('user_id', userId)
    .order('last_accessed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let resumeTopic: Topic | null = null
  if (pointer?.last_topic_id) {
    const { data: topic } = await supabase.from('topics').select('*').eq('id', pointer.last_topic_id).single()
    if (topic) resumeTopic = topic as Topic
  }

  const { data: roadmap } = await supabase
    .from('roadmaps')
    .select('id')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  let fallbackTopics: Topic[] = []
  if (roadmap) {
    const { data: topics } = await supabase.from('topics').select('*').eq('roadmap_id', roadmap.id).order('sort_order').limit(2)
    if (topics) fallbackTopics = topics as Topic[]
  }

  return { resumeTopic, fallbackTopics, globalReviewCount: globalReviewCount ?? 0 }
}
