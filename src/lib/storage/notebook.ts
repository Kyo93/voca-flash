import { supabase } from '../supabase'
import type { Word } from '../types'

export interface NotebookEntry {
  id: string
  user_id: string
  word_id: string
  personal_note: string | null
  created_at: string
  updated_at: string
}

export type NotebookWord = Pick<
  Word,
  | 'id'
  | 'word'
  | 'definition'
  | 'phonetic'
  | 'pos'
  | 'difficulty'
  | 'synonyms'
  | 'antonyms'
  | 'word_family'
  | 'image_url'
  | 'example'
  | 'example_vi'
  | 'created_at'
  | 'updated_at'
>

export interface NotebookWordEntry extends NotebookEntry {
  word: NotebookWord | null
}

type NotebookWordEntryRow = Omit<NotebookWordEntry, 'word'> & {
  word?: NotebookWord | NotebookWord[] | null
}

function normalizeNotebookWordEntry(row: NotebookWordEntryRow): NotebookWordEntry {
  const joinedWord = Array.isArray(row.word) ? row.word[0] ?? null : row.word ?? null
  return {
    ...row,
    word: joinedWord,
  }
}

export async function fetchNotebookEntries(userId: string): Promise<NotebookEntry[]> {
  const { data, error } = await supabase
    .from('user_notebook_entries')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('[Storage] fetchNotebookEntries error:', error)
    return []
  }
  return data || []
}

export async function fetchNotebookWordEntries(userId: string): Promise<NotebookWordEntry[]> {
  const { data, error } = await supabase
    .from('user_notebook_entries')
    .select(`
      id,
      user_id,
      word_id,
      personal_note,
      created_at,
      updated_at,
      word:words (
        id,
        word,
        definition,
        phonetic,
        pos,
        difficulty,
        synonyms,
        antonyms,
        word_family,
        image_url,
        example,
        example_vi,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[Storage] fetchNotebookWordEntries error:', error)
    return []
  }

  return ((data || []) as NotebookWordEntryRow[]).map(normalizeNotebookWordEntry)
}

export async function toggleNotebookEntry(userId: string, wordId: string): Promise<{ added: boolean; entry?: NotebookEntry }> {
  // Check if exists
  const { data: existing } = await supabase
    .from('user_notebook_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .maybeSingle()

  if (existing) {
    // Delete
    const { error } = await supabase
      .from('user_notebook_entries')
      .delete()
      .eq('id', existing.id)
    
    if (error) throw error
    return { added: false }
  } else {
    // Insert
    const { data, error } = await supabase
      .from('user_notebook_entries')
      .insert({
        user_id: userId,
        word_id: wordId,
      })
      .select()
      .single()

    if (error) throw error
    return { added: true, entry: data }
  }
}

export async function updateNotebookNote(userId: string, wordId: string, note: string): Promise<void> {
  const { error } = await supabase
    .from('user_notebook_entries')
    .upsert({ 
      user_id: userId, 
      word_id: wordId, 
      personal_note: note, 
      updated_at: new Date().toISOString() 
    }, { onConflict: 'user_id,word_id' })

  if (error) {
    console.error('[Storage] updateNotebookNote error:', error)
    throw error
  }
}
