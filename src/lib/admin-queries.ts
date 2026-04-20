import { supabase } from './supabase'
import type { Word, WordChoice, Topic, Roadmap, NormalizedWord, BatchInsertResult } from './types'
import { autoTag } from './tag-engine'

// ─── Words ──────────────────────────────────────────────────
export async function getAllWords(topicFilter?: string, search?: string) {
  // Build base query — do NOT use `*, topics(...)` join here because
  // `words.topic_id` is often NULL (topics live in junction table).
  let baseQuery = supabase
    .from('words')
    .select('*')
    .order('created_at', { ascending: false })

  if (topicFilter) {
    const { data: junctions } = await supabase
      .from('topic_words').select('word_id').eq('topic_id', topicFilter)
    const wordIds = (junctions ?? []).map(j => j.word_id)
    if (wordIds.length === 0) {
      return { data: [], error: null }
    }
    baseQuery = baseQuery.in('id', wordIds)
  }
  if (search) {
    baseQuery = baseQuery.ilike('word', `%${search}%`)
  }

  const { data: words, error } = await baseQuery

  if (error || !words || words.length === 0) {
    return { data: words ?? [], error }
  }

  // Enrich with topic names via junction table
  const wordIds = (words as Word[]).map(w => w.id)
  const { data: junctions } = await supabase
    .from('topic_words')
    .select('word_id, topics(name, color)')
    .in('word_id', wordIds)

  const topicNameMap = new Map<string, { name: string; color: string }>()
  for (const j of (junctions ?? [])) {
    const t = (j as any).topics
    if (t) {
      topicNameMap.set(j.word_id, { name: t.name, color: t.color ?? '#f97316' })
    }
  }

  for (const w of words as Word[]) {
    const t = topicNameMap.get(w.id)
    if (t) {
      (w as any).topics = { name: t.name, color: t.color, slug: '', id: '' }
    } else {
      (w as any).topics = null
    }
  }

  return { data: words, error: null }
}

export async function createWord(
  word: Omit<Word, 'id' | 'created_at' | 'updated_at'>,
) {
  // Only auto-generate tags if none are provided manually
  const tags = word.tags && word.tags.length > 0
    ? word.tags
    : autoTag(word.word, word.definition)

  const { data: newWord, error } = await supabase
    .from('words')
    .insert({ ...word, tags })
    .select()
    .single()

  if (error || !newWord) return { data: null, error }

  return { data: newWord, error: null }
}

export async function updateWord(
  id: string,
  word: Partial<Word>,
) {
  // Xóa topic_id khỏi payload (cột đã bị DROP)
  const { topic_id: _dropped, ...cleanWord } = word as any

  return await supabase.from('words').update(cleanWord).eq('id', id).select().single()
}

/** Update tags only (partial update) */
export async function updateWordTags(id: string, tags: string[]) {
  return supabase.from('words').update({ tags }).eq('id', id).select().single()
}

export async function deleteWord(id: string) {
  return supabase.from('words').delete().eq('id', id)
}

export async function deleteWords(ids: string[]) {
  if (ids.length === 0) return { error: null }
  await supabase.from('word_choices').delete().in('word_id', ids)
  await supabase.from('topic_words').delete().in('word_id', ids)
  return supabase.from('words').delete().in('id', ids)
}

