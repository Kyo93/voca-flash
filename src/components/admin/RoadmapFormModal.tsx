import { useState, useEffect, type FormEvent } from 'react'
import type { Roadmap } from '../../lib/types'

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
      setError('Tên lộ trình không được trống')
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
              {roadmap ? 'Sửa lộ trình' : 'Thêm lộ trình mới'}
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              {roadmap ? 'Cập nhật thông tin lộ trình' : 'Tạo lộ trình học tập mới'}
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
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">Tên lộ trình *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="English Mastery"
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

          <div>
            <label className="block text-sm font-bold text-secondary mb-2">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về lộ trình này..."
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

          {/* Active toggle */}
          <div
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              isActive
                ? 'border-green-200 bg-green-50'
                : 'border-stone-200 bg-stone-50'
            }`}
          >
            <div
              className={`w-12 h-7 rounded-full relative transition-colors ${
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
                {isActive ? 'Đang hoạt động' : 'Tạm dừng'}
              </p>
              <p className="text-xs text-stone-400">
                {isActive ? 'Hiển thị với người dùng' : 'Ẩn với người dùng'}
              </p>
            </div>
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
              {loading ? 'Đang lưu...' : roadmap ? 'Lưu thay đổi' : 'Thêm lộ trình'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
