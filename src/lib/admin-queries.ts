import { supabase } from './supabase'
import type { Word, WordChoice, Topic, Roadmap, NormalizedWord, BatchInsertResult } from './types'

// ─── Words ──────────────────────────────────────────────────
export async function getAllWords(topicFilter?: string, search?: string) {
  let query = supabase
    .from('words')
    .select('*, topics(id, name, slug, color)')
    .order('created_at', { ascending: false })

  if (topicFilter) {
    // Lấy word IDs thuộc topic này qua junction
    const { data: junctions } = await supabase
      .from('topic_words').select('word_id').eq('topic_id', topicFilter)
    const wordIds = (junctions ?? []).map(j => j.word_id)
    
    if (wordIds.length === 0) {
      // Return empty query result pattern if no words found
      return supabase.from('words').select('*').eq('id', '00000000-0000-0000-0000-000000000000')
    }
    query = query.in('id', wordIds)
  }
  if (search) {
    query = query.ilike('word', `%${search}%`)
  }

  return query
}

export async function createWord(
  word: Omit<Word, 'id' | 'created_at' | 'updated_at'>,
  topicIds: string[] = []
) {
  // Insert word (vẫn giữ topic_id cũ cho backward compat - lấy topicIds[0] nếu có)
  const wordPayload = { ...word, topic_id: topicIds[0] ?? null }
  const res = await supabase.from('words').insert(wordPayload).select().single()
  
  if (res.error || !res.data) return res

  // Insert junction rows
  if (topicIds.length > 0) {
    await supabase.from('topic_words').insert(
      topicIds.map(tid => ({ topic_id: tid, word_id: res.data.id }))
    )
  }

  return res
}

export async function updateWord(
  id: string, 
  word: Partial<Word>,
  topicIds?: string[]
) {
  const wordPayload = { ...word }
  if (topicIds && topicIds.length > 0) {
    wordPayload.topic_id = topicIds[0]
  }

  const res = await supabase.from('words').update(wordPayload).eq('id', id).select().single()
  if (res.error || !res.data) return res

  // Thay thế toàn bộ liên kết trong topic_words nếu topicIds được cung cấp
  if (topicIds) {
    await supabase.from('topic_words').delete().eq('word_id', id)
    if (topicIds.length > 0) {
      await supabase.from('topic_words').insert(
        topicIds.map(tid => ({ topic_id: tid, word_id: id }))
      )
    }
  }

  return res
}

export async function deleteWord(id: string) {
  return supabase.from('words').delete().eq('id', id)
}

