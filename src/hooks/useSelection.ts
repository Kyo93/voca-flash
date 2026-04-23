import { useCallback, useMemo, useState } from 'react'

/**
 * Set-based selection state cho list các item có `id: string`.
 * Tái sử dụng cho mọi danh sách hỗ trợ multi-select (admin tables, word pools, …).
 *
 * - `toggleAll(visibleIds)`: nếu mọi id trong `visibleIds` đã được chọn → bỏ chọn cả nhóm,
 *   ngược lại thêm tất cả vào selection.
 * - `toggleOne(id)`: bật/tắt một id.
 * - `allSelected(visibleIds)` & `someSelected(visibleIds)`: helper cho header checkbox.
 */
export function useSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const clear = useCallback(() => setSelectedIds(new Set()), [])

  const remove = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback((visibleIds: string[]) => {
    if (visibleIds.length === 0) return
    setSelectedIds((prev) => {
      const everySelected = visibleIds.every((id) => prev.has(id))
      const next = new Set(prev)
      if (everySelected) {
        visibleIds.forEach((id) => next.delete(id))
      } else {
        visibleIds.forEach((id) => next.add(id))
      }
      return next
    })
  }, [])

  const helpers = useMemo(
    () => ({
      allSelected: (visibleIds: string[]) =>
        visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id)),
      someSelected: (visibleIds: string[]) =>
        visibleIds.some((id) => selectedIds.has(id)),
    }),
    [selectedIds],
  )

  return {
    selectedIds,
    setSelectedIds,
    toggleOne,
    toggleAll,
    clear,
    remove,
    ...helpers,
  }
}
