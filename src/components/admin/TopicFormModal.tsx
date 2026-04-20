import { useState, useEffect, useMemo, type FormEvent } from 'react'
import type { Topic, Roadmap } from '../../lib/types'
import { slugify } from '../../lib/utils'

// ─── Icon Suggestion Map ──────────────────────────────────────
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
  [['toeic', 'ielts', 'ngoại ngữ', 'language'], 'translate'],
  [['yêu', 'tình yêu', 'love', 'romance'], 'favorite'],
  [['thể thao', 'sport', 'game', 'competition'], 'sports'],
  [['tài chính', 'finance'], 'account_balance'],
]

const ICON_OPTIONS = [
  'chat', 'forum', 'comment', 'translate', 'language', 'text_fields',
  'school', 'auto_stories', 'menu_book', 'library_books', 'science',
  'calculate', 'biotech', 'history_edu', 'psychology', 'tips_and_updates',
  'computer', 'code', 'terminal', 'developer_mode', 'api',
  'cloud', 'storage', 'dns', 'memory', 'smartphone', 'laptop_mac',
  'work', 'business_center', 'handshake', 'analytics', 'trending_up',
  'campaign', 'storefront', 'point_of_sale', 'payments', 'receipt_long',
  'account_balance', 'savings', 'workspace_premium', 'workspace', 'support_agent',
  'fitness_center', 'sports', 'sports_esports', 'pool', 'self_improvement',
  'medical_services', 'vaccines', 'monitor_heart', 'spa', 'favorite_border',
  'home', 'groups', 'family_restroom', 'diversity_3', 'volunteer_activism',
  'emoji_people', 'accessibility_new', 'cruelty_free', 'pets', 'child_care',
  'travel_explore', 'flight', 'hotel', 'beach_access', 'terrain',
  'map', 'explore', 'directions_car', 'two_wheeler', 'sailing',
  'restaurant', 'local_cafe', 'bakery_dining', 'dinner_dining', 'lunch_dining',
  'breakfast_dining', 'kitchen', 'local_bar', 'icecream', 'cake',
  'nature', 'eco', 'forest', 'water_drop', 'waves', 'whatshot',
  'sunny', 'cloud', 'partly_cloudy_day', 'grass', 'potted_plant',
  'palette', 'brush', 'draw', 'photo_camera', 'movie', 'music_note',
  'headphones', 'videocam', 'mic', 'album', 'audiotrack',
  'gavel', 'balance', 'policy', 'real_estate_agent', 'account_box',
  'mood', 'sentiment_satisfied', 'sentiment_very_satisfied', 'mood_bad', 'psychology_alt',
  'lightbulb', 'bulb', 'extension', 'build', 'build_circle', 'settings',
  'bookmark', 'label', 'local_offer', 'discount', 'attach_money', 'paid',
  'push_pin', 'flag', 'stars', 'emoji_events', 'celebration',
  'waving_hand', 'sign_language',
]

const COLOR_PALETTE = [
  // Row 1 — 5 colors
  '#E57E22', '#6B8E23', '#4A5568', '#8B5CF6', '#E74C3C',
  // Row 2 — 5 colors
  '#1ABC9C', '#F1C40F', '#D97706', '#1F2937', '#9CA3AF',
]

function suggestIcon(name: string): string {
  const lower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  for (const [keywords, icon] of ICON_MAP) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) return icon
  }
  return 'label'
}

function suggestImageUrl(name: string): string {
  const seed = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').toLowerCase()
  return `https://picsum.photos/seed/${seed}/800/450`
}

function suggestColor(name: string): string {
  const idx = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % COLOR_PALETTE.length
  return COLOR_PALETTE[idx]
}

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

