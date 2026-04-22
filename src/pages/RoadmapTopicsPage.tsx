import { useTranslation } from 'react-i18next'
import { useParams, Link, useOutletContext } from 'react-router-dom'
import { useRoadmapTopics } from '../hooks/useRoadmapTopics'
import TopicCard from '../components/roadmap/TopicCard'

export default function RoadmapTopicsPage() {
  const { roadmapSlug } = useParams<{ roadmapSlug: string }>()
  const { searchQuery } = useOutletContext<{ searchQuery: string }>()
  const { t } = useTranslation()

  const {
    roadmap,
    topics: filteredTopics,
    stats,
    loading,
    featuredId,
    upNextId,
    getTopicStats
  } = useRoadmapTopics(roadmapSlug, searchQuery)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
          <p className="text-on-surface-variant font-bold">{t('roadmap.loading')}</p>
        </div>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-6">
        <h2 className="text-3xl font-black text-secondary mb-6 tracking-tight">{t('roadmap.notFound')}</h2>
        <Link to="/library" className="px-8 py-4 primary-gradient text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm">
          {t('roadmapDetail.back')}
        </Link>
      </div>
    )
  }

  const overallPercent = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0

  return (
    <div className="max-w-[1440px] mx-auto px-12 py-10 space-y-16">
      {/* Header Section */}
      <header className="space-y-8">
        <Link to="/library" className="inline-flex items-center gap-2 text-on-surface-variant font-semibold hover:text-primary transition-colors group">
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          {t('common.back')}
        </Link>
        <div className="flex flex-col md:flex-row md:items-end gap-10">
          <div className="w-28 h-28 shrink-0 bg-linear-to-br from-primary to-primary-container rounded-[24px] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(148,74,0,0.3)]">
            <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {roadmap.slug.includes('kids') ? 'child_care' : roadmap.slug.includes('business') ? 'business_center' : 'history_edu'}
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl font-bold editorial-asymmetry leading-none text-on-surface">
              {roadmap.name}
            </h1>
            <div className="flex items-center gap-4 bg-surface-container-low w-fit px-5 py-2.5 rounded-full">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <img 
                    key={i}
                    src={`https://i.pravatar.cc/100?u=${i + 40}`} 
                    className="w-8 h-8 rounded-full border-2 border-surface-container-low" 
                    alt="Scholar" 
                    loading="lazy"
                  />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-secondary-fixed flex items-center justify-center text-[10px] font-bold text-on-secondary-fixed">+2k</div>
              </div>
              <span className="text-sm font-semibold text-on-surface-variant italic">{t('roadmapDetail.social')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mastery Progress Board */}
      <section className="bg-surface-container-lowest rounded-[40px] p-10 shadow-[0_40px_60px_-10px_rgba(113,55,0,0.06)] border border-outline-variant/15">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-12">
          <div className="md:col-span-3">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-outline mb-2 block">{t('roadmapDetail.masteryProgress')}</span>
            <div className="text-7xl font-black tracking-tighter text-primary leading-none">{overallPercent}%</div>
          </div>
          <div className="md:col-span-6 space-y-6">
            <div className="relative h-4 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-[#829460] rounded-full liquid-shine transition-all duration-1000"
                style={{ width: `${overallPercent}%` }}
              ></div>
            </div>
            <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
              {t('roadmapDetail.topLearner')}
            </p>
          </div>
          <div className="md:col-span-3 grid grid-cols-1 gap-4 border-l border-surface-container-high pl-8">
            {/* Total */}
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container text-lg">book</span>
              <div>
                <div className="text-xl font-bold">{stats.total}</div>
                <div className="text-[10px] uppercase tracking-wider text-outline font-bold">{t('roadmapDetail.totalWords')}</div>
              </div>
            </div>
            {/* Learned */}
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
              <div>
                <div className="text-xl font-bold">{stats.learned}</div>
                <div className="text-[10px] uppercase tracking-wider text-outline font-bold">{t('roadmapDetail.learnedWords')}</div>
              </div>
            </div>
            {/* Mastered */}
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#2E7D32] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <div>
                <div className="text-xl font-bold">{stats.mastered}</div>
                <div className="text-[10px] uppercase tracking-wider text-outline font-bold">{t('roadmapDetail.masteredWords')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
        {filteredTopics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            roadmapId={roadmap.id}
            stats={getTopicStats(topic.id)}
            isFeatured={topic.id === featuredId}
            isUpNext={topic.id === upNextId}
            searchQuery={searchQuery}
          />
        ))}
      </section>

      {/* Scholar's Footer */}
      <footer className="bg-surface-container rounded-t-[60px] mt-20 -mx-12">
        <div className="flex flex-col md:flex-row justify-between items-end w-full px-16 py-20 max-w-[1440px] mx-auto gap-12">
          <div className="max-w-md space-y-6">
            <div className="text-xl font-bold text-on-surface">VocaFlash</div>
            <p className="font-headline italic text-lg leading-[1.6] text-on-surface-variant">
              {t('roadmapDetail.footer.quote')}
            </p>
            <p className="text-sm font-semibold text-outline">{t('roadmapDetail.footer.copyright')}</p>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-12 items-end">
            <div className="flex flex-col gap-4 text-right">
              <a className="text-on-surface-variant hover:text-primary transition-colors font-semibold" href="#">{t('roadmapDetail.footer.philosophy')}</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-semibold" href="#">{t('roadmapDetail.footer.research')}</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-semibold" href="#">{t('roadmapDetail.footer.privacy')}</a>
            </div>
            <div className="bg-secondary-container/40 p-10 rounded-[32px] space-y-6 w-full sm:w-[320px]">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-black text-on-secondary-container">{t('roadmapDetail.milestone.title')}</span>
                <h4 className="text-2xl font-bold mt-1 text-on-secondary-container">{t('roadmapDetail.milestone.name')}</h4>
              </div>
              <p className="text-sm text-on-secondary-container/80 leading-relaxed">{t('roadmapDetail.milestone.desc')}</p>
              <button className="w-full bg-secondary text-on-secondary py-4 rounded-full font-bold hover:shadow-lg hover:shadow-secondary/20 transition-all">{t('roadmapDetail.milestone.view')}</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
