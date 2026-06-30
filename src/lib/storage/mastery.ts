import { supabase } from '../supabase'
import type { MasteryWord, MasteryStats, MasteryWordDetail, Word } from '../types'
import { isMastered, type Card, type CardProgress } from '../srs'
import { fetchPaginated } from './base'
import { MASTERY_CONFIG } from '../constants'
import { fetchSrsStates } from './session'

export async function getMasteryStats(userId: string): Promise<MasteryStats> {
  const { data, error } = await supabase.rpc('get_mastery_stats', { p_user_id: userId })
  if (error) {
    console.error('[Storage] getMasteryStats error:', error)
    return { total: 0, mastered: 0, due: 0, weak: 0, orphaned: 0, learning: 0 }
  }
  return data as MasteryStats
}

interface FetchVocabularyOptions {
  limit?: number
  offset?: number
  search?: string
  filter?: 'all' | 'due' | 'weak' | 'orphaned' | 'mastered'
  letter?: string
  roadmapId?: string | null
  stability?: string | null
  sortBy?: string
}

export interface StudyPrepData {
  unlearned: Card[]
  learning: Card[]
  mastered: Card[]
  progressMap?: Map<string, CardProgress>
}

interface StudyPrepRow {
  word_id: string
  word: string
  definition: string
  phonetic: string | null
  example: string | null
  example_vi: string | null
  image_url: string | null
  image_position: string | null
  topic_slug: string | null
  created_at: string
  has_progress: boolean
  mastered: boolean | null
  next_review_at: string | null
  last_reviewed: string | null
  fsrs_stability: number | null
  fsrs_difficulty: number | null
  fsrs_state: number | null
  fsrs_reps: number | null
  fsrs_lapses: number | null
  fsrs_scheduled_days: number | null
  repetitions: number | null
  lapse_count: number | null
}

type MasteryWordDetailRow = Pick<
  Word,
  | 'id'
  | 'pos'
  | 'difficulty'
  | 'example_vi'
  | 'image_position'
  | 'synonyms'
  | 'antonyms'
  | 'word_family'
  | 'tags'
>

function normalizeStringArray(value: string[] | null | undefined): string[] {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string' && item.trim().length > 0) : []
}

function mapMasteryWordDetail(row: MasteryWordDetailRow): MasteryWordDetail {
  return {
    word_id: row.id,
    pos: row.pos ?? null,
    difficulty: row.difficulty ?? null,
    example_vi: row.example_vi ?? null,
    image_position: row.image_position ?? null,
    synonyms: normalizeStringArray(row.synonyms),
    antonyms: normalizeStringArray(row.antonyms),
    word_family: normalizeStringArray(row.word_family),
    tags: normalizeStringArray(row.tags),
  }
}

function mapStudyPrepRowToCard(row: StudyPrepRow, topicSlug?: string): Card {
  return {
    id: row.word_id,
    front: row.word,
    back: row.definition,
    phonetic: row.phonetic ?? undefined,
    example: row.example ?? undefined,
    example_vi: row.example_vi ?? undefined,
    image_url: row.image_url ?? undefined,
    image_position: row.image_position ?? 'center',
    topic: row.topic_slug ?? topicSlug ?? 'general',
    createdAt: new Date(row.created_at).getTime(),
  }
}

function mapStudyPrepRowToProgress(row: StudyPrepRow): CardProgress {
  return {
    cardId: row.word_id,
    stability: row.fsrs_stability ?? 0,
    difficulty: row.fsrs_difficulty ?? 5,
    state: row.fsrs_state ?? 0,
    reps: row.fsrs_reps ?? row.repetitions ?? 0,
    lapses: row.fsrs_lapses ?? row.lapse_count ?? 0,
    scheduledDays: row.fsrs_scheduled_days ?? 0,
    due: row.next_review_at ? new Date(row.next_review_at).getTime() : Date.now(),
    lastReview: row.last_reviewed ? new Date(row.last_reviewed).getTime() : 0,
  }
}

async function fetchStudyPrepDataFallback(userId: string | undefined, topicSlug?: string): Promise<StudyPrepData> {
  const [cards, progressMap] = await Promise.all([
    fetchWords(topicSlug),
    userId ? fetchSrsStates(userId) : Promise.resolve(new Map<string, CardProgress>()),
  ])

  const unlearned: Card[] = []
  const learning: Card[] = []
  const mastered: Card[] = []

  for (const card of cards) {
    const progress = progressMap.get(card.id)
    if (!progress) {
      unlearned.push(card)
    } else if (isMastered(progress)) {
      mastered.push(card)
    } else {
      learning.push(card)
    }
  }

  return { unlearned, learning, mastered, progressMap }
}

