import {
  getAllRoadmaps,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
} from '../../lib/queries/roadmap-queries'
import type { Roadmap } from '../../lib/types'
import { useAdminResource } from './useAdminResource'

type RoadmapWithTopicCount = Roadmap & { topics?: [{ count: number }] }

export function useAdminRoadmaps() {
  const { items: roadmaps, setItems: setRoadmaps, loading, error, fetchItems, runMutation } =
    useAdminResource<Roadmap>({
      load: () => getAllRoadmaps(),
      mapData: (data) =>
        ((data ?? []) as RoadmapWithTopicCount[]).map((r) => ({
          ...r,
          topic_count: r.topics?.[0]?.count ?? 0,
        })) as Roadmap[],
    })

  const fetch = fetchItems

  async function addRoadmap(
    roadmap: Omit<Roadmap, 'id' | 'created_at' | 'updated_at'>,
  ) {
    return runMutation(() => createRoadmap(roadmap), { refetch: fetch })
  }

  async function editRoadmap(id: string, roadmap: Partial<Roadmap>) {
    return runMutation(() => updateRoadmap(id, roadmap), { refetch: fetch })
  }

  async function removeRoadmap(id: string) {
    const { error: err } = await deleteRoadmap(id)
    if (err) return { error: err.message }
    setRoadmaps((prev) => prev.filter((r) => r.id !== id))
    return { error: null }
  }

  return { roadmaps, loading, error, fetch, addRoadmap, editRoadmap, removeRoadmap }
}
