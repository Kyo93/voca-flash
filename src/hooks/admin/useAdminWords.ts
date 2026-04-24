import {
  getAllWords,
  createWord,
  updateWord,
  deleteWord,
  deleteWords,
  bulkAddWordsToTopic,
  getWordChoices,
  createWordChoices,
  deleteWordChoices,
  getWordTopicIds,
  buildChoicePayload,
} from '../../lib/queries/word-queries'
import type { Word, WordChoice } from '../../lib/types'
import { useAdminResource } from './useAdminResource'

export function useAdminWords() {
  const { items: words, setItems: setWords, loading, error, fetchItems } =
    useAdminResource<Word, [topicFilter?: string, search?: string]>({
      load: (topicFilter, search) => getAllWords(topicFilter, search),
    })

  const fetch = fetchItems

  async function addWord(
    word: Omit<Word, 'id' | 'created_at' | 'updated_at'>,
    wrongChoices: string[],
    topicIds: string[] = [],
  ) {
    const { data, error: err } = await createWord({ ...word }, topicIds)
    if (err) return { error: err.message }

    if (wrongChoices.length > 0) {
      await createWordChoices(buildChoicePayload(data!.id, wrongChoices))
    }

    await fetch()
    return { error: null }
  }

  async function editWord(
    id: string,
    word: Partial<Word>,
    wrongChoices?: string[],
    topicIds?: string[],
  ) {
    const { error: err } = await updateWord(id, word, topicIds)
    if (err) return { error: err.message }

    if (wrongChoices !== undefined) {
      await deleteWordChoices(id)
      if (wrongChoices.length > 0) {
        await createWordChoices(buildChoicePayload(id, wrongChoices))
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

  async function bulkDelete(ids: string[]) {
    const { error: err } = await deleteWords(ids)
    if (err) return { error: err.message }
    setWords((prev) => prev.filter((w) => !ids.includes(w.id)))
    return { error: null }
  }

  async function bulkAssignTopic(ids: string[], topicId: string) {
    const { error: err } = await bulkAddWordsToTopic(ids, topicId)
    if (err) return { error: err.message }
    return { error: null }
  }

  async function loadChoices(wordId: string): Promise<WordChoice[]> {
    const { data } = await getWordChoices(wordId)
    return (data as WordChoice[]) ?? []
  }

  async function loadTopicIds(wordId: string): Promise<string[]> {
    return await getWordTopicIds(wordId)
  }

  return { words, loading, error, fetch, addWord, editWord, removeWord, bulkDelete, bulkAssignTopic, loadChoices, loadTopicIds }
}
