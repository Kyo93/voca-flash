import { useState } from 'react'
import type { Topic } from '../../lib/types'

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
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  // Drag-and-drop reorder
  function handleDragStart(e: React.DragEvent, topicId: string) {
    setDraggingId(topicId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, topicId: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (topicId !== draggingId) setDragOverId(topicId)
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!draggingId || draggingId === targetId) { 
      setDraggingId(null)
      setDragOverId(null)
      return 
    }
    const oldIndex = topics.findIndex(t => t.id === draggingId)
    const newIndex = topics.findIndex(t => t.id === targetId)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...topics]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    
    onReorderTopics(reordered)
    setDraggingId(null)
    setDragOverId(null)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDragOverId(null)
  }

  // Determine status badge (DRAFT/PUBLISHED) based on word count
  const getTopicStatus = (topicId: string): 'DRAFT' | 'PUBLISHED' => {
    const total = wordCounts[topicId] ?? 0
    return total > 0 ? 'PUBLISHED' : 'DRAFT'
  }

  return (
    <div className="flex flex-col h-full px-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-on-surface-variant tracking-tight">Chủ đề</h2>
        <button
          onClick={onAddTopic}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-secondary hover:bg-secondary-container/30 text-sm font-bold transition-all"
        >
          <span className="material-symbols-outlined text-base">add_box</span>
          Thêm
        </button>
      </div>

      {/* Uncategorized bucket */}
      <button
        onClick={() => onViewWords(null)}
        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all mb-2 mr-4 ${
          activeTopicId === null
            ? 'bg-surface-container-lowest shadow-[inset_4px_0_0_#944a00]'
            : 'bg-white border border-stone-200 hover:bg-surface-container transition-colors'
        }`}
      >
        <span className="text-lg">📦</span>
        <div className="flex-1 text-left">
          <p className="font-bold text-sm text-secondary">Chưa phân loại</p>
          <p className="text-xs text-stone-400">{uncategorizedCount} từ</p>
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
              Chưa có chủ đề nào.<br />Bấm "Thêm" để tạo.
            </p>
          </div>
        ) : (
          topics.map((topic) => {
            const count = wordCounts[topic.id] ?? 0
            const isActive = activeTopicId === topic.id
            const status = getTopicStatus(topic.id)
            const topicColor = topic.color ?? '#F97316'

            return (
              <div
                key={topic.id}
                onClick={() => onViewWords(topic.id)}
                draggable
                onDragStart={(e) => handleDragStart(e, topic.id)}
                onDragOver={(e) => handleDragOver(e, topic.id)}
                onDrop={(e) => handleDrop(e, topic.id)}
                onDragEnd={handleDragEnd}
                className={`relative group rounded-lg transition-all cursor-pointer select-none ${
                  draggingId === topic.id
                    ? 'opacity-40'
                    : dragOverId === topic.id
                    ? 'border border-primary shadow-md'
                    : isActive
                    ? 'border border-stone-200 shadow-[inset_4px_0_0_#944a00]'
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
                    <p className={`flex-1 font-bold text-sm leading-tight min-w-0 truncate ${isActive ? 'text-primary' : 'text-secondary'}`}>
                      {topic.name}
                    </p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
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
                    <p className="text-[10px] text-stone-400 font-mono mb-1 pl-[calc(0.875rem+0.5rem)] truncate">
                      /{topic.slug}
                    </p>
                  )}

                  {/* Description */}
                  {topic.description && (
                    <p className="text-xs text-stone-400 mb-2 pl-[calc(0.875rem+0.5rem)] line-clamp-1">
                      {topic.description}
                    </p>
                  )}

                  {/* Footer Stats + Actions */}
                  <div className="flex items-center justify-between pl-[calc(0.875rem+0.5rem)]">
                    <span className="text-[10px] font-bold text-stone-500">{count} từ</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onEditTopic(topic)}
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 hover:text-primary hover:bg-orange-50 transition-all"
                        title="Sửa"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteTopic(topic)}
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Xóa"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
