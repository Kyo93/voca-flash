import { useEffect, useState, type FormEvent } from 'react'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAdminTopics } from '../../hooks/admin/useAdminTopics'
import { getAllRoadmaps } from '../../lib/admin-queries'
import TopicFormModal from '../../components/admin/TopicFormModal'
import ConfirmDialog from '../../components/ConfirmDialog'
import type { Topic, Roadmap } from '../../lib/types'

// ── Sortable item ─────────────────────────────────────────────
function SortableItem({
  topic,
  onEdit,
  onDelete,
}: {
  topic: Topic
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: topic.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-100 hover:shadow-md transition-all ${
        isDragging ? 'shadow-xl z-10' : ''
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-stone-300 hover:text-stone-500 active:cursor-grabbing p-1"
        title="Kéo để sắp xếp"
      >
        <span className="material-symbols-outlined text-xl">drag_indicator</span>
      </button>

      {/* Icon */}
      <div className="text-2xl w-10 text-center shrink-0">{topic.icon}</div>

      {/* Color dot */}
      <div
        className="w-4 h-4 rounded-full shrink-0"
        style={{ backgroundColor: topic.color ?? '#F97316' }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-black text-secondary truncate">{topic.name}</p>
        <p className="text-xs text-stone-400 font-mono truncate">{topic.slug}</p>
      </div>

      {/* Roadmap badge */}
      <div className="shrink-0">
        {topic.roadmap_id ? (
          <span className="text-xs bg-stone-100 text-stone-500 px-2.5 py-1 rounded-lg font-medium">
            Lộ trình
          </span>
        ) : (
          <span className="text-xs text-stone-300">—</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-orange-100 transition-colors cursor-pointer"
          title="Sửa"
        >
          <span className="material-symbols-outlined text-stone-400 text-lg">edit</span>
        </button>
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
          title="Xóa"
        >
          <span className="material-symbols-outlined text-red-400 text-lg">delete</span>
        </button>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function AdminTopicsPage() {
  const { topics, loading, error, fetch, addTopic, editTopic, removeTopic, reorder } =
    useAdminTopics()
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])

  const [showModal, setShowModal] = useState(false)
  const [editTopicData, setEditTopicData] = useState<Topic | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch()
    getAllRoadmaps().then(({ data }) => setRoadmaps((data as Roadmap[]) ?? []))
  }, [])

  async function handleSave(data: {
    name: string
    slug: string
    icon: string
    color: string
    roadmap_id: string | null
  }) {
    if (editTopicData) {
      const { error: err } = await editTopic(editTopicData.id, {
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        color: data.color,
        roadmap_id: data.roadmap_id,
      })
      if (err) { console.error(err); return }
    } else {
      const { error: err } = await addTopic({
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        color: data.color,
        roadmap_id: data.roadmap_id,
        sort_order: topics.length,
      })
      if (err) { console.error(err); return }
    }
    setShowModal(false)
    setEditTopicData(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await removeTopic(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = topics.findIndex((t) => t.id === active.id)
    const newIndex = topics.findIndex((t) => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...topics]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    reorder(reordered.map((t) => t.id))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-secondary">Chủ đề</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {loading ? '...' : `${topics.length} chủ đề — kéo thả để sắp xếp`}
          </p>
        </div>
        <button
          onClick={() => { setEditTopicData(null); setShowModal(true) }}
          className="flex items-center gap-2 px-5 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Thêm chủ đề
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && topics.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <span className="material-symbols-outlined text-5xl text-stone-300 animate-spin">progress_activity</span>
          <p className="text-stone-400">Đang tải...</p>
        </div>
      ) : topics.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <span className="material-symbols-outlined text-5xl text-stone-300">folder_open</span>
          <p className="text-stone-400">Chưa có chủ đề nào. Tạo chủ đề đầu tiên!</p>
          <button
            onClick={() => { setEditTopicData(null); setShowModal(true) }}
            className="mt-2 px-5 py-2 primary-gradient text-white font-bold rounded-xl"
          >
            Thêm chủ đề
          </button>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={topics.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {topics.map((topic) => (
                <SortableItem
                  key={topic.id}
                  topic={topic}
                  onEdit={() => { setEditTopicData(topic); setShowModal(true) }}
                  onDelete={() => setDeleteTarget(topic)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <TopicFormModal
        open={showModal}
        topic={editTopicData}
        roadmaps={roadmaps}
        onSave={handleSave}
        onClose={() => { setShowModal(false); setEditTopicData(null) }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa chủ đề?"
        message={`Xóa "${deleteTarget?.name}"? Từ vựng trong chủ đề này sẽ không bị xóa.`}
        confirmLabel="Xóa"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
