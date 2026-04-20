import { useEffect, useState } from 'react'
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
import { useRoadmapContext } from '../../contexts/RoadmapContext'
import TopicFormModal from '../../components/admin/TopicFormModal'
import ConfirmDialog from '../../components/ConfirmDialog'
import type { Topic } from '../../lib/types'
import { formatDetailedDate } from '../../lib/utils'

// ── Sortable item ─────────────────────────────────────────────
function SortableItem({
  topic,
  onEdit,
  onDelete,
  roadmapNameMap,
}: {
  topic: Topic
  onEdit: () => void
  onDelete: () => void
  roadmapNameMap: Map<string, string>
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: topic.id })

  void roadmapNameMap // TODO: wire up roadmap name display in topic badge

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div className="flex items-center gap-3">
      {/* ── Color accent bar (left) ── */}
      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ backgroundColor: topic.color ?? '#F97316', minHeight: 56 }}
      />

      {/* ── Icon badge (left of card) ── */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
        style={{ backgroundColor: (topic.color ?? '#F97316') + '18', border: `2px solid ${topic.color ?? '#F97316'}40` }}
      >
        <span className="material-symbols-outlined text-2xl" style={{ color: topic.color ?? '#F97316' }}>
          {topic.icon}
        </span>
      </div>

      {/* ── Card body ── */}
      <div
        ref={setNodeRef}
        style={style}
        className={`flex-1 flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-stone-100 hover:shadow-md transition-all ${
          isDragging ? 'shadow-xl z-10' : ''
        }`}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-stone-300 hover:text-stone-500 active:cursor-grabbing p-1 shrink-0"
          title="Kéo để sắp xếp"
        >
          <span className="material-symbols-outlined text-xl">drag_indicator</span>
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-black text-secondary truncate">{topic.name}</p>
            <span
              className="shrink-0 text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded-lg"
            >
              /{topic.slug}
            </span>
          </div>
          {topic.description && (
            <p className="text-xs text-on-surface-variant truncate mt-0.5">{topic.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            {topic.created_at && (
              <span className="text-[10px] text-stone-400 font-mono">
                +{formatDetailedDate(topic.created_at)}
              </span>
            )}
            {topic.updated_at && topic.updated_at !== topic.created_at && (
              <span className="text-[10px] text-stone-400 font-mono">
                · ↑{formatDetailedDate(topic.updated_at)}
              </span>
            )}
          </div>
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
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function AdminTopicsPage() {
  const { topics, loading, error, fetch, addTopic, editTopic, removeTopic, reorder } =
    useAdminTopics()
  const { selectedRoadmap, roadmaps } = useRoadmapContext()

  const [showModal, setShowModal] = useState(false)
  const [editTopicData, setEditTopicData] = useState<Topic | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null)

  useEffect(() => {
    fetch()
  }, [])

  // Filter topics by selected roadmap
  const roadmapTopics = topics.filter(t => t.roadmap_id === selectedRoadmap?.id)

  // Roadmap name lookup for badge
  const roadmapNameMap = new Map(roadmaps.map(r => [r.id, r.name]))

  async function handleSave(data: {
    name: string
    slug: string
    description: string | null
    image_url: string | null
    icon: string
    color: string
    roadmap_id: string | null
  }) {
    if (editTopicData) {
      const { error: err } = await editTopic(editTopicData.id, {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image_url: data.image_url,
        icon: data.icon,
        color: data.color,
        roadmap_id: data.roadmap_id,
      })
      if (err) { console.error(err); return }
    } else {
      const { error: err } = await addTopic({
        name: data.name,
        slug: data.slug,
        description: data.description,
        image_url: data.image_url,
        icon: data.icon,
        color: data.color,
        roadmap_id: selectedRoadmap?.id ?? null,
        sort_order: roadmapTopics.length,
      })
      if (err) { console.error(err); return }
    }
    setShowModal(false)
    setEditTopicData(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await removeTopic(deleteTarget.id)
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
            {loading ? '...' : `${roadmapTopics.length} chủ đề — kéo thả để sắp xếp`}
            {selectedRoadmap && (
              <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">
                {selectedRoadmap.name}
              </span>
            )}
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

      {loading && roadmapTopics.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <span className="material-symbols-outlined text-5xl text-stone-300 animate-spin">progress_activity</span>
          <p className="text-stone-400">Đang tải...</p>
        </div>
      ) : roadmapTopics.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <span className="material-symbols-outlined text-5xl text-stone-300">folder_open</span>
          <p className="text-stone-400">
            {selectedRoadmap ? `Chưa có chủ đề nào trong "${selectedRoadmap.name}".` : 'Chưa có chủ đề nào.'}
          </p>
          <button
            onClick={() => { setEditTopicData(null); setShowModal(true) }}
            className="mt-2 px-5 py-2 primary-gradient text-white font-bold rounded-xl"
          >
            Thêm chủ đề
          </button>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={roadmapTopics.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {roadmapTopics.map((topic) => (
                <SortableItem
                  key={topic.id}
                  topic={topic}
                  roadmapNameMap={roadmapNameMap}
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
        roadmapId={selectedRoadmap?.id ?? undefined}
        roadmapSlug={selectedRoadmap?.slug ?? undefined}
        lastEditedAt={editTopicData?.updated_at}
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
