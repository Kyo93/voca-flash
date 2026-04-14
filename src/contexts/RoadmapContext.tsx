import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getAllRoadmaps } from '../lib/admin-queries'
import type { Roadmap } from '../lib/types'

interface RoadmapContextValue {
  selectedRoadmap: Roadmap | null
  setSelectedRoadmap: (r: Roadmap | null) => void
  roadmaps: Roadmap[]
  loading: boolean
}

const RoadmapContext = createContext<RoadmapContextValue>({
  selectedRoadmap: null,
  setSelectedRoadmap: () => {},
  roadmaps: [],
  loading: false,
})

export function useRoadmapContext() {
  return useContext(RoadmapContext)
}

interface Props { children: ReactNode }

export function RoadmapProvider({ children }: Props) {
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null)
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getAllRoadmaps().then(({ data }) => {
      const all = (data as Roadmap[]) ?? []
      setRoadmaps(all)
      if (all.length > 0 && !selectedRoadmap) {
        setSelectedRoadmap(all[0])
      }
      setLoading(false)
    })
  }, [])

  return (
    <RoadmapContext.Provider value={{ selectedRoadmap, setSelectedRoadmap, roadmaps, loading }}>
      {children}
    </RoadmapContext.Provider>
  )
}
