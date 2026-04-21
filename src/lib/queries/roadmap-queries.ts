import { supabase } from '../supabase'
import type { Roadmap } from '../types'

/** Roadmaps */
export async function getAllRoadmaps() {
  return supabase.from('roadmaps').select('*, topics(count)').order('created_at')
}

export async function createRoadmap(roadmap: Omit<Roadmap, 'id' | 'created_at' | 'updated_at'>) {
  return supabase.from('roadmaps').insert(roadmap).select().single()
}

export async function updateRoadmap(id: string, roadmap: Partial<Roadmap>) {
  return supabase.from('roadmaps').update(roadmap).eq('id', id).select().single()
}

export async function deleteRoadmap(id: string) {
  return supabase.from('roadmaps').delete().eq('id', id)
}

export async function getRoadmapById(id: string) {
  return supabase.from('roadmaps').select('*').eq('id', id).single()
}

/** Roadmap Setup & Related Queries */
export async function getTopicsByRoadmap(roadmapId: string) {
  return supabase
    .from('topics')
    .select('*')
    .eq('roadmap_id', roadmapId)
    .order('sort_order')
}

export async function getWordsWithTopicsByRoadmap(roadmapId: string) {
  const { data: topics } = await supabase
    .from('topics').select('id').eq('roadmap_id', roadmapId)

  const topicIds = (topics ?? []).map(t => t.id)

  let junctions: any[] = []
  if (topicIds.length > 0) {
    const { data: j } = await supabase
      .from('topic_words')
      .select('word_id, topic_id')
      .in('topic_id', topicIds)
    junctions = j ?? []
  }

  const junctionMap = new Map<string, string[]>()
  for (const j of junctions) {
    if (!junctionMap.has(j.word_id)) junctionMap.set(j.word_id, [])
    junctionMap.get(j.word_id)!.push(j.topic_id)
  }

  const { data: words, error } = await supabase
    .from('words')
    .select('*')
    .order('word')

  if (error || !words) return { data: [], error }

  const enriched = (words as any[]).map(w => ({
    ...w,
    topicIds: junctionMap.get(w.id) ?? [],
  }))

  return { data: enriched, error: null }
}

export async function assignWordsToTopic(wordIds: string[], topicId: string) {
  if (wordIds.length === 0) return { error: null }
  await supabase.from('topic_words').delete().eq('topic_id', topicId)
  const { error } = await supabase.from('topic_words').insert(
    wordIds.map(wordId => ({ topic_id: topicId, word_id: wordId }))
  )
  return { error }
}

export async function unassignWordsFromTopic(wordIds: string[], topicId: string) {
  if (wordIds.length === 0) return { error: null }
  const { error } = await supabase
    .from('topic_words')
    .delete()
    .eq('topic_id', topicId)
    .in('word_id', wordIds)
  return { error }
}
