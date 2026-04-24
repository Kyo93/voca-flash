import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getRoadmapById,
  getTopicsByRoadmap,
  getWordsWithTopicsByRoadmap,
  assignWordsToTopic,
  unassignWordsFromTopic,
} from '../../lib/queries/roadmap-queries'
import {
  createTopic,
  deleteTopic,
  getTopicWordCounts,
  reorderTopics,
  updateTopic,
} from '../../lib/queries/topic-queries'
import { deleteWord } from '../../lib/queries/word-queries'
import { useAdminTopics } from './useAdminTopics'
import { useSelection } from '../useSelection'
import type { Roadmap, Topic } from '../../lib/types'
import type { EnrichedWord } from '../../components/admin/WordPool'

export interface SaveTopicPayload {
  name: string
  slug: string
  description: string | null
  image_url: string | null
  icon: string
  color: string
  roadmap_id: string | null
}

/**
 * Owns the entire data + mutation surface of `RoadmapSetupPage`:
 *  - parallel fetch of roadmap/topics/words/counts via `refreshAll()`
 *  - selection + filter UI state
 *  - bulk assign/unassign, delete topic/word, save topic, reorder topics
 *
 * Collapses the previous 4× `loadData() + fetchTopics()` pattern into a
 * single `refreshAll()` so callers can't accidentally skip one.
 */
export function useRoadmapSetup(roadmapId: string | undefined) {
  const { fetch: fetchTopics } = useAdminTopics()

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [words, setWords] = useState<EnrichedWord[]>([])
  const [wordCounts, setWordCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const selection = useSelection()
  const {
    selectedIds: selectedWordIds,
    toggleOne: toggleWord,
    toggleAll: toggleAllSelection,
    clear: clearSelectedWords,
    remove: removeFromSelection,
  } = selection

  const [search, setSearch] = useState('')
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!roadmapId) return
    setLoading(true)

    const [roadmapResponse, topicsRes, wordsRes, countsRes] = await Promise.all([
      getRoadmapById(roadmapId),
      getTopicsByRoadmap(roadmapId),
      getWordsWithTopicsByRoadmap(roadmapId),
      getTopicWordCounts(roadmapId),
    ])

    if (roadmapResponse.data) setRoadmap(roadmapResponse.data as Roadmap)
    if (topicsRes.data) setTopics((topicsRes.data as Topic[]) ?? [])
    if (wordsRes.data) setWords((wordsRes.data as EnrichedWord[]) ?? [])
    if (countsRes.data) setWordCounts(countsRes.data as Record<string, number>)

    setLoading(false)
  }, [roadmapId])

  /**
   * Refresh both local roadmap data AND the global admin-topics list.
   * Replaces the 4× `await loadData(); await fetchTopics()` pairs scattered
   * through the page so callers can't drift.
   */
  const refreshAll = useCallback(async () => {
    await loadData()
    await fetchTopics()
  }, [loadData, fetchTopics])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredWords = useMemo(() => {
    if (activeTopicId === null) return words
    return words.filter((w) => w.topicIds.includes(activeTopicId))
  }, [words, activeTopicId])

  const uncategorizedCount = useMemo(
    () => words.filter((w) => w.topicIds.length === 0).length,
    [words],
  )

  function toggleAll() {
    toggleAllSelection(filteredWords.map((w) => w.id))
  }

  async function handleBulkAssign(targetTopicId: string) {
    if (!roadmapId) return
    const ids = [...selectedWordIds]
    if (targetTopicId) {
      await assignWordsToTopic(ids, targetTopicId)
    }
    clearSelectedWords()
    await refreshAll()
  }

  async function handleBulkUnassign() {
    if (!activeTopicId) return
    const ids = [...selectedWordIds]
    await unassignWordsFromTopic(ids, activeTopicId)
    clearSelectedWords()
    await refreshAll()
  }

  async function handleDeleteTopic(target: Topic) {
    await deleteTopic(target.id)
    await refreshAll()
  }

  async function handleDeleteWord(wordId: string) {
    await deleteWord(wordId)
    removeFromSelection(wordId)
    await loadData() // word delete doesn't affect topic list
  }

  async function handleReorderTopics(reordered: Topic[]) {
    setTopics(reordered)
    const updates = reordered.map((tp, i) => ({ id: tp.id, sort_order: i }))
    await reorderTopics(updates)
  }

  async function handleSaveTopic(editTopic: Topic | null, data: SaveTopicPayload) {
    if (editTopic) {
      await updateTopic(editTopic.id, data)
    } else {
      await createTopic({ ...data, sort_order: topics.length })
    }
    await refreshAll()
  }

  return {
    // data
    roadmap,
    topics,
    words,
    wordCounts,
    filteredWords,
    uncategorizedCount,
    loading,
    // selection / filters
    selectedWordIds,
    toggleWord,
    toggleAll,
    clearSelectedWords,
    search,
    setSearch,
    activeTopicId,
    setActiveTopicId,
    activeTagFilter,
    setActiveTagFilter,
    // mutations
    refreshAll,
    handleBulkAssign,
    handleBulkUnassign,
    handleDeleteTopic,
    handleDeleteWord,
    handleReorderTopics,
    handleSaveTopic,
  }
}
