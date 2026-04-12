/**
 * supabase-storage.ts
 * Phase 10: Replace localStorage with Supabase-backed storage.
 *
 * Student app now reads/writes:
 *   - words (+ topics) from Supabase (was: loadCards from localStorage)
 *   - user_progress from Supabase (was: loadProgress from localStorage)
 *
 * The localStorage functions (storage.ts) are kept for offline fallback
 * and can be deleted after Phase 10 is verified stable.
 */

import { supabase } from './supabase'
import type { Topic, Roadmap, Word, SrsRecord, UserProfile, WordChoice, ResumePointer, MasteryWord } from './types'
import type { Card, CardProgress } from './srs'

// ── Mapping: Word (Supabase) → Card (student app) ────────────

function mapWordToCard(word: Word, topicSlug?: string): Card {
  return {
    id: word.id,
    front: word.word,
    back: word.definition,
    example: word.example ?? undefined,
    image_url: word.image_url ?? undefined,
    image_position: word.image_position ?? 'center',
    topic: topicSlug ?? word.topics?.slug ?? 'general',
    createdAt: new Date(word.created_at).getTime(),
  }
}

// ── Words ────────────────────────────────────────────────────

/**
 * Fetch all words from Supabase with topic info.
 * Optionally filter by topic slug.
 */
export async function fetchWords(topicSlug?: string): Promise<Card[]> {
  if (topicSlug) {
    // 1. Lấy topic ID
    const { data: topicData } = await supabase
      .from('topics')
      .select('id, slug')
      .eq('slug', topicSlug)
      .single()
    if (!topicData) return []

    // 2. Lấy word IDs qua junction table
    const { data: junctionRows } = await supabase
      .from('topic_words')
      .select('word_id')
      .eq('topic_id', topicData.id)
      .order('sort_order')

    if (!junctionRows?.length) return []

    // 3. Lấy word details
    const wordIds = junctionRows.map(r => r.word_id)
    const { data: words, error } = await supabase
      .from('words')
      .select('*')
      .in('id', wordIds)

    if (error) {
      console.error('[supabase-storage] fetchWords error:', error)
      return []
    }

    return (words ?? []).map(w => mapWordToCard(w, topicSlug))
  }

  // Fallback: all words (no topic filter)
  const { data, error } = await supabase.from('words').select('*')
  if (error) {
    console.error('[supabase-storage] fetchWords error:', error)
    return []
  }
  return (data ?? []).map(w => mapWordToCard(w))
}

// ── Progress ─────────────────────────────────────────────────

/**
 * Fetch user's progress from Supabase.
 * Returns a Map<cardId, CardProgress> matching the SRS algorithm.
 */
export async function fetchSrsStates(userId: string): Promise<Map<string, CardProgress>> {
  const PAGE_SIZE = 1000
  const map = new Map<string, CardProgress>()
  let from = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('user_srs_records')
      .select('*')
      .eq('user_id', userId)
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      console.error('[supabase-storage] fetchSrsStates error:', error)
      break
    }

    const progressList = (data as SrsRecord[]) ?? []
    for (const p of progressList) {
      map.set(p.word_id, {
        cardId: p.word_id,
        ease: p.ease_factor,
        interval: p.interval_days,
        repetitions: p.repetitions,
        nextReview: p.next_review_at
          ? new Date(p.next_review_at).getTime()
          : Date.now(),
        lastReview: p.last_reviewed
          ? new Date(p.last_reviewed).getTime()
          : 0,
      })
    }

    hasMore = progressList.length === PAGE_SIZE
    from += PAGE_SIZE
  }

  return map
}

/**
 * Upsert a single word's progress to Supabase.
 * Called after each SRS rating in useFlashcard.
 */
export async function upsertSrsRecord(
  userId: string,
  cardId: string,
  update: { 
    repetitions: number; 
    incrementWrong: number; 
    mastered: boolean;
    ease: number;
    interval: number;
    nextReview: number;
  }
): Promise<void> {
  // First try to get existing record
  const { data: existing } = await supabase
    .from('user_srs_records')
    .select('lapse_count')
    .eq('user_id', userId)
    .eq('word_id', cardId)
    .maybeSingle()

  const newLapse = (existing?.lapse_count ?? 0) + update.incrementWrong

  const { error } = await supabase
    .from('user_srs_records')
    .upsert({
      user_id: userId,
      word_id: cardId,
      repetitions: update.repetitions,
      lapse_count: newLapse,
      ease_factor: update.ease,
      interval_days: update.interval,
      next_review_at: new Date(update.nextReview).toISOString(),
      mastered: update.mastered,
      last_reviewed: new Date().toISOString(),
    }, {
      onConflict: 'user_id,word_id',
    })

  if (error) {
    console.error('[supabase-storage] upsertSrsRecord error:', error)
  }
}

