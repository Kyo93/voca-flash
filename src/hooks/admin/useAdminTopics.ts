import {
  getAllTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  reorderTopics,
} from '../../lib/queries/topic-queries'
import type { Topic } from '../../lib/types'
import { useAdminResource } from './useAdminResource'

export function useAdminTopics() {
  const { items: topics, setItems: setTopics, loading, error, fetchItems, runMutation } =
    useAdminResource<Topic>({ load: () => getAllTopics() })

  const fetch = fetchItems

  async function addTopic(topic: Omit<Topic, 'id' | 'created_at' | 'updated_at'>) {
    return runMutation(() => createTopic(topic), { refetch: fetch })
  }

  async function editTopic(id: string, topic: Partial<Topic>) {
    return runMutation(() => updateTopic(id, topic), { refetch: fetch })
  }

  async function removeTopic(id: string) {
    const { error: err } = await deleteTopic(id)
    if (err) return { error: err.message }
    setTopics((prev) => prev.filter((t) => t.id !== id))
    return { error: null }
  }

  async function reorder(ids: string[]) {
    await reorderTopics(ids.map((id, index) => ({ id, sort_order: index })))
    await fetch()
  }

  return { topics, loading, error, fetch, addTopic, editTopic, removeTopic, reorder }
}
