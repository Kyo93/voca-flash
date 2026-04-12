import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchUserVocabulary } from '../lib/supabase-storage'
import { MasteryWord } from '../lib/types'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'

type FilterType = 'all' | 'due' | 'weak' | 'orphaned' | 'mastered'

export default function MasteryPage() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [words, setWords] = useState<MasteryWord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const dateLocale = i18n.language === 'vi' ? vi : enUS

  useEffect(() => {
    async function loadData() {
      if (!user) return
      setLoading(true)
      try {
        const data = await fetchUserVocabulary(user.id)
        setWords(data)
      } catch (err) {
        console.error('Failed to load mastery data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  // Stats calculation
  const stats = useMemo(() => {
    const total = words.length
    const mastered = words.filter(w => w.mastered).length
    const orphaned = words.filter(w => w.is_orphaned).length
    const now = new Date()
    const due = words.filter(w => w.next_review_at && new Date(w.next_review_at) <= now).length
    const weak = words.filter(w => w.lapse_count > 2).length
    const learning = words.filter(w => !w.mastered).length
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const newlyLearned = words.filter(w => (new Date(w.first_encountered)) >= today).length
    
    return { total, mastered, orphaned, due, weak, learning, newlyLearned }
  }, [words])

  // Filter & Search logic
  const filteredWords = useMemo(() => {
    return words.filter(w => {
      const matchesSearch = w.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           w.definition.toLowerCase().includes(searchQuery.toLowerCase())
      
      const now = new Date()
      const isDue = w.next_review_at && new Date(w.next_review_at) <= now
      
      switch (activeFilter) {
        case 'due': return matchesSearch && isDue
        case 'weak': return matchesSearch && w.lapse_count > 2
        case 'orphaned': return matchesSearch && w.is_orphaned
        case 'mastered': return matchesSearch && w.mastered
        default: return matchesSearch
      }
    })
  }, [words, searchQuery, activeFilter])

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredWords.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredWords.map(w => w.word_id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleStartFreeStudy = () => {
    const selectedWords = words.filter(w => selectedIds.has(w.word_id))
    navigate('/free-study', { state: { words: selectedWords } })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Đang mở kho lưu trữ...</p>
      </div>
    )
  }

  return (
    <div className="px-10 py-8 max-w-7xl mx-auto w-full">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-secondary tracking-tight">Kho Từ Vựng</h1>
          <p className="text-stone-500 font-medium max-w-lg">
            Quản lý toàn bộ {stats.total} từ bạn đã học. Ôn tập tự do bất cứ khi nào bạn muốn.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text"
              placeholder={t('nav.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white border border-stone-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full md:w-80 font-bold text-sm"
            />
          </div>
          
          <button 
            disabled={selectedIds.size === 0}
            onClick={handleStartFreeStudy}
            className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-3 transition-all shadow-lg active:scale-95 ${
              selectedIds.size > 0 
                ? 'bg-primary text-white shadow-primary/20 cursor-pointer' 
                : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span className="material-symbols-outlined font-variation-fill">bolt</span>
            ÔN TẬP TỰ DO ({selectedIds.size})
          </button>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {[
          { label: 'Đang học', value: stats.learning, icon: 'school', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Mới hôm nay', value: stats.newlyLearned, icon: 'new_releases', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Đã thuộc', value: stats.mastered, icon: 'military_tech', color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Đến hạn', value: stats.due, icon: 'history_toggle_off', color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Mồ côi', value: stats.orphaned, icon: 'broken_image', color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Yếu', value: stats.weak, icon: 'trending_down', color: 'text-purple-500', bg: 'bg-purple-50' }
        ].map(s => (
          <div key={s.label} className="p-4 bg-white rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4 group hover:border-primary/20 transition-all">
            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined font-variation-fill">{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-black text-secondary leading-none">{s.value}</p>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {(['all', 'due', 'weak', 'orphaned', 'mastered'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
              activeFilter === f 
                ? 'bg-secondary text-white shadow-md' 
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {f === 'all' ? 'Tất cả' : f === 'due' ? 'Đến hạn' : f === 'weak' ? 'Từ còn yếu' : f === 'orphaned' ? 'Từ mồ côi' : 'Đã thuộc'}
          </button>
        ))}
      </div>

      {/* Word Table */}
      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden mb-12">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50">
                <th className="py-5 px-6 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === filteredWords.length && filteredWords.length > 0}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded-lg border-stone-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                  />
                </th>
                <th className="py-5 px-2 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Từ vựng</th>
                <th className="py-5 px-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] hidden lg:table-cell">Chủ đề</th>
                <th className="py-5 px-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Sức mạnh</th>
                <th className="py-5 px-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] text-right">Ôn tập tiếp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredWords.map(w => (
                <CardRow 
                  key={w.word_id} 
                  word={w} 
                  isSelected={selectedIds.has(w.word_id)}
                  onSelect={() => toggleSelect(w.word_id)}
                  isExpanded={expandedId === w.word_id}
                  onToggleExpand={() => setExpandedId(expandedId === w.word_id ? null : w.word_id)}
                  locale={dateLocale}
                />
              ))}
              {filteredWords.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <span className="material-symbols-outlined text-stone-200 text-6xl mb-4">folder_open</span>
                    <p className="text-stone-400 font-bold">Không tìm thấy từ vựng nào phù hợp.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function CardRow({ 
  word, 
  isSelected, 
  onSelect, 
  isExpanded, 
  onToggleExpand,
  locale
}: { 
  word: MasteryWord, 
  isSelected: boolean, 
  onSelect: () => void,
  isExpanded: boolean,
  onToggleExpand: () => void,
  locale: any
}) {
  const nextReviewDate = word.next_review_at ? new Date(word.next_review_at) : null
  const isDue = nextReviewDate && nextReviewDate <= new Date()
  
  // Ease factor bar color
  const strengthColor = word.ease_factor >= 2.5 ? 'bg-green-500' : word.ease_factor >= 2.0 ? 'bg-orange-400' : 'bg-red-500'
  const strengthPercent = Math.min(100, (word.ease_factor / 3) * 100)

  return (
    <>
      <tr 
        className={`group hover:bg-stone-50/50 transition-colors cursor-pointer ${isExpanded ? 'bg-stone-50' : ''}`}
        onClick={onToggleExpand}
      >
        <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={onSelect}
            className="w-5 h-5 rounded-lg border-stone-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
          />
        </td>
        <td className="py-4 px-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-secondary group-hover:text-primary transition-colors">{word.word}</span>
              {word.phonetic && <span className="text-xs text-stone-400 font-medium">{word.phonetic}</span>}
              <span className={`material-symbols-outlined text-stone-300 text-sm transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
            </div>
            <span className="text-xs text-stone-500 line-clamp-1 group-hover:line-clamp-none transition-all mr-4">{word.definition}</span>
          </div>
        </td>
        <td className="py-4 px-6 hidden lg:table-cell">
          {word.is_orphaned ? (
            <span className="inline-flex px-2 px-1.5 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-md border border-red-100">Mồ côi</span>
          ) : (
            <span className="inline-flex px-2 px-1.5 bg-stone-100 text-stone-500 text-[10px] font-black uppercase tracking-widest rounded-md">{word.topic_name}</span>
          )}
        </td>
        <td className="py-4 px-6">
          <div className="flex flex-col gap-1.5">
            <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${strengthColor} transition-all duration-1000`} 
                style={{ width: `${strengthPercent}%` }}
              />
            </div>
            <p className="text-[10px] font-black text-stone-400 uppercase">EF: {word.ease_factor.toFixed(2)}</p>
          </div>
        </td>
        <td className="py-4 px-6 text-right">
          <div className="flex flex-col items-end">
            <span className={`text-[13px] font-bold ${isDue ? 'text-primary' : 'text-secondary'}`}>
              {nextReviewDate ? format(nextReviewDate, 'dd/MM/yyyy', { locale }) : '--'}
            </span>
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
              {isDue ? 'Cần ôn ngay' : 'Sắp tới'}
            </span>
          </div>
        </td>
      </tr>
      
      {/* Expanded Row: Example sentence */}
      {isExpanded && (
        <tr className="bg-stone-50 border-t border-stone-100">
          <td />
          <td colSpan={4} className="py-6 px-2 pr-6">
            <div className="flex gap-6 animate-in slide-in-from-top-2 duration-300">
              {word.image_url && (
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-stone-200">
                  <img src={word.image_url} alt={word.word} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-4 flex-1">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Ngữ cảnh sử dụng</p>
                  <div className="space-y-2">
                    <p className="text-secondary font-semibold leading-relaxed text-sm">
                      {word.example ? `"${word.example}"` : 'Chưa có ví dụ.'}
                    </p>
                    {word.example_vi && (
                      <p className="text-stone-400 font-medium text-xs">
                        {word.example_vi}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-8 pt-4 border-t border-stone-200/50">
                  <div>
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Đã gặp lần đầu</p>
                    <p className="text-xs font-bold text-secondary">{format(new Date(word.first_encountered), 'dd MMMM, yyyy', { locale })}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Lần học cuối</p>
                    <p className="text-xs font-bold text-secondary">
                      {word.last_reviewed ? format(new Date(word.last_reviewed), 'dd MMMM', { locale }) : 'Chưa ôn tập'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Tần suất sai</p>
                    <p className="text-xs font-bold text-red-500">{word.lapse_count} lần</p>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
