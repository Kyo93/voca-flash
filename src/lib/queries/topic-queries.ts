import { supabase } from '../supabase'
import type { Topic } from '../types'

/** Topics */
export async function getAllTopics() {
  return supabase
    .from('topics')
    .select('*, roadmaps(name)')
    .order('sort_order')
}

export async function createTopic(topic: Omit<Topic, 'id' | 'created_at' | 'updated_at'>) {
  return supabase.from('topics').insert(topic).select().single()
}

export async function updateTopic(id: string, topic: Partial<Topic>) {
  return supabase.from('topics').update(topic).eq('id', id).select().single()
}

export async function deleteTopic(id: string) {
  return supabase.from('topics').delete().eq('id', id)
}

export async function reorderTopics(updates: { id: string; sort_order: number }[]) {
  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from('topics').update({ sort_order }).eq('id', id)
    )
  )
  return results
}

/** Topic Utility Queries */
export async function getTopicNameMap(): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from('topics')
    .select('id, name')

  if (error || !data) {
    console.error('getTopicNameMap error:', error)
    return new Map()
  }

  const map = new Map<string, string>()
  for (const topic of data as { id: string; name: string }[]) {
    map.set(topic.name.toLowerCase(), topic.id)
  }
  return map
}

export async function getTopicWordCounts(roadmapId: string) {
  const { data: topics } = await supabase
    .from('topics').select('id').eq('roadmap_id', roadmapId)

  const topicIds = (topics ?? []).map(t => t.id)
  if (topicIds.length === 0) return { data: [], error: null }

  const { data } = await supabase
    .from('topic_words')
    .select('topic_id')
    .in('topic_id', topicIds)

  const counts: Record<string, number> = {}
  for (const row of (data ?? [])) {
    counts[row.topic_id] = (counts[row.topic_id] ?? 0) + 1
  }
  return { data: counts, error: null }
}
