import { FETCH_PAGE_SIZE } from '../constants'

/**
 * fetchPaginated - Enforces the 1000-row limit safety by using a while loop and .range().
 * This prevents silent truncation of data in large tables (like words or srs records).
 */
// Supabase query builder has complex generics; using unknown here is intentional
// because the caller specifies T via the generic parameter.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseQueryBuilder = { range(from: number, to: number): PromiseLike<{ data: any[] | null; error: { message: string } | null }> }

export async function fetchPaginated<T>(
  queryBuilder: SupabaseQueryBuilder,
  pageSize: number = FETCH_PAGE_SIZE
): Promise<T[]> {
  const results: T[] = []
  let from = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await queryBuilder.range(from, from + pageSize - 1)

    if (error) {
      console.error('[Storage] fetchPaginated error:', error)
      throw error
    }

    const batch: T[] = data ?? []
    results.push(...batch)

    hasMore = batch.length === pageSize
    from += pageSize
  }

  return results
}
