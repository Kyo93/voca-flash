import { supabase } from '../supabase'

/** Tags */
export async function getAllTags(): Promise<string[]> {
  const { data, error } = await supabase
    .from('words')
    .select('tags')
    .not('tags', 'is', null)
    .or('tags.ne.{}')

  if (error || !data) return []

  const set = new Set<string>()
  for (const row of data as { tags: string[] }[]) {
    for (const tag of row.tags) {
      set.add(tag)
    }
  }
  return [...set].sort()
}