// Additive — thêm words vào topic mà KHÔNG xóa links hiện có
export async function bulkAddWordsToTopic(wordIds: string[], topicId: string) {
  if (wordIds.length === 0) return { error: null }
  const { data: existing } = await supabase
    .from('topic_words')
    .select('word_id')
    .eq('topic_id', topicId)
    .in('word_id', wordIds)
  const existingIds = new Set((existing ?? []).map(r => r.word_id))
  const newLinks = wordIds
    .filter(id => !existingIds.has(id))
    .map(wordId => ({ topic_id: topicId, word_id: wordId }))
  if (newLinks.length === 0) return { error: null }
  return supabase.from('topic_words').insert(newLinks)
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

// ─── Roadmap Setup ─────────────────────────────────────────────
/** Lấy roadmap theo ID */
export async function getRoadmapById(id: string) {
  return supabase.from('roadmaps').select('*').eq('id', id).single()
}

/** Lấy tất cả topics trong 1 roadmap */
export async function getTopicsByRoadmap(roadmapId: string) {
  return supabase
    .from('topics')
    .select('*')
    .eq('roadmap_id', roadmapId)
    .order('sort_order')
}

/** Lấy tất cả words trong 1 roadmap (bao gồm cả uncategorized) */
export async function getWordsWithTopicsByRoadmap(roadmapId: string) {
  // Lấy topic IDs trong roadmap
  const { data: topics } = await supabase
    .from('topics').select('id').eq('roadmap_id', roadmapId)

  const topicIds = (topics ?? []).map(t => t.id)

  // Lấy junction rows (nếu có topic)
  let junctions: any[] = []
  if (topicIds.length > 0) {
    const { data: j } = await supabase
      .from('topic_words')
      .select('word_id, topic_id')
      .in('topic_id', topicIds)
    junctions = j ?? []
  }

  // Map topicId per word
  const junctionMap = new Map<string, string[]>()
  for (const j of junctions) {
    if (!junctionMap.has(j.word_id)) junctionMap.set(j.word_id, [])
    junctionMap.get(j.word_id)!.push(j.topic_id)
  }

  // Lấy tất cả words (bất kể có junction hay không — includes uncategorized)
  const { data: words, error } = await supabase
    .from('words')
    .select('*')
    .order('word')

  if (error || !words) return { data: [], error }

  // Enrich với topicIds (rỗng nếu không có junction = uncategorized)
  const enriched = (words as any[]).map(w => ({
    ...w,
    topicIds: junctionMap.get(w.id) ?? [],
  }))

  return { data: enriched, error: null }
}

/** Gán nhiều words vào 1 topic (thay thế hoàn toàn) */
export async function assignWordsToTopic(wordIds: string[], topicId: string) {
  if (wordIds.length === 0) return { error: null }
  // Xóa junction cũ của topic này
  await supabase.from('topic_words').delete().eq('topic_id', topicId)
  // Tạo junction mới
  const { error } = await supabase.from('topic_words').insert(
    wordIds.map(wordId => ({ topic_id: topicId, word_id: wordId }))
  )
  return { error }
}

/** Xóa nhiều words khỏi 1 topic */
export async function unassignWordsFromTopic(wordIds: string[], topicId: string) {
  if (wordIds.length === 0) return { error: null }
  const { error } = await supabase
    .from('topic_words')
    .delete()
    .eq('topic_id', topicId)
    .in('word_id', wordIds)
  return { error }
}

/** Lấy word count theo topicId trong 1 roadmap */
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

  const submitted = toImport.length
  if (submitted === 0) {
    return { inserted: 0, errors: [], submitted: 0 }
  }

  // Process in chunks
  for (let i = 0; i < toImport.length; i += CHUNK_SIZE) {
    const chunk = toImport.slice(i, i + CHUNK_SIZE)
    const chunkNum = Math.floor(i / CHUNK_SIZE) + 1
    const totalChunks = Math.ceil(submitted / CHUNK_SIZE)

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
      // CRITICAL: RPC failed — this silently skips entire chunk in the old code.
      // Log with chunk context so we can debug missing words.
      console.error(
        `[batchInsertWords] Chunk ${chunkNum}/${totalChunks} FAILED — RPC error:`,
        error.code, error.message
      )
      for (const row of chunk) {
        allErrors.push({ word: row.word, error: `RPC_ERROR: ${error.message}` })
      }
      continue
    }

    const result = data as { inserted?: number; errors?: { word: string; error: string }[] }
    const chunkInserted = result?.inserted ?? 0
    totalInserted += chunkInserted

    if (chunkInserted !== chunk.length) {
      // Detect if some rows silently failed within this chunk
      const missing = chunk.length - chunkInserted
      console.warn(
        `[batchInsertWords] Chunk ${chunkNum}/${totalChunks}: submitted=${chunk.length} inserted=${chunkInserted} missing=${missing}`
      )
    }

    if (result?.errors && result.errors.length > 0) {
      allErrors.push(...result.errors)
    }
  }

  return { inserted: totalInserted, errors: allErrors, submitted }
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

// ─── Tags ───────────────────────────────────────────────────
/**
 * Collect all unique tag values from the words table.
 * Returns sorted array of tag strings.
 */
export async function getAllTags(): Promise<string[]> {
  const { data, error } = await supabase
    .from('words')
    .select('tags')
    .not('tags', 'is', null)
    .or('tags.ne.{}')

  if (error || !data) return []

  const set = new Set<string>()
  for (const row of data as { tags: string[] }[]) {
    for (const tag of row.tags) {
      set.add(tag)
    }
  }
  return [...set].sort()
}
