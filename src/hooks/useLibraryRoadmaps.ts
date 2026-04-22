import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { fetchLibraryPageData } from '../lib/supabase-storage'
import { LIBRARY_IMAGES } from '../lib/constants'
import type { Roadmap, ResumePointer } from '../lib/types'

export type LibraryFilter = 'All' | 'Kids' | 'Casual' | 'Professional' | 'Academic'

export function useLibraryRoadmaps() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [roadmapStats, setRoadmapStats] = useState<Record<string, { total: number, mastered: number }>>({})
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>('All')
  const [learningStates, setLearningStates] = useState<Map<string, ResumePointer>>(new Map())

  useEffect(() => {
    async function loadRoadmaps() {
      if (!user?.id && !loading) return // Prevent infinite reload if no user
      setLoading(true)
      try {
        const data = await fetchLibraryPageData(user?.id)

        // 1. Set roadmaps
        const rms: Roadmap[] = data.map(d => ({
          id: d.id,
          name: d.name,
          slug: d.slug,
          description: d.description,
          image_url: d.image_url,
          is_active: true,
          created_at: '',
          updated_at: ''
        }))
        setRoadmaps(rms)

        // 2. Set stats
        const stats: Record<string, { total: number, mastered: number }> = {}
        const states = new Map<string, ResumePointer>()

        data.forEach(d => {
          stats[d.id] = { total: d.total_words, mastered: d.mastered_count }
          if (d.resume_state) {
            states.set(d.id, {
              id: '',
              user_id: user?.id || '',
              roadmap_id: d.id,
              last_topic_id: d.resume_state.last_topic_id,
              last_accessed_at: d.resume_state.last_accessed_at
            })
          }
        })

        setRoadmapStats(stats)
        setLearningStates(states)

      } catch (err) {
        console.error('Error fetching roadmaps:', err)
      } finally {
        setLoading(false)
      }
    }
    loadRoadmaps()
  }, [user?.id])

  const filteredRoadmaps = useMemo(() => {
    if (activeFilter === 'All') return roadmaps
    
    const kidsKeywords = t('library.keywords.kids', { defaultValue: 'kids,child' }).split(',')
    const profKeywords = t('library.keywords.professional', { defaultValue: 'business,professional' }).split(',')
    const academicKeywords = t('library.keywords.academic', { defaultValue: 'academic,ielts,toeic' }).split(',')
    const casualKeywords = t('library.keywords.casual', { defaultValue: 'casual,daily' }).split(',')

    return roadmaps.filter(r => {
      const name = r.name.toLowerCase()
      if (activeFilter === 'Kids') return kidsKeywords.some(k => name.includes(k.trim().toLowerCase()))
      if (activeFilter === 'Professional') return profKeywords.some(k => name.includes(k.trim().toLowerCase()))
      if (activeFilter === 'Academic') return academicKeywords.some(k => name.includes(k.trim().toLowerCase()))
      if (activeFilter === 'Casual') return casualKeywords.some(k => name.includes(k.trim().toLowerCase()))
      return true
    })
  }, [roadmaps, activeFilter, t])

  const sortedRoadmaps = useMemo(() => {
    return [...filteredRoadmaps].sort((a, b) => {
      const stateA = learningStates.get(a.id)
      const stateB = learningStates.get(b.id)

      if (stateA && stateB) {
        return new Date(stateB.last_accessed_at).getTime() - new Date(stateA.last_accessed_at).getTime()
      }
      if (stateA) return -1
      if (stateB) return 1
      return 0
    })
  }, [filteredRoadmaps, learningStates])

  const getCardSpecs = (roadmap: Roadmap) => {
    const name = roadmap.name.toLowerCase()
    const kidsKeywords = t('library.keywords.kids', { defaultValue: 'kids,child' }).split(',')
    const profKeywords = t('library.keywords.professional', { defaultValue: 'business,professional' }).split(',')
    const academicKeywords = t('library.keywords.academic', { defaultValue: 'academic,ielts,toeic' }).split(',')

    if (kidsKeywords.some(k => name.includes(k.trim().toLowerCase()))) {
      return {
        badge: t('library.card.badges.kids'),
        badgeClass: 'bg-secondary-fixed text-on-secondary-fixed-variant',
        btnClass: 'bg-secondary text-white',
        image: LIBRARY_IMAGES.KIDS
      }
    }
    if (profKeywords.some(k => name.includes(k.trim().toLowerCase()))) {
      return {
        badge: t('library.card.badges.professional'),
        badgeClass: 'bg-primary-fixed text-on-primary-fixed-variant',
        btnClass: 'bg-linear-to-r from-primary-container to-primary text-white shadow-lg shadow-primary-container/20',
        image: LIBRARY_IMAGES.PROFESSIONAL
      }
    }
    if (academicKeywords.some(k => name.includes(k.trim().toLowerCase())) || name.includes('ielts') || name.includes('toeic')) {
      return {
        badge: t('library.card.badges.advanced'),
        badgeClass: 'bg-secondary-fixed text-on-secondary-fixed-variant',
        btnClass: 'bg-secondary text-white',
        image: LIBRARY_IMAGES.ADVANCED
      }
    }
    return {
      badge: t('library.card.badges.lifestyle'),
      badgeClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
      btnClass: 'bg-stone-800 text-stone-50 hover:bg-stone-900',
      image: LIBRARY_IMAGES.LIFESTYLE
    }
  }

  return {
    roadmaps: sortedRoadmaps,
    roadmapStats,
    learningStates,
    loading,
    activeFilter,
    setActiveFilter,
    getCardSpecs
  }
}
