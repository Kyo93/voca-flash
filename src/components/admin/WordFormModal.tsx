import { useState, useEffect, type FormEvent } from 'react'
import type { Word, Topic } from '../../lib/types'

const POS_OPTIONS = [
  { value: 'noun', label: 'Danh từ' },
  { value: 'verb', label: 'Động từ' },
  { value: 'adj', label: 'Tính từ' },
  { value: 'adv', label: 'Trạng từ' },
  { value: 'phrase', label: 'Cụm từ' },
  { value: 'other', label: 'Khác' },
]

const DIFFICULTY_LABELS = ['Rất dễ', 'Dễ', 'Trung bình', 'Khó', 'Rất khó']

interface Props {
  open: boolean
  word?: Word | null
  topics: Topic[]
  onSave: (word: Omit<Word, 'id' | 'created_at' | 'updated_at'>, wrongChoices: string[]) => Promise<void>
  onClose: () => void
}

export default function WordFormModal({ open, word, topics, onSave, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [wordText, setWordText] = useState('')
  const [phonetic, setPhonetic] = useState('')
  const [pos, setPos] = useState<Word['pos']>('noun')
  const [difficulty, setDifficulty] = useState(3)
  const [definition, setDefinition] = useState('')
  const [example, setExample] = useState('')
  const [exampleVi, setExampleVi] = useState('')
  const [topicId, setTopicId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePosition, setImagePosition] = useState('center')
  const [wrong1, setWrong1] = useState('')
  const [wrong2, setWrong2] = useState('')
  const [wrong3, setWrong3] = useState('')

  useEffect(() => {
    if (word) {
      setWordText(word.word)
      setPhonetic(word.phonetic ?? '')
      setPos(word.pos ?? 'noun')
      setDifficulty(word.difficulty ?? 3)
      setDefinition(word.definition)
      setExample(word.example ?? '')
      setExampleVi(word.example_vi ?? '')
      setTopicId(word.topic_id ?? '')
      setImageUrl(word.image_url ?? '')
      setImagePosition(word.image_position ?? 'center')
    } else {
      setWordText('')
      setPhonetic('')
      setPos('noun')
      setDifficulty(3)
      setDefinition('')
      setExample('')
      setExampleVi('')
      setTopicId(topics[0]?.id ?? '')
      setImageUrl('')
      setImagePosition('center')
    }
    setError(null)
  }, [word, open, topics])

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!wordText.trim() || !definition.trim()) {
      setError('Word và Definition không được trống')
      return
    }

    setLoading(true)
    setError(null)

    const wrongChoices = [wrong1, wrong2, wrong3].filter((c) => c.trim())

    await onSave(
      {
        word: wordText.trim(),
        phonetic: phonetic.trim() || null,
        pos,
        difficulty,
        definition: definition.trim(),
        example: example.trim() || null,
        example_vi: exampleVi.trim() || null,
        topic_id: topicId || null,
        image_url: imageUrl.trim() || null,
        image_position: imagePosition || 'center',
      },
      wrongChoices
    )

    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-orange-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-100 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-xl font-black text-secondary">
              {word ? 'Sửa từ vựng' : 'Thêm từ vựng mới'}
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              {word ? 'Cập nhật thông tin từ vựng' : 'Điền thông tin từ vựng mới'}
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
          {/* Word + Phonetic */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Word *</label>
              <input
                type="text"
                value={wordText}
                onChange={(e) => setWordText(e.target.value)}
                placeholder="hello"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Phonetic</label>
              <input
                type="text"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                placeholder="/həˈloʊ/"
                className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* POS + Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">Từ loại</label>
              <select
                value={pos ?? 'noun'}
                onChange={(e) => setPos(e.target.value as Word['pos'])}
                className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all"
              >
                {POS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">
                Độ khó: <span className="text-primary">{DIFFICULTY_LABELS[difficulty - 1]}</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-stone-400 mt-1">
                <span>Dễ</span><span>Khó</span>
              </div>
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">Chủ đề</label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all"
            >
              <option value="">— Không chọn —</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Definition */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">Definition *</label>
            <textarea
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="Nghĩa của từ..."
              rows={2}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Example EN */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">Ví dụ (EN)</label>
            <input
              type="text"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="Hello, how are you?"
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          {/* Example VI */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">Ví dụ (VI)</label>
            <input
              type="text"
              value={exampleVi}
              onChange={(e) => setExampleVi(e.target.value)}
              placeholder="Xin chào, bạn khỏe không?"
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          {/* Image URL + Focal Point + Preview */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">Ảnh minh họa (URL)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-xxx?w=600&q=80"
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary text-sm outline-none focus:border-primary focus:bg-white transition-all"
            />
            {imageUrl && (
              <div className="mt-3 space-y-3">
                {/* Focal point selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500">Trọng tâm ảnh:</span>
                  {(['top', 'center', 'bottom'] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setImagePosition(pos)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        imagePosition === pos
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {pos === 'top' ? '⬆ Trên' : pos === 'center' ? '⬛ Giữa' : '⬇ Dưới'}
                    </button>
                  ))}
                </div>
                {/* Flashcard simulation (4:3) */}
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Flashcard Preview (4:3)</p>
                  <div className="aspect-[4/3] w-full max-w-[280px] rounded-lg overflow-hidden border border-stone-200 shadow-sm relative">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover transition-all duration-300"
                      style={{ objectPosition: imagePosition }}
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x450?text=Invalid+URL'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-3 text-white text-sm font-bold drop-shadow-lg">
                      {wordText || 'word'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wrong choices */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">
              Đáp án sai (3 lựa chọn cho flashcard)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <input type="text" value={wrong1} onChange={(e) => setWrong1(e.target.value)} placeholder="Sai 1" className="px-4 py-3 rounded-xl border-2 border-stone-200 bg-stone-50 text-secondary font-medium outline-none focus:border-orange-300 focus:bg-white transition-all" />
              <input type="text" value={wrong2} onChange={(e) => setWrong2(e.target.value)} placeholder="Sai 2" className="px-4 py-3 rounded-xl border-2 border-stone-200 bg-stone-50 text-secondary font-medium outline-none focus:border-orange-300 focus:bg-white transition-all" />
              <input type="text" value={wrong3} onChange={(e) => setWrong3(e.target.value)} placeholder="Sai 3" className="px-4 py-3 rounded-xl border-2 border-stone-200 bg-stone-50 text-secondary font-medium outline-none focus:border-orange-300 focus:bg-white transition-all" />
            </div>
            <p className="text-xs text-stone-400 mt-1">Để trống nếu không cần flashcard dạng chọn đáp án</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Actions */}
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
              {loading ? 'Đang lưu...' : word ? 'Lưu thay đổi' : 'Thêm từ vựng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
