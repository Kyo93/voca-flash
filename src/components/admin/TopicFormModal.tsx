import { useState, useEffect, type FormEvent } from 'react'
import type { Topic, Roadmap } from '../../lib/types'

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

interface Props {
  open: boolean
  topic?: Topic | null
  roadmaps: Roadmap[]
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

export default function TopicFormModal({ open, topic, roadmaps, onSave, onClose }: Props) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [icon, setIcon] = useState('📚')
  const [color, setColor] = useState('#F97316')
  const [roadmapId, setRoadmapId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (topic) {
      setName(topic.name)
      setSlug(topic.slug)
      setDescription(topic.description ?? '')
      setImageUrl(topic.image_url ?? '')
      setIcon(topic.icon ?? '📚')
      setColor(topic.color ?? '#F97316')
      setRoadmapId(topic.roadmap_id ?? '')
    } else {
      setName('')
      setSlug('')
      setDescription('')
      setImageUrl('')
      setIcon('📚')
      setColor('#F97316')
      setRoadmapId('')
    }
    setError(null)
  }, [topic, open])

  // Auto-generate slug from name
  useEffect(() => {
    if (!topic) {
      setSlug(slugify(name))
    }
  }, [name, topic])

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Tên chủ đề không được trống')
      return
    }
    setLoading(true)
    setError(null)
    await onSave({
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      icon: icon.trim() || '📚',
      color,
      roadmap_id: roadmapId || null,
    })
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-orange-50 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-orange-100 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-xl font-black text-secondary">
              {topic ? 'Sửa chủ đề' : 'Thêm chủ đề mới'}
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              {topic ? 'Cập nhật thông tin chủ đề' : 'Tạo chủ đề học tập mới'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-stone-500">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">
              Tên chủ đề *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Giao tiếp hàng ngày"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">Slug</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="giao-tiep-hang-ngay"
                className="flex-1 px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-mono text-sm outline-none focus:border-primary focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setSlug(slugify(name))}
                className="px-3 py-2 rounded-xl bg-stone-100 text-stone-500 text-sm font-bold hover:bg-stone-200 transition-all cursor-pointer"
                title="Tạo lại slug"
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả ngắn về chủ đề này..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-secondary mb-2">Ảnh đại diện (URL)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary text-sm outline-none focus:border-primary focus:bg-white transition-all"
            />
            {imageUrl && (
              <div className="mt-3 aspect-video w-full max-w-[200px] overflow-hidden rounded-xl border border-stone-200">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+URL'; }} />
              </div>
            )}
          </div>

          {/* Icon + Color row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Icon</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  maxLength={2}
                  className="w-16 px-3 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-center text-2xl outline-none focus:border-primary focus:bg-white transition-all"
                />
                <span className="text-3xl">{icon || '📚'}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Màu sắc</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-12 rounded-xl border-2 border-stone-200 cursor-pointer p-1 bg-transparent"
                />
                <span
                  className="w-12 h-12 rounded-xl border-2 border-stone-200 shrink-0"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          </div>

          {/* Roadmap assignment */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">Lộ trình</label>
            <select
              value={roadmapId}
              onChange={(e) => setRoadmapId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all"
            >
              <option value="">— Không gán —</option>
              {roadmaps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang lưu...' : topic ? 'Lưu thay đổi' : 'Thêm chủ đề'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
