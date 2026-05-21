import { supabase } from '../supabase'
import type { Topic, Roadmap, InitialAppData, ProgressPageData, LibraryPageData, DashboardSummary, UserProfile } from '../types'
import { fetchPaginated } from './base'
import { getEndOfStudyDay } from '../utils'
import { fetchResumePointers } from './session'

const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000'
/** Forecast 7 ngày mặc định khi chưa có dữ liệu (Mon..Sun rỗng). */
const FORECAST_DAYS = 7
const emptyForecast = (): number[] => Array<number>(FORECAST_DAYS).fill(0)

const createEmptyAppData = (profile: UserProfile | null = null): InitialAppData => ({
  profile,
  stats: { total_words: 0, mastered: 0, learning: 0 },
  health: {
    retention_rate: 0,
    avg_stability: 0,
    new_today: 0,
    due_today: 0,
    stability_distribution: { fresh: 0, stable: 0, rooted: 0 },
    forecast: emptyForecast(),
  },
  active_roadmap: null,
  global_review_count: 0,
})

const createEmptyProgressData = (): ProgressPageData => ({
  memory_health: { learning: 0, new_today: 0, mastered: 0, mastered_today: 0, due: 0, orphaned: 0, weak: 0 },
  roadmap_progress: [],
  overall_stats: { streak_days: 0, total_mastered: 0 }
})

export interface TopicProgressStat {
  total: number
  learned: number
  mastered: number
  percent: number
}

export interface RoadmapDetailData {
  roadmap: Roadmap | null
  topics: Topic[]
  stats: { total: number; learned: number; mastered: number }
  topicProgress: Record<string, TopicProgressStat>
  featuredId: string | null
  upNextId: string | null
}

const emptyRoadmapDetail = (): RoadmapDetailData => ({
  roadmap: null,
  topics: [],
  stats: { total: 0, learned: 0, mastered: 0 },
  topicProgress: {},
  featuredId: null,
  upNextId: null,
})

function normalizeTopicProgress(raw: unknown): Record<string, TopicProgressStat> {
  if (!raw) return {}

  if (Array.isArray(raw)) {
    return Object.fromEntries(raw.map(row => [
      row.topic_id,
      {
        total: Number(row.total ?? row.total_words ?? 0),
        learned: Number(row.learned ?? row.learned_count ?? 0),
        mastered: Number(row.mastered ?? row.mastered_count ?? 0),
        percent: Number(row.percent ?? row.percent_complete ?? 0),
      },
    ]))
  }

  return Object.fromEntries(Object.entries(raw as Record<string, TopicProgressStat>).map(([topicId, stat]) => [
    topicId,
    {
      total: Number(stat.total ?? 0),
      learned: Number(stat.learned ?? 0),
      mastered: Number(stat.mastered ?? 0),
      percent: Number(stat.percent ?? 0),
    },
  ]))
}

/**
 * Fallback path: RPC `get_initial_app_data_v2` chưa deploy hoặc lỗi → đọc profile trực tiếp
 * từ `user_profiles` để UI vẫn hiển thị được.
 */
async function fetchProfileFallback(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return (data as UserProfile | null) ?? null
}

