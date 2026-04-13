import { supabase } from '../supabase'
import type { Word, SrsRecord, WordChoice, ResumePointer } from '../types'
import { CardProgress } from '../srs'

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
      console.error('[Storage] fetchSrsStates error:', error)
      break
    }

    const progressList = (data as SrsRecord[]) ?? []
    for (const p of progressList) {
      map.set(p.word_id, {
        cardId: p.word_id,
        stability: p.fsrs_stability ?? 0,
        difficulty: p.fsrs_difficulty ?? 0.5,
        state: p.fsrs_state ?? 0,
        reps: p.fsrs_reps ?? 0,
        lapses: p.fsrs_lapses ?? 0,
        scheduledDays: p.fsrs_scheduled_days ?? 0,
        due: p.next_review_at ? new Date(p.next_review_at).getTime() : Date.now(),
        lastReview: p.last_reviewed ? new Date(p.last_reviewed).getTime() : 0,
      })
    }

    hasMore = progressList.length === PAGE_SIZE
    from += PAGE_SIZE
  }

  return map
}

export async function upsertSrsRecord(
  userId: string,
  cardId: string,
  update: CardProgress & { incrementWrong?: number }
): Promise<void> {
  const { data: existing } = await supabase
    .from('user_srs_records')
    .select('lapse_count')
    .eq('user_id', userId)
    .eq('word_id', cardId)
    .maybeSingle()

  const newLapseLegacy = (existing?.lapse_count ?? 0) + (update.incrementWrong ?? 0)
  const isMasteredStatus = update.stability >= 21 && update.state !== 3

  if (isNaN(update.stability) || isNaN(update.difficulty)) {
    console.warn('[Storage] Skipping upsert due to NaN values in FSRS data', update)
    return
  }

  const { error } = await supabase
    .from('user_srs_records')
    .upsert({
      user_id: userId,
      word_id: cardId,
      repetitions: update.reps,
      lapse_count: newLapseLegacy,
      ease_factor: 3.0 - (update.difficulty * 1.7),
      interval_days: update.scheduledDays ?? update.scheduledDays,
      fsrs_stability: update.stability,
      fsrs_difficulty: update.difficulty,
      fsrs_state: update.state,
      fsrs_scheduled_days: update.scheduledDays ?? update.scheduledDays,
      fsrs_reps: update.reps,
      fsrs_lapses: update.lapses,
      next_review_at: new Date(update.due).toISOString(),
      mastered: isMasteredStatus,
      last_reviewed: new Date().toISOString(),
    }, {
      onConflict: 'user_id,word_id',
    })

  if (error) {
    console.error('[Storage] upsertSrsRecord error:', error)
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
      progress: {
        cardId: record.word_id,
        stability: record.fsrs_stability ?? 0,
        difficulty: record.fsrs_difficulty ?? 0.5,
        state: record.fsrs_state ?? 0,
        reps: record.fsrs_reps ?? 0,
        lapses: record.fsrs_lapses ?? 0,
        scheduledDays: record.fsrs_scheduled_days ?? 0,
        due: record.next_review_at ? new Date(record.next_review_at).getTime() : Date.now(),
        lastReview: record.last_reviewed ? new Date(record.last_reviewed).getTime() : 0,
      },
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
