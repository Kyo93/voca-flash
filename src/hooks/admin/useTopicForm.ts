import { useState, useEffect, useMemo } from 'react'
import type { Topic, Roadmap } from '../../lib/types'
import { slugify } from '../../lib/utils'
import { suggestIcon, suggestColor, suggestImageUrl, ICON_OPTIONS } from '../../lib/topic-suggestions'

interface UseTopicFormProps {
  topic?: Topic | null
  roadmaps: Roadmap[]
  initialRoadmapId?: string
  initialRoadmapSlug?: string
  open: boolean
}

export function useTopicForm({ topic, roadmaps, initialRoadmapId, initialRoadmapSlug, open }: UseTopicFormProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [icon, setIcon] = useState('label')
  const [color, setColor] = useState('#F97316')
  const [roadmapId, setRoadmapId] = useState('')
  const [roadmapSlug, setRoadmapSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Icon picker search state
  const [iconSearch, setIconSearch] = useState('')
  const [iconPickerOpen, setIconPickerOpen] = useState(false)

  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return ICON_OPTIONS
    const q = iconSearch.toLowerCase()
    return ICON_OPTIONS.filter(ic => ic.toLowerCase().includes(q))
  }, [iconSearch])

  useEffect(() => {
    if (topic) {
      setName(topic.name)
      setSlug(topic.slug)
      setDescription(topic.description ?? '')
      setImageUrl(topic.image_url ?? '')
      setIcon(topic.icon ?? 'label')
      setColor(topic.color ?? '#F97316')
      setRoadmapId(topic.roadmap_id ?? '')
      setRoadmapSlug('')
      setSlugManuallyEdited(true)
    } else {
      setName('')
      setSlug('')
      setDescription('')
      setImageUrl('')
      setIcon('label')
      setColor('#F97316')
      setRoadmapId(initialRoadmapId ?? '')
      setRoadmapSlug(initialRoadmapSlug ?? '')
      setSlugManuallyEdited(false)
    }
    setIconSearch('')
    setIconPickerOpen(false)
    setError(null)
  }, [topic, open, initialRoadmapId, initialRoadmapSlug])

  useEffect(() => {
    if (!topic && !slugManuallyEdited) {
      const baseSlug = slugify(name)
      setSlug(roadmapSlug ? `${roadmapSlug}-${baseSlug}` : baseSlug)
    }
  }, [name, topic, roadmapSlug, slugManuallyEdited])

  useEffect(() => {
    if (!topic && roadmapId) {
      const found = roadmaps.find(r => r.id === roadmapId)
      setRoadmapSlug(found?.slug ?? '')
    } else if (!topic && !roadmapId) {
      setRoadmapSlug('')
    }
  }, [roadmapId, topic, roadmaps])

  useEffect(() => {
    if (!name.trim() || !!topic) return
    if (icon === 'label' || !icon) setIcon(suggestIcon(name))
    if (color === '#F97316') setColor(suggestColor(name))
    if (!imageUrl) setImageUrl(suggestImageUrl(name))
  }, [name, topic])

  function handleAutoGenerate() {
    if (!name.trim()) return
    setIcon(suggestIcon(name))
    setImageUrl(suggestImageUrl(name))
    setColor(suggestColor(name))
  }

  return {
    name, setName,
    slug, setSlug,
    description, setDescription,
    imageUrl, setImageUrl,
    icon, setIcon,
    color, setColor,
    roadmapId, setRoadmapId,
    roadmapSlug,
    slugManuallyEdited, setSlugManuallyEdited,
    error, setError,
    iconSearch, setIconSearch,
    iconPickerOpen, setIconPickerOpen,
    filteredIcons,
    handleAutoGenerate
  }
}
