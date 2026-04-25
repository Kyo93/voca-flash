import { useTranslation } from 'react-i18next'
import type { Topic } from '../../lib/types'
import { useDragReorder } from '../../hooks/useDragReorder'
import AdminTopicCard from './AdminTopicCard'

interface TopicPanelProps {
  topics: Topic[]
  wordCounts: Record<string, number>
  uncategorizedCount: number
  activeTopicId: string | null
  onAddTopic: () => void
  onEditTopic: (t: Topic) => void
  onDeleteTopic: (t: Topic) => void
  onViewWords: (topicId: string | null) => void
  onReorderTopics: (topics: Topic[]) => void
}

/**
 * TopicPanel - Left column of the Roadmap Setup Page.
 * Displays a list of topics with status badges, word counts, and drag-and-drop reordering.
 */
export default function TopicPanel({
  topics,
  wordCounts,
  uncategorizedCount,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  onViewWords,
  onReorderTopics,
  activeTopicId,
}: TopicPanelProps) {
  const { t } = useTranslation()
  const { draggingId, dragOverId, handleDragStart, handleDragOver, handleDrop, handleDragEnd } =
    useDragReorder(topics, onReorderTopics)

  // Determine status badge (DRAFT/PUBLISHED) based on word count
  const getTopicStatus = (topicId: string): 'DRAFT' | 'PUBLISHED' => {
    const total = wordCounts[topicId] ?? 0
    return total > 0 ? 'PUBLISHED' : 'DRAFT'
  }

  return (
    <div className="flex flex-col h-full px-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-on-surface-variant tracking-tight">{t('admin.topics.title')}</h2>
        <button
          onClick={onAddTopic}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-secondary hover:bg-secondary-container/30 text-sm font-bold transition-all"
        >
          <span className="material-symbols-outlined text-base">add_box</span>
          {t('admin.topics.add')}
        </button>
      </div>

      {/* Uncategorized bucket */}
      <button
        onClick={() => onViewWords(null)}
        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mb-2 mr-4 ${
          activeTopicId === null
            ? 'bg-surface-container-lowest shadow-[inset_4px_0_0_var(--color-primary-dim)]'
            : 'bg-white border border-stone-200 hover:bg-surface-container transition-colors'
        }`}
      >
        <span className="text-lg">📦</span>
        <div className="flex-1 text-left">
          <p className="font-bold text-sm text-secondary">{t('admin.topics.uncategorized')}</p>
          <p className="text-xs text-stone-400">{t('admin.topics.wordCount', { count: uncategorizedCount })}</p>
        </div>
        {uncategorizedCount > 0 && (
          <span className="bg-stone-100 text-stone-500 text-xs font-bold px-2 py-0.5 rounded-full">
            {uncategorizedCount}
          </span>
        )}
      </button>

      {/* Topics list */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-4">
        {topics.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <span className="material-symbols-outlined text-4xl text-stone-200">folder_open</span>
            <p className="text-stone-400 text-xs text-center">
              {t('admin.topics.emptyTitle')}<br />{t('admin.topics.emptyDesc')}
            </p>
          </div>
        ) : (
          topics.map((topic) => (
            <AdminTopicCard
              key={topic.id}
              topic={topic}
              count={wordCounts[topic.id] ?? 0}
              status={getTopicStatus(topic.id)}
              isActive={activeTopicId === topic.id}
              isDragging={draggingId === topic.id}
              isDragOver={dragOverId === topic.id}
              onClick={() => onViewWords(topic.id)}
              onEdit={() => onEditTopic(topic)}
              onDelete={() => onDeleteTopic(topic)}
              onDragStart={(e) => handleDragStart(e, topic.id)}
              onDragOver={(e) => handleDragOver(e, topic.id)}
              onDrop={(e) => handleDrop(e, topic.id)}
              onDragEnd={handleDragEnd}
            />
          ))
        )}
      </div>
    </div>
  )
}
