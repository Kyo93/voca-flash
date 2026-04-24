import { useCallback, useState } from 'react'

/**
 * Generic admin CRUD state container.
 *
 * Each of `useAdminWords` / `useAdminTopics` / `useAdminRoadmaps` previously
 * duplicated the same shape: `items`, `loading`, `error`, a `fetch()` that
 * swallows errors into `error`, and mutations that optionally call `fetch()`.
 *
 * This hook factors out that boilerplate while keeping the specific hooks
 * free to add domain-specific methods (choices, reorder, bulk assign) on top.
 *
 * Usage:
 *   const { items, loading, error, fetchItems, setItems, setError } =
 *     useAdminResource<Topic, []>({ load: () => getAllTopics() })
 */
export interface AdminResourceLoader<T, Args extends unknown[]> {
  load: (...args: Args) => Promise<{ data: unknown; error: { message: string } | null }>
  /**
   * Optional mapper applied to the raw data array before storing in state.
   * Used by `useAdminRoadmaps` to flatten a `topics:[{count}]` relation into
   * a scalar `topic_count`.
   */
  mapData?: (data: unknown) => T[]
}

export function useAdminResource<T, Args extends unknown[] = []>(
  loader: AdminResourceLoader<T, Args>,
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(
    async (...args: Args) => {
      setLoading(true)
      setError(null)
      const { data, error: err } = await loader.load(...args)
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      const mapped = loader.mapData ? loader.mapData(data) : ((data as T[]) ?? [])
      setItems(mapped)
      setLoading(false)
    },
    // The loader is supplied by the caller and typically stable across renders
    // (module-level query functions). We intentionally omit it from deps to
    // match the prior per-hook `fetch` behavior (callers called it manually).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  /**
   * Helper used by wrapper hooks for mutations that return `{ error }` from
   * a Supabase call and optionally trigger a refetch on success.
   */
  const runMutation = useCallback(
    async <R,>(
      op: () => Promise<{ error: { message: string } | null; data?: R }>,
      opts?: { refetch?: () => Promise<void> | void },
    ): Promise<{ error: string | null; data?: R }> => {
      const { error: err, data } = await op()
      if (err) return { error: err.message }
      if (opts?.refetch) await opts.refetch()
      return { error: null, data }
    },
    [],
  )

  return { items, setItems, loading, error, setError, fetchItems, runMutation }
}
