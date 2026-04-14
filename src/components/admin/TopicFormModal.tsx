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

// Keyword → Material Symbol icon name
const ICON_MAP: [string[], string][] = [
  [['giao tiếp', 'communication', 'chat', 'nói'], 'chat'],
  [['giáo dục', 'học', 'học tập', 'school', 'study', 'edu', 'learning'], 'school'],
  [['sức khỏe', 'y tế', 'bệnh', 'thể thao', 'health', 'medical', 'fitness', 'sport'], 'fitness_center'],
  [['đồ ăn', 'ẩm thực', 'nấu ăn', 'food', 'eat', 'dining', 'restaurant', 'cooking'], 'restaurant'],
  [['đời thường', 'cuộc sống', 'daily', 'life', 'living', 'lifestyle'], 'waving_hand'],
  [['thiên nhiên', 'môi trường', 'cây', 'nature', 'outdoor', 'plant', 'animal', 'pets'], 'nature'],
  [['nhà cửa', 'nhà', 'home', 'house', 'housing'], 'home'],
  [['công việc', 'job', 'work', 'career', 'business', 'office'], 'work'],
  [['cảm xúc', 'tâm lý', 'emotion', 'feeling', 'mind', 'mental'], 'mood'],
  [['kỹ năng', 'skill', 'ability', 'soft skill'], 'psychology'],
  [['du lịch', 'travel', 'trip', 'journey', 'vacation'], 'travel'],
  [['âm nhạc', 'music', 'nhạc'], 'music_note'],
  [['nghệ thuật', 'art', 'design', 'creative'], 'palette'],
  [['khoa học', 'science', 'tech', 'technology'], 'science'],
  [['pháp luật', 'law', 'legal', 'justice'], 'gavel'],
  [['chính trị', 'politics', 'policy', 'political'], 'policy'],
  [['kinh tế', 'economy', 'economic', 'finance', 'money'], 'payments'],
  [['xã hội', 'social', 'society', 'community'], 'groups'],
  [['trẻ em', 'trẻ', 'kid', 'child', 'children'], 'child_care'],
  [['phổ thông', 'general', 'common', 'standard'], 'auto_stories'],
  [['công nghệ', 'tech', 'computer', 'it', 'software'], 'computer'],
  [['kỹ thuật', 'engineering', 'technical'], 'engineering'],
  [['luật', 'legal'], 'gavel'],
  [['toeic', 'ielts', 'ngoại ngữ', 'language'], 'translate'],
  [['yêu', 'tình yêu', 'love', 'romance'], 'favorite'],
  [['thể thao', 'sport', 'game', 'competition'], 'sports'],
  [['tiền', 'tài chính', 'money', 'financial'], 'payments'],
  [['tài chính', 'finance'], 'account_balance'],
]

// ─── Icon Picker Grid ────────────────────────────────────────────
const ICON_OPTIONS = [
  'chat', 'school', 'fitness_center', 'restaurant', 'waving_hand',
  'nature', 'home', 'work', 'mood', 'psychology',
  'travel', 'music_note', 'palette', 'science', 'gavel',
  'policy', 'payments', 'groups', 'child_care', 'auto_stories',
  'computer', 'engineering', 'translate', 'favorite', 'sports',
  'account_balance', 'storefront', 'pets', 'lightbulb', 'brush',
  'celebration', 'eco', 'medical_services', '做饭', 'book',
]

function suggestIcon(name: string): string {
  const lower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  for (const [keywords, icon] of ICON_MAP) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) return icon
  }
  return 'label'
}

function suggestImageUrl(name: string): string {
  // Use picsum for a random beautiful placeholder image
  const seed = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').toLowerCase()
  return `https://picsum.photos/seed/${seed}/800/450`
}

// Color palette for auto-assignment
const COLOR_PALETTE = [
  '#F97316', '#3B82F6', '#10B981', '#8B5CF6',
  '#EF4444', '#EAB308', '#06B6D4', '#EC4899',
]

function suggestColor(name: string): string {
  const idx = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % COLOR_PALETTE.length
  return COLOR_PALETTE[idx]
}

