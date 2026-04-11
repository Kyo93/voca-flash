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
import type { Word, UserProgress, Card, CardProgress, Topic, Roadmap } from './types'

// ── Types for Supabase progress ──────────────────────────────

export interface SupabaseCardProgress {
  id: string
  user_id: string
  word_id: string
  correct_count: number
  wrong_count: number
  mastered: boolean
  last_reviewed: string | null
  created_at: string
  updated_at: string
}

// ── Mapping: Word (Supabase) → Card (student app) ────────────

function mapWordToCard(word: Word, topicSlug?: string): Card {
  return {
    id: word.id,
    front: word.word,
    back: word.definition,
    example: word.example ?? undefined,
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
  let query = supabase
    .from('words')
    .select('*, topics(id, name, slug, color)')

  if (topicSlug) {
    // Filter by topic slug — join topics first
    const { data: topicData } = await supabase
      .from('topics')
      .select('id')
      .eq('slug', topicSlug)
      .single()

    if (topicData) {
      query = query.eq('topic_id', topicData.id)
    } else {
      return [] // topic not found
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('[supabase-storage] fetchWords error:', error)
    return []
  }

  const words = (data as Word[]) ?? []
  return words.map((w) =>
    mapWordToCard(w, w.topics?.slug)
  )
}

// ── Progress ─────────────────────────────────────────────────

/**
 * Fetch user's progress from Supabase.
 * Returns a Map<cardId, CardProgress> matching the SRS algorithm.
 */
export async function fetchUserProgress(userId: string): Promise<Map<string, CardProgress>> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('[supabase-storage] fetchUserProgress error:', error)
    return new Map()
  }

  const progressList = (data as SupabaseCardProgress[]) ?? []
  const map = new Map<string, CardProgress>()

  for (const p of progressList) {
    // Convert Supabase progress → SRS CardProgress
    map.set(p.word_id, {
      cardId: p.word_id,
      ease: 2.5, // default; Supabase doesn't store ease yet
      interval: p.mastered ? 99 : 0,
      repetitions: p.mastered ? 5 : (p.correct_count > 0 ? 1 : 0),
      nextReview: p.last_reviewed
        ? new Date(p.last_reviewed).getTime()
        : Date.now(),
      lastReview: p.last_reviewed
        ? new Date(p.last_reviewed).getTime()
        : 0,
    })
  }

  return map
}

/**
 * Upsert a single word's progress to Supabase.
 * Called after each SRS rating in useFlashcard.
 */
export async function upsertUserProgress(
  userId: string,
  cardId: string,
  correctCount: number,
  wrongCount: number,
  mastered: boolean
): Promise<void> {
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      word_id: cardId,
      correct_count: correctCount,
      wrong_count: wrongCount,
      mastered,
      last_reviewed: new Date().toISOString(),
    }, {
      onConflict: 'user_id,word_id',
    })

  if (error) {
    console.error('[supabase-storage] upsertUserProgress error:', error)
  }
}

// ── Stats (for Dashboard) ───────────────────────────────────

export interface UserStats {
  totalWords: number
  mastered: number
  learning: number
  streakDays: number
}

export async function fetchUserStats(userId: string): Promise<UserStats> {
  const [progressRes, profileRes] = await Promise.all([
    supabase
      .from('user_progress')
      .select('mastered, correct_count, wrong_count')
      .eq('user_id', userId),
    supabase
      .from('user_profiles')
      .select('streak_days')
      .eq('id', userId)
      .single(),
  ])

  const progress = (progressRes.data ?? []) as SupabaseCardProgress[]
  const mastered = progress.filter((p) => p.mastered).length
  const learning = progress.filter(
    (p) => !p.mastered && (p.correct_count > 0 || p.wrong_count > 0)
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
  const { data, error } = await supabase
    .from('topics')
    .select('slug, words(id)')

  if (error) {
    console.error('[supabase-storage] fetchTopicWordCounts error:', error)
    return {}
  }

  const counts: Record<string, number> = {}
  for (const topic of (data ?? [])) {
    counts[topic.slug] = topic.words?.length ?? 0
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
  // Get all topics for this roadmap
  const { data: topics } = await supabase
    .from('topics')
    .select('id')
    .eq('roadmap_id', roadmapId)

  if (!topics || topics.length === 0) return { total: 0, mastered: 0 }

  const topicIds = topics.map(t => t.id)

  // Get word count for these topics
  const { data: words } = await supabase
    .from('words')
    .select('id')
    .in('topic_id', topicIds)

  const total = words?.length ?? 0

  if (!userId || total === 0) return { total, mastered: 0 }

  const wordIds = words!.map(w => w.id)

  // Get mastered count from user_progress
  const { data: progress } = await supabase
    .from('user_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('mastered', true)
    .in('word_id', wordIds)

  return {
    total,
    mastered: progress?.length ?? 0
  }
}
