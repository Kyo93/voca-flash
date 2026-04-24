import { supabase } from '../supabase'
import type { MasteryWord, MasteryStats, Word } from '../types'
import type { Card } from '../srs'
import { fetchPaginated } from './base'
import { MASTERY_CONFIG } from '../constants'

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
