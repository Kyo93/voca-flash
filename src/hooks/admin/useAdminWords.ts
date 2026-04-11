import { useState, useCallback } from 'react'
import {
  getAllWords,
  createWord,
  updateWord,
  deleteWord,
  getWordChoices,
  createWordChoices,
  deleteWordChoices,
} from '../../lib/admin-queries'
import type { Word, WordChoice, Topic } from '../../lib/types'

export function useAdminWords() {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetch(topicFilter?: string, search?: string) {
    setLoading(true)
    setError(null)
    const { data, error: err } = await getAllWords(topicFilter, search)
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    setWords((data as Word[]) ?? [])
    setLoading(false)
  }

  async function addWord(
    word: Omit<Word, 'id' | 'created_at' | 'updated_at'>,
    wrongChoices: string[]
  ) {
    const { data, error: err } = await createWord(word)
    if (err) return { error: err.message }

    if (wrongChoices.length > 0) {
      await createWordChoices(
        wrongChoices.map((choice, i) => ({
          word_id: data!.id,
          choice,
          sort: i + 1,
        }))
      )
    }

    await fetch()
    return { error: null }
  }

  async function editWord(
    id: string,
    word: Partial<Word>,
    wrongChoices?: string[]
  ) {
    const { error: err } = await updateWord(id, word)
    if (err) return { error: err.message }

    if (wrongChoices !== undefined) {
      await deleteWordChoices(id)
      if (wrongChoices.length > 0) {
        await createWordChoices(
          wrongChoices.map((choice, i) => ({
            word_id: id,
            choice,
            sort: i + 1,
          }))
        )
      }
    }

    await fetch()
    return { error: null }
  }

  async function removeWord(id: string) {
    await deleteWordChoices(id)
    const { error: err } = await deleteWord(id)
    if (err) return { error: err.message }
    setWords((prev) => prev.filter((w) => w.id !== id))
    return { error: null }
  }

  async function loadChoices(wordId: string): Promise<WordChoice[]> {
    const { data } = await getWordChoices(wordId)
    return (data as WordChoice[]) ?? []
  }

  return { words, loading, error, fetch, addWord, editWord, removeWord, loadChoices }
}
