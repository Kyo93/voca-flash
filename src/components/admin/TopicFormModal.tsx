import { type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Topic, Roadmap } from '../../lib/types'
import { slugify, formatDetailedDate } from '../../lib/utils'
import { useTopicForm } from '../../hooks/admin/useTopicForm'
import { TopicIconPicker } from './TopicIconPicker'
import ErrorBanner from '../common/ErrorBanner'
import ImageUrlField from '../common/ImageUrlField'
import { ADMIN_FALLBACK_IMAGE } from '../../lib/constants'

interface Props {
  open: boolean
  topic?: Topic | null
  roadmaps: Roadmap[]
  roadmapId?: string
  roadmapSlug?: string
  lastEditedBy?: string
  lastEditedAt?: string
  onSave: (data: {
    name: string
    slug: string
    description: string | null
    image_url: string | null
    icon: string
    color: string
    roadmap_id: string | null
  }) => Promise<void>
  onClose: () => void
}

export default function TopicFormModal({
  open,
  topic,
  roadmaps,
  roadmapId: initialRoadmapId,
  roadmapSlug: initialRoadmapSlug,
  lastEditedBy,
  lastEditedAt,
  onSave,
  onClose
}: Props) {
  const { t } = useTranslation()
  const {
    name, setName,
    slug, setSlug,
    description, setDescription,
    imageUrl, setImageUrl,
    icon, setIcon,
    color, setColor,
    roadmapId, setRoadmapId,
    roadmapSlug,
    setSlugManuallyEdited,
    error, setError,
    iconSearch, setIconSearch,
    iconPickerOpen, setIconPickerOpen,
    filteredIcons,
    handleAutoGenerate
  } = useTopicForm({ topic, roadmaps, initialRoadmapId, initialRoadmapSlug, open })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('admin.topicForm.errorName'))
      return
    }
    setError(null)
    await onSave({
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      icon: icon.trim() || 'label',
      color,
      roadmap_id: roadmapId || null,
    })
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4 modal-container"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-stone-100 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-stone-800 leading-tight">
                {topic ? t('admin.topicForm.titleEdit') : t('admin.topicForm.titleAdd')}
              </h2>
              <p className="text-sm text-stone-400 mt-0.5">
                {topic ? t('admin.topicForm.subtitleEdit') : t('admin.topicForm.subtitleAdd')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer mt-1"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable form body */}
        <form id="topic-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── 2-col row: Topic Name + Slug ───────────────── */}
          <div className="grid grid-cols-2 gap-5">
            {/* Topic Name */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                {t('admin.topicForm.nameLabel')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('admin.topicForm.namePlaceholder')}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-stone-200 bg-white text-stone-800 font-medium text-base shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAutoGenerate}
                  disabled={!name.trim()}
                  title={t('common.refresh')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-orange-100 text-orange-500 flex items-center justify-center hover:bg-orange-200 transition-all disabled:opacity-30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                </button>
              </div>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                {t('admin.topicForm.slugLabel')}
              </label>
              <div className="flex items-center gap-0 rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <span className="pl-4 pr-1 py-3 text-stone-400 font-mono text-sm bg-stone-50 border-r border-stone-100 select-none shrink-0">/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true) }}
                  placeholder={t('admin.topicForm.slugPlaceholder')}
                  className="flex-1 px-3 py-3 font-mono text-sm text-stone-700 outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    const baseSlug = slugify(name)
                    setSlug(roadmapSlug ? `${roadmapSlug}-${baseSlug}` : baseSlug)
                    setSlugManuallyEdited(false)
                  }}
                  className="px-3 h-full text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer flex items-center justify-center border-l border-stone-100"
                  title={t('common.refresh')}
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                </button>
              </div>
              {roadmapSlug && (
                <p className="text-[11px] text-stone-400 mt-1.5 font-medium">
                  {t('admin.topicForm.slugHint', { slug: `${roadmapSlug}-` })}
                </p>
              )}
            </div>
          </div>

          {/* ── Description ──────────────────── */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              {t('admin.topicForm.descLabel')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('admin.topicForm.descPlaceholder')}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-medium shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* ── 2-col row: Roadmap + Icon ─────────────────── */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                {t('roadmap.title')}
              </label>
              <select
                value={roadmapId}
                onChange={(e) => setRoadmapId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-medium shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer appearance-none"
              >
                <option value="">— {t('admin.topics.uncategorized')} —</option>
                {roadmaps.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <TopicIconPicker
              color={color}
              setColor={setColor}
              icon={icon}
              setIcon={setIcon}
              iconPickerOpen={iconPickerOpen}
              setIconPickerOpen={setIconPickerOpen}
              iconSearch={iconSearch}
              setIconSearch={setIconSearch}
              filteredIcons={filteredIcons}
            />
          </div>

          {/* ── Image URL ───────── */}
          <ImageUrlField
            value={imageUrl}
            onChange={setImageUrl}
            label={t('common.image')}
            placeholder={t('admin.topicForm.imagePlaceholder')}
            inputClassName="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-600 text-sm shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
            labelClassName="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2"
            previewWrapperClassName="mt-3 rounded-xl overflow-hidden border border-stone-100 bg-stone-100"
            fallbackImage={ADMIN_FALLBACK_IMAGE}
            emptyState={
              <div
                className="mt-3 rounded-xl border-2 border-dashed border-stone-200 aspect-video bg-stone-50 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${color}08, ${color}18)` }}
              >
                <span className="material-symbols-outlined text-3xl text-stone-300">image</span>
              </div>
            }
          />

          {error && <ErrorBanner message={error} />}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 shrink-0">
          <div className="flex items-center justify-between">
            {lastEditedAt && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-400">
                  {lastEditedBy 
                    ? t('common.lastEditedBy', { name: lastEditedBy }) 
                    : t('common.lastEdited')
                  }
                </span>
                <span className="text-[11px] font-mono text-stone-400">
                  ↑{formatDetailedDate(lastEditedAt)}
                </span>
              </div>
            )}
            {!lastEditedBy && !lastEditedAt && <span />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-semibold hover:bg-stone-50 transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                form="topic-form"
                className="px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm transition-all disabled:opacity-50"
                style={{ backgroundColor: color }}
              >
                {topic ? t('common.save') : t('common.add')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
