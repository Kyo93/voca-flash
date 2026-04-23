import { useState, useEffect, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Roadmap } from '../../lib/types'
import { slugify } from '../../lib/utils'

interface Props {
  open: boolean
  roadmap?: Roadmap | null
  onSave: (data: {
    name: string
    slug: string
    description: string | null
    image_url: string | null
    is_active: boolean
  }) => Promise<void>
  onClose: () => void
}

export default function RoadmapFormModal({ open, roadmap, onSave, onClose }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    if (!roadmap) setSlug(slugify(name))
  }, [name, roadmap])

  if (!open) return null

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 modal-container"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-orange-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-black text-secondary">
              {roadmap ? t('admin.roadmapForm.titleEdit') : t('admin.roadmapForm.titleAdd')}
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              {roadmap ? t('admin.roadmapForm.subtitleEdit') : t('admin.roadmapForm.subtitleAdd')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-stone-500">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">

          {/* Section 1: Info */}
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-base text-orange-400">label</span>
            <span className="text-xs font-black text-stone-400 uppercase tracking-wider">{t('common.info')}</span>
            <div className="flex-1 h-px bg-stone-100" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">{t('admin.roadmapForm.nameLabel')} *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('admin.roadmapForm.namePlaceholder')}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Slug</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="english-mastery"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-mono text-xs outline-none focus:border-primary focus:bg-white transition-all min-w-0"
                />
                <button
                  type="button"
                  onClick={() => setSlug(slugify(name))}
                  className="shrink-0 px-3 py-2 rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 transition-all cursor-pointer"
                  title={t('common.refresh')}
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-secondary mb-2">{t('admin.roadmapForm.descLabel')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('admin.roadmapForm.descPlaceholder')}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Section 2: Image */}
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-base text-orange-400">image</span>
            <span className="text-xs font-black text-stone-400 uppercase tracking-wider">{t('common.image')}</span>
            <div className="flex-1 h-px bg-stone-100" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-secondary mb-2">{t('admin.roadmapForm.iconLabel')}</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://picsum.photos/seed/roadmap-name/800/450"
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary text-sm outline-none focus:border-primary focus:bg-white transition-all"
            />
            {imageUrl && (
              <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl border-2 border-stone-200 bg-stone-50">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = 'https://placehold.co/800x450/e5e7eb/9ca3af?text=Invalid+URL'
                  }}
                />
              </div>
            )}
          </div>

          {/* Section 3: Status */}
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-base text-orange-400">toggle_on</span>
            <span className="text-xs font-black text-stone-400 uppercase tracking-wider">{t('common.status')}</span>
            <div className="flex-1 h-px bg-stone-100" />
          </div>

          <div
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all mb-4 ${
              isActive
                ? 'border-green-200 bg-green-50'
                : 'border-stone-200 bg-stone-50'
            }`}
          >
            <div
              className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${
                isActive ? 'bg-green-500' : 'bg-stone-300'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
            <div>
              <p className="font-bold text-secondary text-sm">
                {isActive ? t('topic.status.learning') : t('topics.locked')}
              </p>
              <p className="text-xs text-stone-400">
                {isActive ? t('admin.roadmapForm.statusActive') : t('admin.roadmapForm.statusInactive')}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium mb-4">
              {error}
            </div>
          )}

          {/* Footer actions */}
          <div className="flex gap-3 pt-2 border-t border-stone-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : roadmap ? t('common.save') : t('common.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
