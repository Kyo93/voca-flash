import { Link } from 'react-router-dom'
import { Topic } from '../../lib/types'

interface TopicCardProps {
  topic: Topic
  roadmapId: string
  stats: { total: number, learned: number, percent: number }
  isFeatured?: boolean
  isUpNext?: boolean
  searchQuery?: string
}

/**
 * TopicCard - A modular card component for Roadmap topics.
 * Supports Three Variants: Featured, UpNext, and Standard.
 */
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
  
  // Asymmetric Aesthetic Style
  const getPastelStyles = (hexColor: string | null) => {
    const color = hexColor || '#D35400'
    return {
      bg: `${color}12`,
      border: `${color}25`,
      accent: color
    }
  }
  const styles = getPastelStyles(topic.color)

  const commonProps = {
    to: `/study?topic=${topic.slug}&topicId=${topic.id}&roadmapId=${roadmapId}`,
    className: "block transition-all focus:outline-none"
  }

  // --- Variant 1: Featured (Large) ---
  if (isFeatured && !searchQuery) {
    return (
      <Link {...commonProps} className={`${commonProps.className} topic-card col-span-12 md:col-span-7 group relative bg-surface p-8 sun-drenched-shadow-lg hover:scale-[1.01] cursor-pointer overflow-hidden border border-surface-container-highest/20 rounded-2xl`}>
        <div className="flex justify-between items-start">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${isCompleted ? 'bg-secondary/10 text-secondary' : 'bg-primary-fixed text-primary'} flex items-center justify-center shadow-inner`}>
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isCompleted ? 'check_circle' : (topic.icon || 'star')}
                </span>
              </div>
              <div>
                {isStarted && !isCompleted && (
                  <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest mb-1 inline-block">ĐANG HỌC</span>
                )}
                <h3 className="text-2xl font-black text-secondary tracking-tight">{topic.name}</h3>
                <p className="text-on-surface-variant mt-1 text-sm font-bold opacity-70">
                  {stats.total} Words • {stats.percent}% mastered
                </p>
              </div>
            </div>
            {topic.description && (
              <p className="text-on-surface-variant max-w-sm leading-relaxed line-clamp-2 mt-4 text-[15px] font-medium italic">
                {topic.description}
              </p>
            )}
            <div className={`inline-flex ${isCompleted ? 'bg-secondary' : 'primary-gradient'} text-on-primary px-8 py-3.5 rounded-2xl font-black text-sm items-center gap-2 group-hover:shadow-xl transition-all active:scale-95 mt-6 uppercase tracking-widest`}>
              <span>{isCompleted ? 'Hoàn thành' : isStarted ? 'Học tiếp (Resume)' : 'Bắt đầu học'}</span>
              {!isCompleted && <span className="material-symbols-outlined font-variation-fill">bolt</span>}
            </div>
          </div>
          <div className="w-56 h-56 relative hidden xl:block select-none pointer-events-none shrink-0 ml-4 group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700"></div>
            <img 
              alt={topic.name} 
              src={topic.image_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80'} 
              className="w-full h-full object-cover rounded-4xl shadow-2xl relative z-10 transform -rotate-3 group-hover:rotate-0 group-hover:scale-105 transition-all duration-700" 
            />
          </div>
        </div>
      </Link>
    )
  }

  // --- Variant 2: Up Next (Kinetic/Flashy) ---
  if (isUpNext && !searchQuery) {
    return (
      <Link {...commonProps} className={`${commonProps.className} topic-card col-span-12 md:col-span-5 relative group overflow-hidden rounded-2xl h-full`}>
        <div className="absolute inset-0 border-gradient-wow z-0"></div>
        <div className="absolute inset-[2px] glass-wow-card rounded-xl z-10 p-8 flex flex-col justify-between transition-all group-hover:bg-surface/60">
          <div className="flex justify-between items-start mb-12">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-4 primary-gradient rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-all duration-500 scale-50 group-hover:scale-100"></div>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl animate-float relative z-10 primary-gradient text-on-primary transition-all duration-500 group-hover:rotate-10">
                  <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 group-hover:scale-0">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {topic.icon || 'palette'}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-110">
                    <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
               <span className="bg-secondary/10 text-secondary text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-sm">UP NEXT</span>
               <span className="text-[10px] font-black text-on-surface-variant/40">TARGET: 100%</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-secondary tracking-tight mb-2">{topic.name}</h3>
            <div className="flex items-center justify-between mb-4">
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest opacity-60">
                {stats.total} Words Progress
              </p>
              <span className="text-sm font-black text-secondary">{stats.percent}%</span>
            </div>
            <div className="h-4 w-full bg-surface-container-low rounded-full overflow-hidden border border-outline-variant/10 shadow-inner p-[2px]">
              <div 
                className="h-full rounded-full transition-all duration-1000 liquid-progress primary-gradient" 
                style={{ width: `${stats.percent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // --- Variant 3: Standard (Pastel) ---
  return (
    <Link 
      {...commonProps} 
      className={`${commonProps.className} topic-card col-span-12 md:col-span-4 rounded-2xl p-6 hover:scale-[1.03] hover:shadow-xl group relative overflow-hidden border border-transparent shadow-sm`}
      style={{ backgroundColor: styles.bg }}
    >
      <div className="flex items-center gap-5 mb-8">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 bg-surface">
          <span className="material-symbols-outlined text-2xl text-secondary">
            {isCompleted ? 'verified' : (topic.icon || 'school')}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="font-black text-secondary text-[16px] tracking-tight leading-none mb-1.5">{topic.name}</h4>
          <div className="flex items-center gap-2">
            <span 
              className="w-1.5 h-1.5 rounded-full" 
              style={{ backgroundColor: styles.accent }}
            ></span>
            <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">
              {stats.total} Từ • {stats.percent}%
            </p>
          </div>
        </div>
      </div>

      {topic.description && (
        <p className="text-xs text-on-surface-variant/80 mb-6 leading-relaxed line-clamp-2 font-medium">
          {topic.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-secondary transition-colors">
            <span className="material-symbols-outlined text-[18px] font-variation-fill">check_circle</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Mastered</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-on-surface-variant group-hover:text-secondary transition-colors">
            <span className="material-symbols-outlined text-[18px] font-variation-fill">bolt</span>
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isStarted ? 'Tiếp tục' : 'Bắt đầu'}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
