import { useState } from 'react'
import {
  getAllRoadmaps,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
} from '../../lib/admin-queries'
import type { Roadmap } from '../../lib/types'

export function useAdminRoadmaps() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetch() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await getAllRoadmaps()
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    setRoadmaps((data as Roadmap[]) ?? [])
    setLoading(false)
  }

  async function addRoadmap(
    roadmap: Omit<Roadmap, 'id' | 'created_at' | 'updated_at'>
  ) {
    const { error: err } = await createRoadmap(roadmap)
    if (err) return { error: err.message }
    await fetch()
    return { error: null }
  }

  async function editRoadmap(id: string, roadmap: Partial<Roadmap>) {
    const { error: err } = await updateRoadmap(id, roadmap)
    if (err) return { error: err.message }
    await fetch()
    return { error: null }
  }

  async function removeRoadmap(id: string) {
    const { error: err } = await deleteRoadmap(id)
    if (err) return { error: err.message }
    setRoadmaps((prev) => prev.filter((r) => r.id !== id))
    return { error: null }
  }

  return { roadmaps, loading, error, fetch, addRoadmap, editRoadmap, removeRoadmap }
}
