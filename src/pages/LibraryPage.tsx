import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { loadCards, loadProgress } from '../lib/storage'
import type { Card } from '../lib/srs'

interface TopicInfo {
  id: string
  labelKey: string
  icon: string
  description: string
  color: string
  bgColor: string
  imgUrl: string
  level: string
  levelColor: string
}

const topicInfos: TopicInfo[] = [
  {
    id: 'daily',
    labelKey: 'topics.daily',
    icon: 'chat',
    description: 'Từ vựng giao tiếp hàng ngày cơ bản dành cho người mới bắt đầu.',
    color: 'text-primary',
    bgColor: 'bg-orange-100',
    imgUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80',
    level: 'Cơ bản',
    levelColor: 'bg-primary text-white',
  },
  {
    id: 'travel',
    labelKey: 'topics.travel',
    icon: 'flight',
    description: 'Từ vựng du lịch và đi lại — sân bay, khách sạn, định hướng.',
    color: 'text-tertiary',
    bgColor: 'bg-tertiary-container/30',
    imgUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80',
    level: 'Trung cấp',
    levelColor: 'bg-tertiary text-white',
  },
  {
    id: 'business',
    labelKey: 'topics.business',
    icon: 'business_center',
    description: 'Thuật ngữ kinh doanh, cuộc họp, deadline, email.',
    color: 'text-secondary',
    bgColor: 'bg-secondary-container/30',
    imgUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    level: 'Nâng cao',
    levelColor: 'bg-secondary text-white',
  },
  {
    id: 'technology',
    labelKey: 'topics.technology',
    icon: 'computer',
    description: 'Từ vựng công nghệ, AI, lập trình, internet.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    imgUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
    level: 'Nâng cao',
    levelColor: 'bg-blue-600 text-white',
  },
  {
    id: 'food',
    labelKey: 'topics.food',
    icon: 'restaurant',
    description: 'Từ vựng ẩm thực — nhà hàng, món ăn, nấu ăn.',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    imgUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    level: 'Trung cấp',
    levelColor: 'bg-red-500 text-white',
  },
]

export default function LibraryPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const cards = loadCards()
  const progressMap = loadProgress()

  const filteredTopics = topicInfos.filter((topic) => {
    const label = t(topic.labelKey).toLowerCase()
    return label.includes(search.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-surface" style={{ display: 'grid', gridTemplateColumns: '256px 1fr 280px', gridTemplateAreas: '"sidebar main rightbar"' }}>
      <div style={{ gridArea: 'sidebar', position: 'sticky', top: 0, height: '100vh', zIndex: 50, width: 256 }}>
        <Sidebar />
      </div>

      <main style={{ gridArea: 'main', display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        {/* Top Bar */}
        <header className="h-20 px-10 flex items-center justify-between bg-surface/95 backdrop-blur-md sticky top-0 z-40 border-b border-stone-100 shadow-sm shrink-0">
          <h2 className="text-xl font-black text-on-surface shrink-0">{t('nav.library')}</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-72">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 text-xl">search</span>
              <input
                className="w-full pl-12 pr-4 py-2.5 bg-white border-none rounded-2xl text-sm shadow-sm placeholder:text-stone-300 focus:ring-2 focus:ring-secondary transition-all"
                placeholder={t('nav.searchPlaceholder') || "Tìm bài học..."}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-primary hover:bg-stone-100 transition-all">
                <span className="material-symbols-outlined text-xl">notifications</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 px-10 py-8 overflow-y-auto" style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
          {/* Hero */}
          <div className="mb-12 relative flex items-end justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-secondary font-bold mb-3 block">Thư viện</span>
              <h2 className="text-5xl font-black text-on-surface tracking-tight mb-4">Chọn lộ trình của bạn</h2>
              <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
                Hệ thống học tập của chúng tôi thích nghi với tốc độ và sở thích của bạn.
              </p>
            </div>
          </div>

          {/* Topic Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => {
              const topicCards = cards.filter((c) => c.topic === topic.id)
              const mastered = topicCards.filter(
                (c) => (progressMap.get(c.id)?.repetitions ?? 0) >= 5
              ).length
              const total = topicCards.length
              const pct = total > 0 ? Math.round((mastered / total) * 100) : 0

              return (
                <div
                  key={topic.id}
                  className="group relative bg-surface-container hover:bg-surface-container-lowest p-6 rounded-xl transition-all duration-300 shadow-sm flex flex-col items-start overflow-hidden border border-transparent hover:border-secondary/10"
                >
                  {/* Image */}
                  <div className="w-full h-40 bg-surface-container rounded-lg mb-6 flex items-center justify-center overflow-hidden relative">
                    <img
                      alt={topic.labelKey}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={topic.imgUrl}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-1 rounded mb-3 uppercase tracking-wider ${topic.levelColor}`}>
                    {topic.level}
                  </span>

                  <h3 className="text-xl font-bold mb-2 text-on-surface">{t(topic.labelKey)}</h3>

                  <p className="text-on-surface-variant mb-6 text-xs leading-relaxed line-clamp-3">
                    {topic.description}
                  </p>

                  {/* Progress */}
                  <div className="w-full mb-6">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-on-surface-variant">{pct}% mastered</span>
                      <span className="font-bold text-on-surface">{mastered}/{total} words</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/study?topic=${topic.id}`}
                    className="mt-auto w-full py-3 primary-gradient text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    {mastered > 0 ? 'Tiếp tục' : 'Bắt đầu'}
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Help card */}
          <div className="mt-12 p-8 bg-surface-container-low border border-outline/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">quiz</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-on-surface">Không chắc bắt đầu từ đâu?</h4>
                <p className="text-on-surface-variant text-sm">Chúng tôi sẽ gợi ý lộ trình phù hợp với trình độ của bạn.</p>
              </div>
            </div>
            <button className="px-8 py-3 bg-white text-primary font-bold rounded-xl border-2 border-primary/10 hover:border-primary/30 transition-all active:scale-95 shadow-sm whitespace-nowrap">
              Làm bài đánh giá
            </button>
          </div>
        </div>
      </main>

      {/* Right gutter for balance */}
      <div style={{ gridArea: 'rightbar', width: 280 }} />
    </div>
  )
}
