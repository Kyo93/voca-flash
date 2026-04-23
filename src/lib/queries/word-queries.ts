import { supabase } from '../supabase'
import type { Word, WordChoice, NormalizedWord, BatchInsertResult } from '../types'
import { autoTag } from '../tag-engine'
import { IMPORT_CHUNK_SIZE } from '../constants'
import { DEFAULT_TOPIC_COLOR } from '../utils'

/**
 * Shape returned by Supabase when joining `topic_words` with `topics(id, name, slug, color)`.
 * Note: PostgREST returns the embedded relation as a single object (not array)
 * because `topic_id` is a FK to `topics.id`.
 */
interface TopicWordJoin {
  word_id: string
  topics: { id: string; name: string; slug: string; color: string | null } | null
}

/**
 * Replace tất cả topic associations của một word.
 * Pattern: delete-then-insert qua bảng junction `topic_words`.
 */
async function replaceWordTopics(wordId: string, topicIds: string[]): Promise<void> {
  await supabase.from('topic_words').delete().eq('word_id', wordId)
  if (topicIds.length === 0) return
  await supabase.from('topic_words').insert(
    topicIds.map((tid) => ({ topic_id: tid, word_id: wordId })),
  )
}

/**
 * Replace tất cả wrong-choice của một word, giữ thứ tự theo index input.
 */
async function replaceWordChoices(wordId: string, choices: string[]): Promise<void> {
  await supabase.from('word_choices').delete().eq('word_id', wordId)
  if (choices.length === 0) return
  await supabase.from('word_choices').insert(
    choices.map((choice, i) => ({
      word_id: wordId,
      choice,
      sort: i + 1,
    })),
  )
}

/** Words */
export async function getAllWords(topicFilter?: string, search?: string) {
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

  const typedWords = words as Word[]
  const wordIds = typedWords.map(w => w.id)
  const { data: junctions } = await supabase
    .from('topic_words')
    .select('word_id, topics(id, name, slug, color)')
    .in('word_id', wordIds)

  const topicNameMap = new Map<string, { id: string; name: string; slug: string; color: string }>()
  for (const junction of (junctions ?? []) as unknown as TopicWordJoin[]) {
    const topic = junction.topics
    if (topic) {
      topicNameMap.set(junction.word_id, {
        id: topic.id,
        name: topic.name,
        slug: topic.slug,
        color: topic.color ?? DEFAULT_TOPIC_COLOR,
      })
    }
  }

  for (const word of typedWords) {
    const topic = topicNameMap.get(word.id)
    word.topics = topic
      ? { id: topic.id, name: topic.name, slug: topic.slug, color: topic.color }
      : null
  }

  return { data: typedWords, error: null }
}

export async function createWord(
  word: Omit<Word, 'id' | 'created_at' | 'updated_at'>,
  topicIds: string[] = []
) {
  const tags = word.tags && word.tags.length > 0
    ? word.tags
    : autoTag(word.word, word.definition)

  const { data: newWord, error } = await supabase
    .from('words')
    .insert({ ...word, tags })
    .select()
    .single()

  if (error || !newWord) return { data: null, error }

  if (topicIds.length > 0) {
    await supabase.from('topic_words').insert(
      topicIds.map(tid => ({ topic_id: tid, word_id: newWord.id }))
    )
  }

  return { data: newWord, error: null }
}

export async function updateWord(
  id: string,
  word: Partial<Word>,
  topicIds?: string[]
) {
  if (topicIds !== undefined) {
    await replaceWordTopics(id, topicIds)
  }

  // topic_id is a legacy field; associations are managed via topic_words junction table
  const { topic_id: _topic_id, ...cleanWord } = word
  return await supabase.from('words').update(cleanWord).eq('id', id).select().single()
}

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

/** Word Choices */
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

/** Batch Import Word Queries */
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

export function markDuplicates(rows: NormalizedWord[], duplicateWords: Set<string>): void {
  for (const row of rows) {
    if (duplicateWords.has(row.word.toLowerCase())) {
      row.status = 'duplicate'
      row.duplicateAction = 'keep'
    }
  }
}

export async function batchInsertWords(rows: NormalizedWord[]): Promise<BatchInsertResult> {
  let totalInserted = 0
  const allErrors: { word: string; error: string }[] = []
  const toImport = rows.filter(r => {
    if (r.status === 'invalid') return false
    if (r.status === 'duplicate' && r.duplicateAction === 'skip') return false
    return true
  })
  const submitted = toImport.length
  if (submitted === 0) return { inserted: 0, errors: [], submitted: 0 }

  for (let i = 0; i < toImport.length; i += IMPORT_CHUNK_SIZE) {
    const chunk = toImport.slice(i, i + IMPORT_CHUNK_SIZE)
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
    const { data, error } = await supabase.rpc('batch_insert_words', { p_words: payload })
    if (error) {
      console.error(`[batchInsertWords] Chunk FAILED (RPC error):`, error.code, error.message)
      for (const row of chunk) {
        allErrors.push({ word: row.word, error: `RPC_ERROR: ${error.message}` })
      }
      continue
    }
    const result = data as { inserted?: number; errors?: { word: string; error: string }[] }
    const insertedCount = result?.inserted ?? 0
    totalInserted += insertedCount
    
    if (insertedCount !== chunk.length) {
      console.warn(`[batchInsertWords] Chunk partly skipped or failed. Inserted ${insertedCount}/${chunk.length}`)
    }
    
    if (result?.errors) allErrors.push(...result.errors)
  }
  return { inserted: totalInserted, errors: allErrors, submitted }
}

export async function updateWordFromImport(wordId: string, normalized: NormalizedWord): Promise<{ error: string | null }> {
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

  await replaceWordTopics(wordId, normalized.topicIds)
  await replaceWordChoices(wordId, normalized.wrongChoices)
  return { error: null }
}
