import { supabase } from '../supabase'

export interface NotebookEntry {
  id: string
  user_id: string
  word_id: string
  personal_note: string | null
  created_at: string
  updated_at: string
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
    .update({ personal_note: note, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('word_id', wordId)

  if (error) {
    console.error('[Storage] updateNotebookNote error:', error)
    throw error
  }
}
