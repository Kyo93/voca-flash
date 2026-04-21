import { Topic, NormalizedWord } from './types'
import { generateUniqueSlug, slugify } from './utils'
import { createTopic } from './queries/topic-queries'
import { findDuplicateWords } from './queries/word-queries'
import { resolveUnmatchedTopics } from './import-parser'
import { ImportRow } from '../components/admin/ImportPreviewTable'

export async function processImportData(
  parsed: { rows: NormalizedWord[]; unmatchedTopics: string[] },
  roadmapId: string,
  roadmapSlug: string | undefined,
  topicMap: Map<string, Topic>
): Promise<{ importRows: ImportRow[]; currentTopicMap: Map<string, Topic> }> {
  // Guard: roadmapId is required
  if (!roadmapId) {
    throw new Error('roadmapId is required')
  }

  // 1. Auto-create missing topics
  let currentTopicMap = topicMap
  if (parsed.unmatchedTopics.length > 0) {
    const newTopicMap = new Map(currentTopicMap)
    const existingSlugs = new Set([...topicMap.values()].map(t => t.slug))
    
    for (const name of parsed.unmatchedTopics) {
      const lowerName = name.toLowerCase()
      if (currentTopicMap.has(lowerName)) continue
      
      const uniqueSlug = generateUniqueSlug(slugify(name), existingSlugs, roadmapSlug)
      existingSlugs.add(uniqueSlug)
      
      const { data, error } = await createTopic({
        name,
        slug: uniqueSlug,
        color: '#f97316',
        sort_order: 999,
        roadmap_id: roadmapId,
        description: null,
        image_url: null,
        icon: 'label',
      })
      
      if (!error && data) {
        newTopicMap.set(lowerName, data as Topic)
      }
    }
    currentTopicMap = newTopicMap
  }

  // 2. Resolve topic IDs
  const resolvedRows = resolveUnmatchedTopics(parsed.rows, currentTopicMap)
  
  // 3. Clear unmatchedTopics from rows for UI
  for (const row of resolvedRows) {
    row.unmatchedTopics = []
  }

  // 4. Check duplicates
  const wordTexts = resolvedRows
    .filter((r: NormalizedWord) => r.status !== 'invalid')
    .map((r: NormalizedWord) => r.word)
  const dupes = await findDuplicateWords(wordTexts)
  const dupeSet = new Set(dupes.map(w => w.toLowerCase()))

  const importRows: ImportRow[] = resolvedRows.map((r: NormalizedWord, idx: number) => ({
    ...r,
    rowIndex: idx + 1,
    status: dupeSet.has(r.word.toLowerCase()) ? 'duplicate' : r.status,
    duplicateAction: dupeSet.has(r.word.toLowerCase()) ? 'skip' : undefined,
  }))

  return { importRows, currentTopicMap }
}
