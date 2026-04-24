import { useState } from 'react'

/**
 * Generic drag-to-reorder hook for HTML5 drag events. Calls `onReorder`
 * with the new array once the user drops onto a different item id.
 *
 * Originally extracted from TopicPanel — could be reused for any
 * draggable list keyed by stable string id.
 */
export function useDragReorder<T extends { id: string }>(
  items: T[],
  onReorder: (next: T[]) => void,
) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (id !== draggingId) setDragOverId(id)
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null)
      setDragOverId(null)
      return
    }
    const oldIndex = items.findIndex((it) => it.id === draggingId)
    const newIndex = items.findIndex((it) => it.id === targetId)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...items]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    onReorder(reordered)
    setDraggingId(null)
    setDragOverId(null)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDragOverId(null)
  }

  return { draggingId, dragOverId, handleDragStart, handleDragOver, handleDrop, handleDragEnd }
}