/**
 * Fetch due words for the global Review Mode.
 * Filters by next_review_at <= now AND mastered = false.
 * Limits to 20 words, prioritizing those with higher lapse_count.
 */
export async function fetchReviewWords(userId: string): Promise<{ word: Word; progress: CardProgress; choices: string[] }[]> {
  // 1. Get due records
  const { data: records, error: srsError } = await supabase
    .from('user_srs_records')
    .select('*')
    .eq('user_id', userId)
    .eq('mastered', false)
    .lte('next_review_at', new Date().toISOString())
    .order('lapse_count', { ascending: false })
    .limit(20)

  if (srsError || !records) {
    console.error('[supabase-storage] fetchReviewWords error:', srsError)
    return []
  }

  const wordIds = records.map(r => r.word_id)
  if (wordIds.length === 0) return []

  // 2. Fetch word details + choices in parallel
  const [wordsRes, choicesRes] = await Promise.all([
    supabase.from('words').select('*, topics(id, name, slug, color)').in('id', wordIds),
    supabase.from('word_choices').select('*').in('word_id', wordIds)
  ])

  if (wordsRes.error) {
    console.error('[supabase-storage] fetch words error:', wordsRes.error)
    return []
  }

  const words = wordsRes.data as Word[]
  const choicesData = (choicesRes.data as WordChoice[]) ?? []

  // 3. Assemble
  return words.map(w => {
    const record = records.find(r => r.word_id === w.id)!
    const wordChoices = choicesData
      .filter(c => c.word_id === w.id)
      .sort((a, b) => a.sort - b.sort)
      .map(c => c.choice)

    return {
      word: w,
      progress: {
        cardId: record.word_id,
        ease: record.ease_factor,
        interval: record.interval_days,
        repetitions: record.repetitions,
        nextReview: new Date(record.next_review_at!).getTime(),
        lastReview: record.last_reviewed ? new Date(record.last_reviewed).getTime() : 0,
      },
      choices: wordChoices
    }
  })
}

// ── Stats (for Dashboard) ───────────────────────────────────

export interface UserStats {
  totalWords: number
  mastered: number
  learning: number
  streakDays: number
}

export interface DashboardSummary {
  resumeTopic: Topic | null
  fallbackTopics: Topic[]
  globalReviewCount: number
}

/**
 * Summarizes dashboard data for a user:
 * 1. The last topic they were studying (Resume)
 * 2. Fallback topics (first 2 topics in the first roadmap)
 * 3. Total count of words currently in learning pool (Global Review)
 */
