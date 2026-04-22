import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchNotebookEntries, toggleNotebookEntry, updateNotebookNote, NotebookEntry } from '../lib/supabase-storage'

export function useNotebook() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<Map<string, NotebookEntry>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  const loadEntries = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await fetchNotebookEntries(user.id)
      const map = new Map<string, NotebookEntry>()
      data.forEach(e => map.set(e.word_id, e))
      setEntries(map)
    } catch (err) {
      console.error('[useNotebook] loadEntries error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const toggle = useCallback(async (wordId: string) => {
    if (!user) return null
    try {
      const result = await toggleNotebookEntry(user.id, wordId)
      
      setEntries(prev => {
        const next = new Map(prev)
        if (result.added && result.entry) {
          next.set(wordId, result.entry)
        } else {
          next.delete(wordId)
        }
        return next
      })
      
      return result.added
    } catch (err) {
      console.error('[useNotebook] toggle error:', err)
      return null
    }
  }, [user?.id])

  const updateNote = useCallback(async (wordId: string, note: string) => {
    if (!user) return
    try {
      await updateNotebookNote(user.id, wordId, note)
      setEntries(prev => {
        const next = new Map(prev)
        const entry = prev.get(wordId)
        
        const now = new Date().toISOString()
        const updatedEntry: NotebookEntry = entry 
          ? { ...entry, personal_note: note, updated_at: now }
          : { id: `temp-${wordId}`, user_id: user.id, word_id: wordId, personal_note: note, created_at: now, updated_at: now }
          
        next.set(wordId, updatedEntry)
        return next
      })
    } catch (err) {
      console.error('[useNotebook] updateNote error:', err)
    }
  }, [user?.id])

  const isSaved = useCallback((wordId: string) => {
    return entries.has(wordId)
  }, [entries])

  const getNote = useCallback((wordId: string) => {
    return entries.get(wordId)?.personal_note || ''
  }, [entries])

  return {
    entries,
    isLoading,
    toggle,
    updateNote,
    isSaved,
    getNote,
    refresh: loadEntries
  }
}
