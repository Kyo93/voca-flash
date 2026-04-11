import { supabase } from './supabase'
import type { Word, WordChoice, Topic, Roadmap, UserProfile, UserProgress } from './types'

// ─── Words ──────────────────────────────────────────────────
export async function getAllWords(topicFilter?: string, search?: string) {
  let query = supabase
    .from('words')
    .select('*, topics(id, name, slug, color)')
    .order('created_at', { ascending: false })

  if (topicFilter) {
    query = query.eq('topic_id', topicFilter)
  }
  if (search) {
    query = query.ilike('word', `%${search}%`)
  }

  return query
}

export async function createWord(word: Omit<Word, 'id' | 'created_at' | 'updated_at'>) {
  return supabase.from('words').insert(word).select().single()
}

export async function updateWord(id: string, word: Partial<Word>) {
  return supabase.from('words').update(word).eq('id', id).select().single()
}

export async function deleteWord(id: string) {
  return supabase.from('words').delete().eq('id', id)
}

// ─── Word Choices ────────────────────────────────────────────
export async function getWordChoices(wordId: string) {
  return supabase
    .from('word_choices')
    .select('*')
    .eq('word_id', wordId)
    .order('sort')
}

export async function createWordChoices(choices: Omit<WordChoice, 'id'>[]) {
  return supabase.from('word_choices').insert(choices)
}

export async function deleteWordChoices(wordId: string) {
  return supabase.from('word_choices').delete().eq('word_id', wordId)
}

// ─── Topics ──────────────────────────────────────────────────
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

// ─── Roadmaps ────────────────────────────────────────────────
export async function getAllRoadmaps() {
  return supabase.from('roadmaps').select('*').order('created_at')
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

// ─── Users ────────────────────────────────────────────────────
export async function getAllUsers() {
  return supabase.from('user_profiles').select('*').order('created_at', { ascending: false })
}

export async function getUserProgress(userId: string) {
  return supabase
    .from('user_progress')
    .select('*, words(word, definition)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
}

// ─── Stats ───────────────────────────────────────────────────
export async function getAdminStats() {
  const [wordsRes, topicsRes, usersRes, progressRes] = await Promise.all([
    supabase.from('words').select('id', { count: 'exact', head: true }),
    supabase.from('topics').select('id', { count: 'exact', head: true }),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('user_progress').select('mastered'),
  ])

  const mastered = progressRes.data?.filter((p) => p.mastered).length ?? 0
  const total = progressRes.data?.length ?? 0

  return {
    totalWords: wordsRes.count ?? 0,
    totalTopics: topicsRes.count ?? 0,
    totalUsers: usersRes.count ?? 0,
    avgMastered: total > 0 ? Math.round((mastered / total) * 100) : 0,
  }
}

export async function getRecentWords(limit = 5) {
  return supabase
    .from('words')
    .select('*, topics(name)')
    .order('created_at', { ascending: false })
    .limit(limit)
}
