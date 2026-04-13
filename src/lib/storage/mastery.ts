import { supabase } from '../supabase'
import type { MasteryWord, MasteryStats } from '../types'

export async function fetchMasteryStats(userId: string): Promise<MasteryStats> {
  const { data, error } = await supabase.rpc('get_mastery_stats', { p_user_id: userId })
  if (error) {
    console.error('[Storage] fetchMasteryStats error:', error)
    return { total: 0, mastered: 0, due: 0, weak: 0, orphaned: 0, learning: 0 }
  }
  return data as MasteryStats
}

interface FetchVocabularyOptions {
  limit?: number
  offset?: number
  search?: string
  filter?: 'all' | 'due' | 'weak' | 'orphaned' | 'mastered'
}

export async function fetchUserVocabulary(
  userId: string,
  options: FetchVocabularyOptions = {}
): Promise<{ data: MasteryWord[]; total: number }> {
  const { limit = 50, offset = 0, search = '', filter = 'all' } = options

  const { data, error } = await supabase.rpc('get_user_vocabulary_v2', {
    p_user_id: userId,
    p_limit: limit,
    p_offset: offset,
    p_search: search,
    p_filter: filter
  })

  if (error) {
    console.error('[Storage] fetchUserVocabulary error:', error)
    throw error
  }

  const result = data || []
  const total = result.length > 0 ? parseInt(result[0].total_count) : 0

  const mappedData: MasteryWord[] = result.map((r: any) => ({
    word_id: r.word_id,
    word: r.word,
    definition: r.definition,
    phonetic: r.phonetic,
    example: r.example,
    image_url: r.image_url,
    image_position: r.image_position,
    mastered: r.mastered,
    next_review_at: r.next_review_at,
    last_reviewed: r.last_reviewed,
    fsrs_stability: r.fsrs_stability,
    fsrs_difficulty: r.fsrs_difficulty,
    fsrs_state: r.fsrs_state,
    fsrs_reps: r.fsrs_reps,
    fsrs_lapses: r.fsrs_lapses,
    is_orphaned: r.is_orphaned,
    topic_names: r.topic_names,
    first_encountered: r.first_encountered
  }))

  return { data: mappedData, total }
}

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

function mapWordToCard(word: any, topicSlug?: string): any {
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

export async function fetchWords(topicSlug?: string): Promise<any[]> {
  if (topicSlug) {
    const { data: topicData } = await supabase.from('topics').select('id, slug').eq('slug', topicSlug).single()
    if (!topicData) return []
    const { data: junctionRows } = await supabase.from('topic_words').select('word_id').eq('topic_id', topicData.id).order('sort_order')
    if (!junctionRows?.length) return []
    const wordIds = junctionRows.map(r => r.word_id)
    const { data: words } = await supabase.from('words').select('*').in('id', wordIds)
    return (words ?? []).map(w => mapWordToCard(w, topicSlug))
  }
  const { data } = await supabase.from('words').select('*')
  return (data ?? []).map(w => mapWordToCard(w))
}
