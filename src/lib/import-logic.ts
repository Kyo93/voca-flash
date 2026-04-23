import { Topic, NormalizedWord } from './types'
import { DEFAULT_TOPIC_COLOR, generateUniqueSlug, slugify } from './utils'
import { createTopic } from './queries/topic-queries'
import { findDuplicateWords } from './queries/word-queries'
import { resolveUnmatchedTopics } from './import-parser'
import { ImportRow } from '../components/admin/ImportPreviewTable'

/** Defaults áp dụng cho topic được tự tạo trong quá trình import. */
const AUTO_CREATED_TOPIC_DEFAULTS = {
  color: DEFAULT_TOPIC_COLOR,
  /** Đẩy xuống cuối danh sách để admin sắp xếp lại sau. */
  sort_order: 999,
  icon: 'label',
} as const

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
        ...AUTO_CREATED_TOPIC_DEFAULTS,
        roadmap_id: roadmapId,
        description: null,
        image_url: null,
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
    .filter((row: NormalizedWord) => row.status !== 'invalid')
    .map((row: NormalizedWord) => row.word)
  const dupes = await findDuplicateWords(wordTexts)
  const dupeSet = new Set(dupes.map(w => w.toLowerCase()))

  const importRows: ImportRow[] = resolvedRows.map((row: NormalizedWord, idx: number) => ({
    ...row,
    rowIndex: idx + 1,
    status: dupeSet.has(row.word.toLowerCase()) ? 'duplicate' : row.status,
    duplicateAction: dupeSet.has(row.word.toLowerCase()) ? 'skip' : undefined,
  }))

  return { importRows, currentTopicMap }
}
