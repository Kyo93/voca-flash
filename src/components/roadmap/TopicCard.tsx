import { Link } from 'react-router-dom'
import { Topic } from '../../lib/types'

interface TopicCardProps {
  topic: Topic
  roadmapId: string
  stats: { total: number, learned: number, mastered: number, percent: number }
  isFeatured?: boolean
  isUpNext?: boolean
  searchQuery?: string
}

import { useTranslation } from 'react-i18next'
import { getTopicTheme } from '../../lib/theme'

export default function TopicCard({
  topic,
  roadmapId,
  stats,
  isFeatured = false,
  isUpNext = false,
  searchQuery = ''
}: TopicCardProps) {
  const { t } = useTranslation()
  const isCompleted = stats.total > 0 && stats.learned >= stats.total
  const isStarted = stats.percent > 0

  const theme = getTopicTheme(topic);

  const commonProps = {
    to: `/study?topic=${topic.slug}&topicId=${topic.id}&roadmapId=${roadmapId}`,
    className: "block transition-all focus:outline-none"
  }

  // --- Variant 1: Featured (Large) ---
  if (isFeatured && !searchQuery) {
    return (
      <Link {...commonProps} className={`${commonProps.className} topic-card md:col-span-2 relative group overflow-hidden rounded-5xl bg-surface-container-highest min-h-[400px] flex items-end shadow-[0_40px_60px_-10px_rgba(113,55,0,0.06)]`}>
        <img 
          alt={topic.name} 
          src={topic.image_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80'} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-on-surface/90 via-on-surface/40 to-transparent"></div>
        <div className="relative p-10 w-full space-y-5">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-primary-fixed">{t('roadmap.card.activeChapter')}</span>
            <h2 className="text-4xl font-bold text-white">{t('roadmap.card.topicPrefix')}: {topic.name}</h2>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[10px] font-bold text-white/90 border border-white/10">
                {t('topics.wordsCount', { count: stats.total })}
              </span>
              {isCompleted && (
                <span className="px-3 py-1 rounded-full bg-green-500/20 backdrop-blur-sm text-[10px] font-bold text-green-400 border border-green-500/20 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  {t('library.card.completed')}
                </span>
              )}
            </div>
            {topic.description && (
              <p className="text-white/70 max-w-md text-lg leading-relaxed line-clamp-2">
                {topic.description}
              </p>
            )}
          </div>
          <button className="bg-linear-to-r from-primary to-primary-container text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-3 w-fit">
            {isStarted ? t('library.card.resume') : t('library.card.start')}
            <span className="material-symbols-outlined">play_circle</span>
          </button>
        </div>
      </Link>
    )
  }

  // --- Variant 2: Up Next (Kinetic/Flashy) ---
  if (isUpNext && !searchQuery) {
    return (
      <Link {...commonProps} className={`${commonProps.className} topic-card relative group overflow-hidden rounded-4xl bg-surface-container-low min-h-[340px] flex flex-col justify-between border-b-4 border-secondary/20 shadow-lg shadow-secondary/5`}>
        <img 
          alt={topic.name} 
          src={topic.image_url || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80'} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-on-surface/90 via-on-surface/40 to-transparent"></div>
        
        <div className="relative p-8 space-y-6 z-10">
          <div className="flex justify-between items-start">
            <span className="bg-secondary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{t('roadmap.card.upNext')}</span>
            <span className="material-symbols-outlined text-white/80">trending_up</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-white">{t('roadmap.card.topicPrefix')}: {topic.name}</h3>
            <span className="inline-block px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm text-[9px] font-bold text-white/80 border border-white/10 uppercase tracking-wider">
              {t('topics.wordsCount', { count: stats.total })}
            </span>
            {topic.description && (
              <p className="text-white/70 leading-relaxed line-clamp-2 text-sm">
                {topic.description}
              </p>
            )}
          </div>
        </div>

        <div className="relative p-8 pt-0 space-y-4 z-10">
          <div className="flex justify-between text-xs font-bold text-white/60">
            <span>{t('roadmap.card.preparation')}</span>
            <span>{stats.percent}%</span>
          </div>
          <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-secondary rounded-full transition-all duration-1000"
              style={{ width: `${stats.percent}%` }}
            ></div>
          </div>
        </div>
      </Link>
    )
  }

  // --- Variant 3: Standard (Pastel/Stitch Style) ---
  return (
    <Link
      {...commonProps}
      className={`${commonProps.className} topic-card rounded-3xl p-6 flex flex-col justify-between group hover:shadow-md transition-all border`}
      style={{ backgroundColor: theme.bg, borderColor: theme.border }}
    >
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-lg bg-white/60 backdrop-blur-sm flex items-center justify-center">
          <span className="material-symbols-outlined" style={{ color: theme.accent }}>
            {topic.icon || 'auto_stories'}
          </span>
        </div>
        {isCompleted ? (
          <span className="material-symbols-outlined text-green-600 bg-green-50 rounded-full p-1 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        ) : (
          <span 
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded opacity-60"
            style={{ backgroundColor: theme.bg, color: theme.text }}
          >
            {t('roadmap.card.locked')}
          </span>
        )}
      </div>
      <div className="mt-6">
        <h4 className="text-xl font-bold mb-1" style={{ color: theme.text }}>{topic.name}</h4>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs opacity-70 line-clamp-1" style={{ color: theme.text }}>{topic.description || t('roadmap.card.defaultTopicDesc')}</p>
          <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest" style={{ color: theme.text }}>
            {t('topics.wordsCount', { count: stats.total })}
          </span>
        </div>
      </div>
    </Link>
  )
}