export default function TopicFormModal({ open, topic, roadmaps, roadmapId: initialRoadmapId, roadmapSlug: initialRoadmapSlug, lastEditedBy, lastEditedAt, onSave, onClose }: Props) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [icon, setIcon] = useState('label')
  const [color, setColor] = useState('#F97316')
  const [roadmapId, setRoadmapId] = useState('')
  const [roadmapSlug, setRoadmapSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Icon picker search state
  const [iconSearch, setIconSearch] = useState('')
  const [iconPickerOpen, setIconPickerOpen] = useState(false)

  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return ICON_OPTIONS
    const q = iconSearch.toLowerCase()
    return ICON_OPTIONS.filter(ic => ic.toLowerCase().includes(q))
  }, [iconSearch])

  // Format "last edited" relative time
  function formatRelativeTime(dateStr: string): string {
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMin = Math.floor(diffMs / 60000)
      if (diffMin < 1) return 'vừa xong'
      if (diffMin < 60) return `${diffMin} phút trước`
      const diffH = Math.floor(diffMin / 60)
      if (diffH < 24) return `${diffH} giờ trước`
      const diffD = Math.floor(diffH / 24)
      return `${diffD} ngày trước`
    } catch {
      return ''
    }
  }

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
  }, [topic, open, roadmapId])

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Tên chủ đề không được trống')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await onSave({
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        icon: icon.trim() || 'label',
        color,
        roadmap_id: roadmapId || null,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-stone-100 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-stone-800 leading-tight">
                {topic ? 'Sửa chủ đề' : 'Thêm chủ đề mới'}
              </h2>
              <p className="text-sm text-stone-400 mt-0.5">
                {topic ? 'Cập nhật thông tin và bản sắc trực quan của chủ đề này' : 'Tạo một chủ đề học tập mới'}
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
                Tên chủ đề
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Quantum Fundamentals"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-stone-200 bg-white text-stone-800 font-medium text-base shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAutoGenerate}
                  disabled={!name.trim()}
                  title="Tự động gợi ý"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-orange-100 text-orange-500 flex items-center justify-center hover:bg-orange-200 transition-all disabled:opacity-30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                </button>
              </div>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Slug
              </label>
              <div className="flex items-center gap-0 rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <span className="pl-4 pr-1 py-3 text-stone-400 font-mono text-sm bg-stone-50 border-r border-stone-100 select-none shrink-0">/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true) }}
                  placeholder="quantum-fundamentals"
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
                  title="Tạo lại slug"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                </button>
              </div>
              {roadmapSlug && (
                <p className="text-[11px] text-stone-400 mt-1.5 font-medium">
                  Auto-prefix <span className="font-mono text-orange-400">{roadmapSlug}-</span> để tránh trùng slug toàn app
                </p>
              )}
            </div>
          </div>

          {/* ── Description — FULL WIDTH ──────────────────── */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Core principles of quantum mechanics including wave-particle duality and uncertainty principles for graduate students."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-medium shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* ── 2-col row: Roadmap + Icon ─────────────────── */}
          <div className="grid grid-cols-2 gap-5">

            {/* Roadmap Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Lộ trình
              </label>
              <select
                value={roadmapId}
                onChange={(e) => setRoadmapId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-medium shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer appearance-none"
              >
                <option value="">— Không gán —</option>
                {roadmaps.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Icon Representation */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Icon Representation
              </label>
              <div className="flex items-center gap-3">
                {/* Circular icon preview */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm"
                  style={{ border: `2px solid ${color}50` }}
                >
                  <span className="material-symbols-outlined text-xl" style={{ color }}>
                    {icon}
                  </span>
                </div>

                {iconPickerOpen ? (
                  <div className="flex-1 border border-stone-200 rounded-xl bg-white overflow-hidden shadow-sm">
                    <div className="p-2 border-b border-stone-100">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-xs text-stone-400">search</span>
                        <input
                          type="text"
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          placeholder="Tìm icon..."
                          className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-stone-100 bg-stone-50 outline-none focus:border-orange-300"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="p-2 max-h-36 overflow-y-auto">
                      {filteredIcons.length === 0 ? (
                        <p className="text-xs text-stone-400 text-center py-3">Không tìm thấy icon</p>
                      ) : (
                        <div className="grid grid-cols-8 gap-1">
                          {filteredIcons.map((iconName) => (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => { setIcon(iconName); setIconPickerOpen(false); setIconSearch('') }}
                              title={iconName}
                              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer hover:bg-stone-50"
                              style={icon === iconName ? { backgroundColor: color + '20', color } : { color: '#6B7280' }}
                            >
                              <span className="material-symbols-outlined text-base">{iconName}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIconPickerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-500 text-sm font-medium hover:bg-stone-50 hover:border-stone-300 transition-all cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-base text-stone-400">grid_view</span>
                    Change Icon
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── 2-col row: Color Palette + Image URL ───────── */}
          <div className="grid grid-cols-2 gap-5">

            {/* Color Palette */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Brand Accent
              </label>
              <div className="rounded-xl border border-stone-200 bg-white shadow-sm p-4">
                {/* Header: label left, hex right */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Color Palette</span>
                  <span className="text-xs font-mono font-medium" style={{ color }}>{color}</span>
                </div>
                {/* Row 1 */}
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {COLOR_PALETTE.slice(0, 5).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      title={c}
                      className="w-8 h-8 rounded-full border-2 transition-all cursor-pointer mx-auto flex items-center justify-center"
                      style={{
                        backgroundColor: c,
                        borderColor: color === c ? 'white' : 'transparent',
                        outline: color === c ? `2px solid ${c}` : '2px solid transparent',
                        boxShadow: color === c ? `0 0 0 1px ${c}80` : 'none',
                      }}
                    />
                  ))}
                </div>
                {/* Row 2 */}
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PALETTE.slice(5, 10).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      title={c}
                      className="w-8 h-8 rounded-full border-2 border-transparent transition-all cursor-pointer mx-auto flex items-center justify-center hover:scale-110"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  {/* Custom color swatch — gray with + */}
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-stone-300 mx-auto flex items-center justify-center bg-stone-100 cursor-pointer">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-6 h-6 rounded-full cursor-pointer border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch-wrapper]:rounded-full"
                      title="Custom color"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Ảnh đại diện
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://picsum.photos/seed/topic-name/800/450"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-600 text-sm shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
              />
              {imageUrl ? (
                <div className="mt-3 rounded-xl overflow-hidden border border-stone-100 aspect-video bg-stone-100">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = 'https://placehold.co/800x450/e2e8f0/9ca3af?text=Invalid+URL'
                    }}
                  />
                </div>
              ) : (
                <div
                  className="mt-3 rounded-xl border-2 border-dashed border-stone-200 aspect-video bg-stone-50 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${color}08, ${color}18)` }}
                >
                  <span className="material-symbols-outlined text-3xl text-stone-300">image</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 shrink-0">
          <div className="flex items-center justify-between">
            {/* Metadata */}
            {(lastEditedBy || lastEditedAt) && (
              <p className="text-xs text-stone-300 italic">
                {lastEditedBy && `Last edited by ${lastEditedBy}`}
                {lastEditedBy && lastEditedAt && ' · '}
                {lastEditedAt && formatRelativeTime(lastEditedAt)}
              </p>
            )}
            {/* Spacer when no metadata */}
            {!lastEditedBy && !lastEditedAt && <span />}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-semibold hover:bg-stone-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="topic-form"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: color }}
              >
                {loading ? 'Đang lưu...' : topic ? 'Save Changes' : 'Create Topic'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