export async function getWordTopicIds(wordId: string): Promise<string[]> {
  const { data } = await supabase.from('topic_words').select('topic_id').eq('word_id', wordId)
  return (data ?? []).map(r => r.topic_id)
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

export async function getUserSrsRecords(userId: string) {
  return supabase
    .from('user_srs_records')
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
    supabase.from('user_srs_records').select('mastered'),
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
  // Fetch words without topics join first
  const queryRes = await supabase
    .from('words')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (queryRes.error || !queryRes.data) return queryRes

  // Enrich with topic names via junction
  const words = queryRes.data
  const wordIds = words.map(w => w.id)
  
  if (wordIds.length > 0) {
    const { data: junctions } = await supabase
      .from('topic_words')
      .select('word_id, topics(name)')
      .in('word_id', wordIds)

    const topicNameMap = new Map<string, string>()
    for (const j of (junctions ?? [])) {
      topicNameMap.set(j.word_id, (j as any).topics?.name ?? '')
    }

    // Gắn topics object giả lập để UI không bị break (vì UI kì vọng `topics.name`)
    for (const w of words) {
      if (!w.topics) {
        (w as any).topics = { name: topicNameMap.get(w.id) ?? '' }
      }
    }
  }

  return { data: words, error: null }
}

// ─── Batch Import Queries ─────────────────────────────────

/**
 * Find words that already exist in DB (case-insensitive).
 * Used for duplicate detection before import.
 */
export async function findDuplicateWords(words: string[]): Promise<string[]> {
  if (words.length === 0) return []

  const { data, error } = await supabase.rpc('find_duplicate_words', {
    p_words: words.map(w => w.toLowerCase().trim())
  })

  if (error) {
    console.error('findDuplicateWords error:', error)
    return []
  }

  return (data as string[]) ?? []
}

/**
 * Mark rows as duplicates based on findDuplicateWords result.
 * Mutates the rows array in-place.
 */
export function markDuplicates(rows: NormalizedWord[], duplicateWords: Set<string>): void {
  for (const row of rows) {
    if (duplicateWords.has(row.word.toLowerCase())) {
      row.status = 'duplicate'
      row.duplicateAction = 'keep' // default safe choice
    }
  }
}

/**
 * Get a map of topic name → topic id.
 * Used to resolve topic names from import file to DB IDs.
 */
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

/**
 * Batch insert words via RPC.
 * Splits into chunks of 50 rows per RPC call.
 * Returns aggregated results.
 */
export async function batchInsertWords(rows: NormalizedWord[]): Promise<BatchInsertResult> {
  const CHUNK_SIZE = 50
  let totalInserted = 0
  const allErrors: { word: string; error: string }[] = []

  // Filter rows: only process 'new' and 'update' duplicates
  // Skip 'invalid' rows and 'skip' duplicates
  const toImport = rows.filter(r => {
    if (r.status === 'invalid') return false
    if (r.status === 'duplicate' && r.duplicateAction === 'skip') return false
    return true
  })

  if (toImport.length === 0) {
    return { inserted: 0, errors: [] }
  }

  // Process in chunks
  for (let i = 0; i < toImport.length; i += CHUNK_SIZE) {
    const chunk = toImport.slice(i, i + CHUNK_SIZE)

    const payload = chunk.map(row => ({
      word: row.word,
      phonetic: row.phonetic ?? null,
      pos: row.pos ?? 'noun',
      difficulty: row.difficulty ?? 3,
      definition: row.definition,
      example: row.example ?? null,
      example_vi: row.example_vi ?? null,
      image_url: row.image_url ?? null,
      image_position: row.image_position ?? 'center',
      topic_ids: row.topicIds ?? [],
      wrong_choices: row.wrongChoices ?? [],
    }))

    const { data, error } = await supabase.rpc('batch_insert_words', {
      p_words: payload
    })

    if (error) {
      console.error('batch_insert_words RPC error:', error)
      // On RPC error, add all chunk words as errors
      for (const row of chunk) {
        allErrors.push({ word: row.word, error: error.message })
      }
      continue
    }

    const result = data as BatchInsertResult
    totalInserted += result.inserted ?? 0

    if (result.errors && result.errors.length > 0) {
      allErrors.push(...result.errors)
    }
  }

  return { inserted: totalInserted, errors: allErrors }
}

/**
 * Update existing word (used when user selects "Update" for duplicates).
 */
export async function updateWordFromImport(
  wordId: string,
  normalized: NormalizedWord
): Promise<{ error: string | null }> {
  const { error: err } = await supabase
    .from('words')
    .update({
      word: normalized.word,
      phonetic: normalized.phonetic ?? null,
      pos: normalized.pos ?? 'noun',
      difficulty: normalized.difficulty ?? 3,
      definition: normalized.definition,
      example: normalized.example ?? null,
      example_vi: normalized.example_vi ?? null,
      image_url: normalized.image_url ?? null,
      image_position: normalized.image_position ?? 'center',
    })
    .eq('id', wordId)

  if (err) return { error: err.message }

  // Update topic_words junction
  await supabase.from('topic_words').delete().eq('word_id', wordId)
  if (normalized.topicIds.length > 0) {
    await supabase.from('topic_words').insert(
      normalized.topicIds.map(tid => ({ topic_id: tid, word_id: wordId }))
    )
  }

  // Update word_choices
  await supabase.from('word_choices').delete().eq('word_id', wordId)
  if (normalized.wrongChoices.length > 0) {
    await supabase.from('word_choices').insert(
      normalized.wrongChoices.map((choice, i) => ({
        word_id: wordId,
        choice,
        sort: i + 1,
      }))
    )
  }

  return { error: null }
}
