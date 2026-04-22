import { supabase } from '../supabase'
import { FETCH_PAGE_SIZE, SRS_STABILITY_LEVELS } from '../constants'
import type { Word, SrsRecord, WordChoice, ResumePointer } from '../types'
import { CardProgress, mapSrsRecordToCardProgress } from '../srs'

export async function fetchSrsStates(userId: string): Promise<Map<string, CardProgress>> {
  const PAGE_SIZE = FETCH_PAGE_SIZE
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
      console.error('[Storage] fetchSrsStates error:', error)
      break
    }

    const progressList = (data as SrsRecord[]) ?? []
    for (const p of progressList) {
      map.set(p.word_id, mapSrsRecordToCardProgress(p))
    }

    hasMore = progressList.length === PAGE_SIZE
    from += PAGE_SIZE
  }

  return map
}

export async function upsertSrsRecord(
  userId: string,
  cardId: string,
  update: CardProgress & { incrementWrong?: number; rating: number; duration?: number }
): Promise<void> {
  if (isNaN(update.stability) || isNaN(update.difficulty)) {
    console.warn('[Storage] Skipping upsert due to NaN values in FSRS data', update)
    return
  }

  const isMasteredStatus = update.stability >= SRS_STABILITY_LEVELS.MASTERED && update.state !== 3
  const nextReviewAt = new Date(update.due).toISOString()
  const lastReviewed = new Date(update.lastReview || Date.now()).toISOString()

  // Consolidate everything into a single V2 RPC that handles logs
  const { error } = await supabase.rpc('upsert_srs_record_v2', {
    p_user_id: userId,
    p_word_id: cardId,
    p_rating: update.rating,
    p_reps: update.reps,
    p_lapse_count: update.lapses,
    p_stability: update.stability,
    p_difficulty: update.difficulty,
    p_state: update.state,
    p_scheduled_days: update.scheduledDays,
    p_next_review_at: nextReviewAt,
    p_mastered: isMasteredStatus,
    p_last_reviewed: lastReviewed,
    p_review_duration_ms: Math.round(update.duration || 0)
  })

  if (error) {
    console.error('[Storage] upsert_srs_record_v2 error:', error)
    throw error
  }
}

export async function fetchReviewWords(userId: string): Promise<{ word: Word; progress: CardProgress; choices: string[] }[]> {
  const { data: records, error: srsError } = await supabase
    .from('user_srs_records')
    .select('*')
    .eq('user_id', userId)
    .eq('mastered', false)
    .lte('next_review_at', new Date().toISOString())
    .order('lapse_count', { ascending: false })
    .limit(20)

  if (srsError || !records) {
    console.error('[Storage] fetchReviewWords error:', srsError)
    return []
  }

  const wordIds = records.map(r => r.word_id)
  if (wordIds.length === 0) return []

  const [wordsRes, choicesRes] = await Promise.all([
    supabase.from('words').select('*, topics(id, name, slug, color)').in('id', wordIds),
    supabase.from('word_choices').select('*').in('word_id', wordIds)
  ])

  if (wordsRes.error) return []
  const words = wordsRes.data as Word[]
  const choicesData = (choicesRes.data as WordChoice[]) ?? []

  return words.map(w => {
    const record = records.find(r => r.word_id === w.id)!
    const wordChoices = choicesData
      .filter(c => c.word_id === w.id)
      .sort((a, b) => a.sort - b.sort)
      .map(c => c.choice)

    return {
      word: w,
      progress: mapSrsRecordToCardProgress(record),
      choices: wordChoices
    }
  })
}

export async function saveResumePointer(userId: string, roadmapId: string, topicId?: string): Promise<void> {
  const payload: Record<string, any> = {
    user_id: userId,
    roadmap_id: roadmapId,
    last_accessed_at: new Date().toISOString(),
  }
  if (topicId) payload.last_topic_id = topicId
  await supabase.from('user_resume_pointers').upsert(payload, { onConflict: 'user_id,roadmap_id' })
}

export async function fetchResumePointers(userId: string): Promise<Map<string, ResumePointer>> {
  const { data } = await supabase.from('user_resume_pointers').select('*').eq('user_id', userId)
  const map = new Map<string, ResumePointer>()
  for (const state of (data ?? [])) {
    map.set(state.roadmap_id, state as ResumePointer)
  }
  return map
}

export async function resetTopicProgress(topicId: string): Promise<void> {
  const { error } = await supabase.rpc('reset_topic_progress', { p_topic_id: topicId })
  if (error) throw error
}

export async function resetAllProgress(): Promise<void> {
  const { error } = await supabase.rpc('reset_all_progress')
  if (error) {
    // Fallback if RPC doesn't exist yet (Manual clear)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // Clear SRS records
    const { error: srsError } = await supabase.from('user_srs_records').delete().eq('user_id', user.id)
    if (srsError) throw srsError
    
    // Clear study sessions
    const { error: sessionError } = await supabase.from('study_sessions').delete().eq('user_id', user.id)
    if (sessionError) throw sessionError
  }
}


export function getTodayBoundary(): Date {
  const boundary = new Date()
  boundary.setHours(4, 0, 0, 0)
  if (new Date().getHours() < 4) {
    boundary.setDate(boundary.getDate() - 1)
  }
  return boundary
}

export async function upsertFreeStudyFail(userId: string, wordId: string): Promise<void> {
  // Logic simplified: we mark it as forgotten if it exists
  await supabase.from('user_srs_records').update({ 
    fsrs_state: 1, // Relearning/New
    next_review_at: new Date().toISOString() 
  }).eq('user_id', userId).eq('word_id', wordId)
}