interface Props {
  open: boolean
  topic?: Topic | null
  roadmaps: Roadmap[]
  /** Pre-fill roadmap_id khi tạo mới (từ RoadmapContext sidebar) */
  roadmapId?: string
  /** Roadmap slug dùng làm prefix cho topic slug */
  roadmapSlug?: string
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

export default function TopicFormModal({ open, topic, roadmaps, roadmapId: initialRoadmapId, roadmapSlug: initialRoadmapSlug, onSave, onClose }: Props) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [icon, setIcon] = useState('📚')
  const [color, setColor] = useState('#F97316')
  const [roadmapId, setRoadmapId] = useState('')
  const [roadmapSlug, setRoadmapSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

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
      setSlugManuallyEdited(true) // Khi edit, giữ nguyên slug không đổi
    } else {
      setName('')
      setSlug('')
      setDescription('')
      setImageUrl('')
      setIcon('label')
      setColor('#F97316')
      setRoadmapId(initialRoadmapId ?? '')
      setRoadmapSlug(initialRoadmapSlug ?? '')
      setSlugManuallyEdited(false) // Khi tạo mới, auto-generate slug
    }
    setError(null)
  }, [topic, open, roadmapId])

  useEffect(() => {
    if (!topic && !slugManuallyEdited) {
      const baseSlug = slugify(name)
      setSlug(roadmapSlug ? `${roadmapSlug}-${baseSlug}` : baseSlug)
    }
  }, [name, topic, roadmapSlug, slugManuallyEdited])

  // Update roadmapSlug when roadmapId changes (for creating only)
  useEffect(() => {
    if (!topic && roadmapId) {
      const found = roadmaps.find(r => r.id === roadmapId)
      setRoadmapSlug(found?.slug ?? '')
    } else if (!topic && !roadmapId) {
      setRoadmapSlug('')
    }
  }, [roadmapId, topic, roadmaps])

  // Auto-sync icon + color + image when name changes (create mode only)
  useEffect(() => {
    if (!name.trim() || !!topic) return
    // Auto-suggest icon from keyword
    const suggested = suggestIcon(name)
    if (icon === 'label' || !icon) {
      setIcon(suggested)
    }
    // Auto-suggest color from name hash
    if (color === '#F97316') {
      setColor(suggestColor(name))
    }
    // Auto-suggest image from name
    if (!imageUrl) {
      setImageUrl(suggestImageUrl(name))
    }
  }, [name, topic])

  // Auto-fill all suggestions in one shot
  function handleAutoGenerate() {
    if (!name.trim()) return
    setIcon(suggestIcon(name))
    setImageUrl(suggestImageUrl(name))
    setColor(suggestColor(name))
  }

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
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Giao tiếp hàng ngày"
                required
                className="flex-1 px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={handleAutoGenerate}
                disabled={!name.trim()}
                title="Tự động gợi ý icon, ảnh, màu"
                className="px-4 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ✨ Tự động
              </button>
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">Slug</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true) }}
                placeholder="giao-tiep-hang-ngay"
                className="flex-1 px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-mono text-sm outline-none focus:border-primary focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  if (topic) {
                    // Edit mode: reset về slug gốc từ DB
                    setSlug(topic.slug)
                  } else {
                    // Create mode: regenerate với prefix
                    const baseSlug = slugify(name)
                    setSlug(roadmapSlug ? `${roadmapSlug}-${baseSlug}` : baseSlug)
                    setSlugManuallyEdited(false)
                  }
                }}
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

          {/* Image URL */}
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
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+URL'
                  }}
                />
              </div>
            )}
          </div>

          {/* Icon + Color row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Icon</label>
              {/* Icon grid picker */}
              <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto p-2 rounded-xl border-2 border-orange-100 bg-orange-50/30">
                {ICON_OPTIONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    title={iconName}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      icon === iconName
                        ? 'bg-primary text-white shadow-md scale-110'
                        : 'bg-white text-stone-500 hover:bg-orange-100 hover:text-primary border border-stone-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{iconName}</span>
                  </button>
                ))}
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