export async function fetchStudyPrepData(userId: string | undefined, topicSlug?: string): Promise<StudyPrepData> {
  const { data, error } = await supabase.rpc('get_study_prep_data', {
    p_user_id: userId ?? null,
    p_topic_slug: topicSlug ?? null,
  })

  if (error) {
    console.error('[Storage] fetchStudyPrepData error:', error)
    return fetchStudyPrepDataFallback(userId, topicSlug)
  }

  const progressMap = new Map<string, CardProgress>()
  const unlearned: Card[] = []
  const learning: Card[] = []
  const mastered: Card[] = []

  for (const row of (data ?? []) as StudyPrepRow[]) {
    const card = mapStudyPrepRowToCard(row, topicSlug)
    if (!row.has_progress) {
      unlearned.push(card)
      continue
    }

    const progress = mapStudyPrepRowToProgress(row)
    progressMap.set(card.id, progress)

    if (row.mastered) {
      mastered.push(card)
    } else {
      learning.push(card)
    }
  }

  return { unlearned, learning, mastered, progressMap }
}

export async function getUserVocabulary(
  userId: string,
  options: FetchVocabularyOptions = {}
): Promise<{ data: MasteryWord[]; total: number }> {
  const {
    limit = MASTERY_CONFIG.DEFAULT_PAGE_SIZE,
    offset = 0,
    search = '',
    filter = 'all',
    letter = '',
    roadmapId = null,
    stability = '',
    sortBy = 'date',
  } = options
  const { data, error } = await supabase.rpc('get_user_vocabulary_v2', {
    p_user_id: userId,
    p_limit: limit,
    p_offset: offset,
    p_search: search,
    p_filter: filter,
    p_letter: letter,
    p_roadmap_id: roadmapId,
    p_stability: stability ?? '',
    p_sort_by: sortBy,
  })

  if (error) {
    console.error('[Storage] getUserVocabulary error:', error)
    throw error
  }

  const result = data || []
  const total = result.length > 0 && result[0].total_count != null
    ? Number(result[0].total_count)
    : result.length

  const mappedData: MasteryWord[] = result.map((r: MasteryWord) => ({
    ...r,
    fsrs_stability: r.fsrs_stability ?? 0,
    fsrs_difficulty: r.fsrs_difficulty ?? 0,
    fsrs_state: r.fsrs_state ?? 0,
    fsrs_reps: r.fsrs_reps ?? 0,
    fsrs_lapses: r.fsrs_lapses ?? 0,
    is_orphaned: r.is_orphaned ?? false,
  }))

  return { data: mappedData, total }
}

export async function getMasteryWordDetail(wordId: string): Promise<MasteryWordDetail | null> {
  const { data, error } = await supabase
    .from('words')
    .select(`
      id,
      pos,
      difficulty,
      example_vi,
      image_position,
      synonyms,
      antonyms,
      word_family,
      tags
    `)
    .eq('id', wordId)
    .maybeSingle()

  if (error || !data) {
    console.error('[Storage] getMasteryWordDetail error:', error)
    return null
  }

  return mapMasteryWordDetail(data as MasteryWordDetailRow)
}

export async function fetchTopicWordCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.rpc('get_topic_word_counts')
  if (error) {
    console.error('[Storage] fetchTopicWordCounts error:', error)
    return {}
  }
  const counts: Record<string, number> = {}
  for (const row of (data ?? []) as { slug: string; count: number }[]) {
    counts[row.slug] = row.count
  }
  return counts
}

export function mapWordToCard(word: Word, topicSlug?: string): Card {
  return {
    id: word.id,
    front: word.word,
    back: word.definition,
    phonetic: word.phonetic ?? undefined,
    example: word.example ?? undefined,
    image_url: word.image_url ?? undefined,
    image_position: word.image_position ?? 'center',
    topic: topicSlug ?? word.topics?.slug ?? 'general',
    createdAt: new Date(word.created_at).getTime(),
  }
}

export async function fetchWords(topicSlug?: string): Promise<Card[]> {
  if (topicSlug) {
    const { data: topicData } = await supabase.from('topics').select('id, slug').eq('slug', topicSlug).single()
    if (!topicData) return []
    const { data: junctionRows } = await supabase.from('topic_words').select('word_id').eq('topic_id', topicData.id).order('sort_order')
    if (!junctionRows?.length) return []
    const wordIds = junctionRows.map(r => r.word_id)
    const query = supabase.from('words').select('*').in('id', wordIds)
    const words = await fetchPaginated<Word>(query)
    return (words ?? []).map(w => mapWordToCard(w, topicSlug))
  }
  const query = supabase.from('words').select('*')
  const data = await fetchPaginated<Word>(query)
  return (data ?? []).map(w => mapWordToCard(w))
}