export async function fetchInitialAppData(userId: string): Promise<InitialAppData> {
  const { data, error } = await supabase.rpc('get_initial_app_data_v2', { p_user_id: userId })

  if (error) {
    console.error('[Storage] Error fetching initial app data:', error)
    const profile = await fetchProfileFallback(userId)
    return createEmptyAppData(profile)
  }

  const result = data || {}
  const health = result.health || {}
  
  return {
    profile: result.profile || null,
    stats: result.stats || { total_words: 0, mastered: 0, learning: 0 },
    health: { 
      retention_rate: health.retention_rate ?? 0, 
      avg_stability: health.avg_stability ?? 0, 
      new_today: health.new_today ?? 0, 
      due_today: health.due_today ?? 0, 
      mastered_today: health.mastered_today ?? 0, 
      forecast: health.forecast ?? emptyForecast(),
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
    return createEmptyProgressData()
  }

  return (data || createEmptyProgressData()) as ProgressPageData
}

export async function fetchLibraryPageData(userId: string | undefined): Promise<LibraryPageData[]> {
  const { data, error } = await supabase.rpc('get_library_page_data', { 
    p_user_id: userId || GUEST_USER_ID
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

async function fetchRoadmapDetailDataFallback(userId: string | undefined, roadmapSlug: string): Promise<RoadmapDetailData> {
  const [allRoadmaps, roadmapTopics] = await Promise.all([
    fetchRoadmaps(),
    fetchTopicsByRoadmap(roadmapSlug),
  ])

  const currentRoadmap = allRoadmaps.find(r => r.slug === roadmapSlug)
  if (!currentRoadmap) return emptyRoadmapDetail()

  const [roadmapStats, topicProgress, learningStates] = await Promise.all([
    fetchRoadmapStats(currentRoadmap.id, userId),
    userId ? fetchTopicCompletionMap(userId, roadmapTopics.map(t => t.id)) : Promise.resolve({} as Record<string, TopicProgressStat>),
    userId ? fetchResumePointers(userId) : Promise.resolve(new Map()),
  ])

  const lastTopicId = learningStates.get(currentRoadmap.id)?.last_topic_id
  const featuredId = lastTopicId || roadmapTopics[0]?.id || null
  const nextTopic = roadmapTopics.find(t => {
    if (t.id === featuredId) return false
    const progress = topicProgress[t.id]
    if (!progress) return true
    return progress.learned < progress.total
  })
  const upNextId = nextTopic?.id || null

  const featuredIndex = roadmapTopics.findIndex(t => t.id === featuredId)
  let sortedTopics = [...roadmapTopics]

  if (featuredIndex > -1) {
    const featuredTopic = roadmapTopics[featuredIndex]
    const others = roadmapTopics.filter((_, i) => i !== featuredIndex)
    const nextIndexInOthers = others.findIndex(t => t.id === upNextId)

    if (nextIndexInOthers > -1) {
      const upNextTopic = others[nextIndexInOthers]
      const remaining = others.filter((_, i) => i !== nextIndexInOthers)
      sortedTopics = [featuredTopic, upNextTopic, ...remaining]
    } else {
      sortedTopics = [featuredTopic, ...others]
    }
  }

  return {
    roadmap: currentRoadmap,
    topics: sortedTopics,
    stats: roadmapStats,
    topicProgress,
    featuredId,
    upNextId,
  }
}

export async function fetchRoadmapDetailData(userId: string | undefined, roadmapSlug: string): Promise<RoadmapDetailData> {
  const { data, error } = await supabase.rpc('get_roadmap_detail_data', {
    p_user_id: userId ?? GUEST_USER_ID,
    p_roadmap_slug: roadmapSlug,
  })

  if (error) {
    console.error('[Storage] fetchRoadmapDetailData error:', error)
    return fetchRoadmapDetailDataFallback(userId, roadmapSlug)
  }

  const payload = (Array.isArray(data) ? data[0] : data) ?? {}
  const roadmap = (payload.roadmap as Roadmap | null) ?? null
  if (!roadmap) return emptyRoadmapDetail()

  return {
    roadmap,
    topics: (payload.topics ?? []) as Topic[],
    stats: {
      total: Number(payload.stats?.total ?? 0),
      learned: Number(payload.stats?.learned ?? 0),
      mastered: Number(payload.stats?.mastered ?? 0),
    },
    topicProgress: normalizeTopicProgress(payload.topic_progress),
    featuredId: payload.featured_id ?? null,
    upNextId: payload.up_next_id ?? null,
  }
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
  const queryJunctions = supabase.from('topic_words').select('word_id').in('topic_id', topicIds)
  const junctions = await fetchPaginated<{ word_id: string }>(queryJunctions)
  
  const wordIds = [...new Set((junctions ?? []).map(j => j.word_id))]
  const total = wordIds.length

  if (!userId || total === 0) return { total, learned: 0, mastered: 0 }

  const queryProgress = supabase
    .from('user_srs_records')
    .select('mastered')
    .eq('user_id', userId)
    .in('word_id', wordIds)
  
  const progress = await fetchPaginated<{ mastered: boolean }>(queryProgress)

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
  const [globalCountRes, pointerRes, roadmapRes] = await Promise.all([
    supabase
      .from('user_srs_records')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('mastered', false)
      .lte('next_review_at', getEndOfStudyDay().toISOString()),
    supabase
      .from('user_resume_pointers')
      .select('last_topic_id, roadmap_id')
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('roadmaps')
      .select('id')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  const globalReviewCount = globalCountRes.count ?? 0
  const pointer = pointerRes.data
  const roadmap = roadmapRes.data

  const [resumeTopicRes, fallbackTopicsRes] = await Promise.all([
    pointer?.last_topic_id
      ? supabase.from('topics').select('*').eq('id', pointer.last_topic_id).single()
      : Promise.resolve({ data: null }),
    roadmap
      ? supabase.from('topics').select('*').eq('roadmap_id', roadmap.id).order('sort_order').limit(2)
      : Promise.resolve({ data: null }),
  ])

  const resumeTopic = (resumeTopicRes.data as Topic | null) ?? null
  const fallbackTopics = (fallbackTopicsRes.data as Topic[] | null) ?? []

  return { resumeTopic, fallbackTopics, globalReviewCount }
}