export async function fetchDashboardSummary(userId: string): Promise<DashboardSummary> {
  // 1. Fetch Global Review Count (Words actually DUE via SRS)
  const { count: globalReviewCount } = await supabase
    .from('user_srs_records')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('mastered', false)
    .lte('next_review_at', new Date().toISOString())

  // 2. Fetch Resume Topic
  const { data: pointer } = await supabase
    .from('user_resume_pointers')
    .select('last_topic_id, roadmap_id')
    .eq('user_id', userId)
    .order('last_accessed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let resumeTopic: Topic | null = null
  if (pointer?.last_topic_id) {
    const { data: topic } = await supabase
      .from('topics')
      .select('*')
      .eq('id', pointer.last_topic_id)
      .single()
    
    if (topic) {
      resumeTopic = topic as Topic
    }
  }

  // 3. Fetch Fallback Topics (Roadmap 1st -> Topics 1,2)
  const { data: roadmap } = await supabase
    .from('roadmaps')
    .select('id')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  let fallbackTopics: Topic[] = []
  if (roadmap) {
    const { data: topics } = await supabase
      .from('topics')
      .select('*')
      .eq('roadmap_id', roadmap.id)
      .order('sort_order', { ascending: true })
      .limit(2)
    
    if (topics) {
      fallbackTopics = topics as Topic[]
    }
  }

  return {
    resumeTopic,
    fallbackTopics,
    globalReviewCount: globalReviewCount ?? 0
  }
}

export async function fetchDashboardStats(userId: string): Promise<UserStats> {
  const [progressRes, profileRes] = await Promise.all([
    supabase
      .from('user_srs_records')
      .select('mastered, repetitions, lapse_count')
      .eq('user_id', userId),
    supabase
      .from('user_profiles')
      .select('streak_days')
      .eq('id', userId)
      .single(),
  ])

  const progress = (progressRes.data ?? []) as SrsRecord[]
  const mastered = progress.filter((p) => p.mastered).length
  const learning = progress.filter(
    (p) => !p.mastered && (p.repetitions > 0 || p.lapse_count > 0)
  ).length

  return {
    totalWords: progress.length,
    mastered,
    learning,
    streakDays: (profileRes.data?.streak_days ?? 0) as number,
  }
}

// ── Streak ───────────────────────────────────────────────────

/**
 * Record a study session for streak tracking.
 * Updates user_profiles.streak_days via a Supabase RPC or direct update.
 */
export async function recordStreak(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0]

  // Get current profile
  const { data: profile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('streak_days, last_study_date')
    .eq('id', userId)
    .single()

  if (fetchError || !profile) {
    console.error('[supabase-storage] recordStreak fetch error:', fetchError)
    return 0
  }

  const lastDate = profile.last_study_date as string | null
  const currentStreak = (profile.streak_days as number) ?? 0

  let newStreak: number

  if (lastDate === today) {
    // Already recorded today
    newStreak = currentStreak
  } else if (lastDate) {
    const diff = Math.floor(
      (new Date(today).getTime() - new Date(lastDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
    if (diff === 1) {
      newStreak = currentStreak + 1
    } else {
      newStreak = 1 // streak broken
    }
  } else {
    newStreak = 1 // first study
  }

  // Update streak in user_profiles
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      streak_days: newStreak,
      last_study_date: today,
    })
    .eq('id', userId)

  if (updateError) {
    console.error('[supabase-storage] recordStreak update error:', updateError)
    return currentStreak
  }

  return newStreak
}

// ── Fetch topic words (for dashboard topic cards) ─────────────

export async function fetchTopicWordCounts(): Promise<Record<string, number>> {
  const { data } = await supabase
    .from('topic_words')
    .select('topic_id, topics(slug)')
  
  const counts: Record<string, number> = {}
  for (const row of (data ?? [])) {
    const slug = (row as any).topics?.slug
    if (slug) counts[slug] = (counts[slug] ?? 0) + 1
  }
  return counts
}

// ── Roadmaps ────────────────────────────────────────────────

/**
 * Fetch all active roadmaps.
 */
export async function fetchRoadmaps(): Promise<Roadmap[]> {
  const { data, error } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('is_active', true)
    .order('created_at')

  if (error) {
    console.error('[supabase-storage] fetchRoadmaps error:', error)
    return []
  }

  return (data as Roadmap[]) ?? []
}

/**
 * Fetch topics for a specific roadmap slug.
 */
export async function fetchTopicsByRoadmap(roadmapSlug: string): Promise<Topic[]> {
  // First get roadmap ID
  const { data: roadmap } = await supabase
    .from('roadmaps')
    .select('id')
    .eq('slug', roadmapSlug)
    .single()

  if (!roadmap) return []

  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('roadmap_id', roadmap.id)
    .order('sort_order')

  if (error) {
    console.error('[supabase-storage] fetchTopicsByRoadmap error:', error)
    return []
  }

  return (data as Topic[]) ?? []
}

/**
 * Fetch stats for a roadmap (total words, mastered words).
 */
export async function fetchRoadmapStats(roadmapId: string, userId?: string) {
  // 1. Lấy tất cả topics thuộc roadmap
  const { data: topics } = await supabase
    .from('topics').select('id').eq('roadmap_id', roadmapId)
  if (!topics?.length) return { total: 0, mastered: 0 }

  // 2. Lấy word IDs qua topic_words junction
  const topicIds = topics.map(t => t.id)
  const { data: junctions } = await supabase
    .from('topic_words').select('word_id').in('topic_id', topicIds)

  // Deduplicate word IDs (1 word có thể nằm trong nhiều topics cùng roadmap)
  const wordIds = [...new Set((junctions ?? []).map(j => j.word_id))]
  const total = wordIds.length

  if (!userId || total === 0) return { total, mastered: 0 }

  // 3. Count mastered
  const { data: progress } = await supabase
    .from('user_srs_records')
    .select('id')
    .eq('user_id', userId)
    .eq('mastered', true)
    .in('word_id', wordIds)

  return { total, mastered: progress?.length ?? 0 }
}

// ── User Resume Pointers ────────────────────────────────────

export async function fetchResumePointers(
  userId: string
): Promise<Map<string, ResumePointer>> {
  const { data } = await supabase
    .from('user_resume_pointers')
    .select('*')
    .eq('user_id', userId)

  const map = new Map<string, ResumePointer>()
  for (const state of (data ?? [])) {
    map.set(state.roadmap_id, state as ResumePointer)
  }
  return map
}

export async function saveResumePointer(
  userId: string,
  roadmapId: string,
  topicId?: string
): Promise<void> {
  const payload: Record<string, any> = {
    user_id: userId,
    roadmap_id: roadmapId,
    last_accessed_at: new Date().toISOString(),
  }
  if (topicId) payload.last_topic_id = topicId

  await supabase.from('user_resume_pointers').upsert(payload, {
    onConflict: 'user_id,roadmap_id',
  })
}

// ── Bulk Topic Progress ──────────────────────────────────────

/**
 * Tính progress cho nhiều topics cùng lúc.
 * Strategy: 2 bulk queries + client-side join.
 * "learned" = mastered === true trong user_srs_records.
 */
export async function fetchTopicCompletionMap(
  userId: string,
  topicIds: string[]
): Promise<Record<string, { total: number; learned: number; percent: number }>> {
  // 1. Bulk fetch: tất cả word assignments cho các topics này
  const { data: junctions } = await supabase
    .from('topic_words')
    .select('topic_id, word_id')
    .in('topic_id', topicIds)

  if (!junctions?.length) {
    return Object.fromEntries(topicIds.map(id => [id, { total: 0, learned: 0, percent: 0 }]))
  }

  // 2. Collect tất cả unique word IDs
  const allWordIds = [...new Set(junctions.map(j => j.word_id))]

  // 3. Bulk fetch: progress cho tất cả words này
  const { data: progressRows } = await supabase
    .from('user_srs_records')
    .select('word_id')
    .eq('user_id', userId)
    .eq('mastered', true)
    .in('word_id', allWordIds)

  const masteredSet = new Set((progressRows ?? []).map(p => p.word_id))

  // 4. Client-side join: tính per-topic
  const result: Record<string, { total: number; learned: number; percent: number }> = {}
  
  // Group junctions by topic
  const wordsByTopic = new Map<string, string[]>()
  for (const j of junctions) {
    if (!wordsByTopic.has(j.topic_id)) wordsByTopic.set(j.topic_id, [])
    wordsByTopic.get(j.topic_id)!.push(j.word_id)
  }

  for (const topicId of topicIds) {
    const topicWordIds = wordsByTopic.get(topicId) ?? []
    const learned = topicWordIds.filter(wid => masteredSet.has(wid)).length
    const total = topicWordIds.length
    result[topicId] = {
      total,
      learned,
      percent: total > 0 ? Math.round((learned / total) * 100) : 0,
    }
  }

  return result
}

// ── Settings & Profile ────────────────────────────────────────

export async function updateUserSettings(userId: string, settings: Partial<UserProfile>): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update(settings)
    .eq('id', userId)

  if (error) {
    console.error('[supabase-storage] updateUserSettings error:', error)
    throw error
  }
}

export async function resetTopicProgress(topicId: string): Promise<void> {
  const { error } = await supabase.rpc('reset_topic_progress', { p_topic_id: topicId })
  if (error) {
    console.error('[supabase-storage] resetTopicProgress error:', error)
    throw error
  }
}

export async function fetchAllTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('name')
    
  if (error) throw error
  return data || []
}

