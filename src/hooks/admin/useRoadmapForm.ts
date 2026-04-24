import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Roadmap } from '../../lib/types'
import { slugify } from '../../lib/utils'

export interface RoadmapFormPayload {
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
}

interface UseRoadmapFormArgs {
  roadmap?: Roadmap | null
  open: boolean
  onSave: (data: RoadmapFormPayload) => Promise<void>
}

/**
 * Form-state container for RoadmapFormModal — matches the sibling pattern
 * (`useWordForm`, `useTopicForm`) so the modal component is pure UI.
 */
export function useRoadmapForm({ roadmap, open, onSave }: UseRoadmapFormArgs) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset whenever the modal opens for a new/edit target.
  useEffect(() => {
    if (roadmap) {
      setName(roadmap.name)
      setSlug(roadmap.slug)
      setDescription(roadmap.description ?? '')
      setImageUrl(roadmap.image_url ?? '')
      setIsActive(roadmap.is_active ?? true)
    } else {
      setName('')
      setSlug('')
      setDescription('')
      setImageUrl('')
      setIsActive(true)
    }
    setError(null)
  }, [roadmap, open])

  // Auto-derive slug while creating (not editing).
  useEffect(() => {
    if (!roadmap) setSlug(slugify(name))
  }, [name, roadmap])

  function regenerateSlug() {
    setSlug(slugify(name))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('admin.roadmapForm.errorName'))
      return
    }
    setLoading(true)
    setError(null)
    await onSave({
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      is_active: isActive,
    })
    setLoading(false)
  }

  return {
    name, setName,
    slug, setSlug,
    description, setDescription,
    imageUrl, setImageUrl,
    isActive, setIsActive,
    loading, error,
    regenerateSlug,
    handleSubmit,
  }
}
