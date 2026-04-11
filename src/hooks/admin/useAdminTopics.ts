import { useState } from 'react'
import {
  getAllTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  reorderTopics,
} from '../../lib/admin-queries'
import type { Topic } from '../../lib/types'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export { slugify }

export function useAdminTopics() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetch() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await getAllTopics()
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    setTopics((data as Topic[]) ?? [])
    setLoading(false)
  }

  async function addTopic(topic: Omit<Topic, 'id' | 'created_at' | 'updated_at'>) {
    const { error: err } = await createTopic(topic)
    if (err) return { error: err.message }
    await fetch()
    return { error: null }
  }

  async function editTopic(id: string, topic: Partial<Topic>) {
    const { error: err } = await updateTopic(id, topic)
    if (err) return { error: err.message }
    await fetch()
    return { error: null }
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
