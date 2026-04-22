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

import { hexToRgba, darkenColor } from '../../lib/utils'

export default function TopicCard({
  topic,
  roadmapId,
  stats,
  isFeatured = false,
  isUpNext = false,
  searchQuery = ''
}: TopicCardProps) {
  const isCompleted = stats.total > 0 && stats.learned >= stats.total
  const isStarted = stats.percent > 0

  // --- Dynamic Theme Engine (Stitch Spec) ---
  const getTopicTheme = (topic: Topic) => {
    // 1. Priority: Use color from topic setup (database)
    if (topic.color && topic.color.startsWith('#')) {
      const baseColor = topic.color;
      return {
        bg: hexToRgba(baseColor, 0.12), // 12% alpha for rich pastel
        text: darkenColor(baseColor, 0.4), // 40% darker for readable editorial text
        accent: baseColor,
        border: hexToRgba(baseColor, 0.1),
        isDynamic: true
      };
    }

    // 2. Fallback: Name-based mapping if color is missing
    const n = topic.name.toLowerCase();
    if (n.includes('marketing')) return { bg: '#E3F2FD', text: '#0D47A1', accent: '#2196F3', border: '#BBDEFB' };
    if (n.includes('sustainability')) return { bg: '#E8F5E9', text: '#1B5E20', accent: '#4CAF50', border: '#C8E6C9' };
    if (n.includes('tech')) return { bg: '#F3E5F5', text: '#4A148C', accent: '#9C27B0', border: '#E1BEE7' };
    if (n.includes('human resources')) return { bg: '#FFF3E0', text: '#E65100', accent: '#FF9800', border: '#FFE0B2' };
    if (n.includes('legal')) return { bg: '#ECEFF1', text: '#263238', accent: '#607D8B', border: '#CFD8DC' };
    if (n.includes('data')) return { bg: '#F0F4C3', text: '#33691E', accent: '#827717', border: '#DCE775' };
    
    return { bg: '#F5F5F5', text: '#424242', accent: '#757575', border: '#EEEEEE' };
  };

  const theme = getTopicTheme(topic);

  const commonProps = {
    to: `/study?topic=${topic.slug}&topicId=${topic.id}&roadmapId=${roadmapId}`,
    className: "block transition-all focus:outline-none"
  }

  // --- Variant 1: Featured (Large) ---
  if (isFeatured && !searchQuery) {
    return (
      <Link {...commonProps} className={`${commonProps.className} topic-card md:col-span-2 relative group overflow-hidden rounded-[48px] bg-surface-container-highest min-h-[400px] flex items-end shadow-[0_40px_60px_-10px_rgba(113,55,0,0.06)]`}>
        <img 
          alt={topic.name} 
          src={topic.image_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80'} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#1E1B17]/90 via-[#1E1B17]/40 to-transparent"></div>
        <div className="relative p-10 w-full space-y-5">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-primary-fixed">Active Chapter</span>
            <h2 className="text-4xl font-bold text-white">Topic: {topic.name}</h2>
            {topic.description && (
              <p className="text-white/70 max-w-md text-lg leading-relaxed line-clamp-2">
                {topic.description}
              </p>
            )}
          </div>
          <button className="bg-linear-to-r from-primary to-primary-container text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-3 w-fit">
            {isStarted ? 'Resume Learning' : 'Start Learning'}
            <span className="material-symbols-outlined">play_circle</span>
          </button>
        </div>
      </Link>
    )
  }

  // --- Variant 2: Up Next (Kinetic/Flashy) ---
  if (isUpNext && !searchQuery) {
    return (
      <Link {...commonProps} className={`${commonProps.className} topic-card bg-surface-container-low rounded-[32px] p-6 flex flex-col justify-between border-b-4 border-secondary/20 shadow-lg shadow-secondary/5`}>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <span className="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Up Next</span>
            <span className="material-symbols-outlined text-secondary">trending_up</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Topic: {topic.name}</h3>
            {topic.description && (
              <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">
                {topic.description}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold text-outline">
            <span>Preparation</span>
            <span>{stats.percent}%</span>
          </div>
          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
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
      className={`${commonProps.className} topic-card rounded-[32px] p-6 flex flex-col justify-between group hover:shadow-md transition-all border`}
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
            Locked
          </span>
        )}
      </div>
      <div className="mt-6">
        <h4 className="text-xl font-bold mb-1" style={{ color: theme.text }}>{topic.name}</h4>
        <p className="text-xs opacity-70" style={{ color: theme.text }}>{topic.description || 'Topic detailed explore'}</p>
      </div>
    </Link>
  )
}
