import { useTranslation } from 'react-i18next'
import type { Topic } from '../../lib/types'
import { DEFAULT_TOPIC_COLOR } from '../../lib/utils'

interface AdminTopicCardProps {
  topic: Topic
  count: number
  status: 'DRAFT' | 'PUBLISHED'
  isActive: boolean
  isDragging: boolean
  isDragOver: boolean
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onDragEnd: (e: React.DragEvent) => void
}

/**
 * Single draggable topic card rendered inside TopicPanel. Owns its own
 * hover/active/drag visual states; parent provides drag handlers via
 * `useDragReorder`.
 */
export default function AdminTopicCard({
  topic,
  count,
  status,
  isActive,
  isDragging,
  isDragOver,
  onClick,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: AdminTopicCardProps) {
  const { t } = useTranslation()
  const topicColor = topic.color ?? DEFAULT_TOPIC_COLOR

  return (
    <div
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`relative group rounded-lg transition-all cursor-pointer select-none ${
        isDragging
          ? 'opacity-40'
          : isDragOver
            ? 'border border-primary shadow-md'
            : isActive
              ? 'border border-stone-200 shadow-[inset_4px_0_0_var(--color-primary-dim)]'
              : 'border border-stone-200 hover:bg-surface-container'
      }`}
      style={{ backgroundColor: `${topicColor}1A` }}
    >
      <div className="p-3">
        {/* Top row */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className="material-symbols-outlined text-base shrink-0"
            style={{ color: topicColor }}
          >
            {topic.icon}
          </span>
          <span className="material-symbols-outlined text-stone-300 text-base cursor-grab shrink-0">drag_indicator</span>
          <p className={`flex-1 font-medium text-sm leading-tight min-w-0 truncate ${isActive ? 'text-primary' : 'text-secondary'}`}>
            {topic.name}
          </p>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider shrink-0 ${
              status === 'PUBLISHED'
                ? 'bg-green-100 text-green-700'
                : 'bg-stone-200 text-stone-600'
            }`}
          >
            {status}
          </span>
        </div>

        {/* Slug */}
        {topic.slug && (
          <p className="text-[10px] text-stone-400 font-mono mb-1 pl-5.5 truncate">
            /{topic.slug}
          </p>
        )}

        {/* Description */}
        {topic.description && (
          <p className="text-xs text-stone-400 mb-2 pl-5.5 line-clamp-1">
            {topic.description}
          </p>
        )}

        {/* Footer Stats + Actions */}
        <div className="flex items-center justify-between pl-5.5">
          <span className="text-[10px] font-medium text-stone-500">{t('admin.topics.wordCount', { count })}</span>
          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onEdit}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 hover:text-primary hover:bg-orange-50 transition-all"
              title={t('admin.topics.edit')}
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all"
              title={t('admin.topics.delete')}
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