// ── Mastery Vault Logic ──────────────────────────────────────

/**
 * Fetches all vocabulary studied by the user.
 * Uses get_user_vocabulary RPC and handles Supabase 1000-row limit.
 */
export async function fetchUserVocabulary(userId: string): Promise<MasteryWord[]> {
  const PAGE_SIZE = 1000
  let allWords: MasteryWord[] = []
  let from = 0
  let hasMore = true

  try {
    while (hasMore) {
      const { data, error } = await supabase
        .rpc('get_user_vocabulary', { p_user_id: userId })
        .range(from, from + PAGE_SIZE - 1)

      if (error) throw error
      
      if (data && data.length > 0) {
        allWords = [...allWords, ...data]
        from += PAGE_SIZE
        if (data.length < PAGE_SIZE) hasMore = false
      } else {
        hasMore = false
      }
    }
    return allWords
  } catch (err) {
    console.error('[supabase-storage] fetchUserVocabulary error:', err)
    throw err
  }
}

/**
 * Resets a word's progress when failed during Free Study (Option B).
 * Resets repetitions, interval, and updates next_review_at to tomorrow.
 */
export async function upsertFreeStudyFail(userId: string, wordId: string): Promise<void> {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  // We only update if the record exists (it should, since it's in the Vault)
  const { error } = await supabase
    .from('user_srs_records')
    .update({
      repetitions: 0,
      interval_days: 1,
      next_review_at: tomorrow.toISOString(),
      mastered: false,
      last_reviewed: new Date().toISOString()
    })
    .match({ user_id: userId, word_id: wordId })

  if (error) {
    console.error('[supabase-storage] upsertFreeStudyFail error:', error)
    throw error
  }
}

// ── Utils ───────────────────────────────────────────────────

/**
 * Returns the boundary for "today" based on a 4:00 AM reset.
 * Used to ensure late-night study sessions count towards the correct day.
 */
export function getTodayBoundary(): Date {
  const now = new Date()
  const boundary = new Date(now)
  boundary.setHours(4, 0, 0, 0)
  
  // If current time is before 4 AM, "today" started at 4 AM yesterday
  if (now < boundary) {
    boundary.setDate(boundary.getDate() - 1)
  }
  
  return boundary
}
