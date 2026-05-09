/**
 * Import Utilities — Normalization and Resolution for Word Import
 */

import type { RawRow, NormalizedWord, Topic } from './types'
import { slugify } from './utils'
import { 
  COLUMN_ALIASES, 
  VALID_POS, 
  POS_LABEL_MAP, 
  DIFFICULTY_LABEL_MAP 
} from './import-constants'

export function normalizeKey(key: string): string {
  return COLUMN_ALIASES[key.toLowerCase().trim()] ?? key.toLowerCase().trim()
}

export function parseRawValue(val: unknown): string {
  if (val === null || val === undefined) return ''
  if (typeof val === 'number') return String(val)
  return String(val).trim()
}

export function normalizeParsedRows(parsedData: Record<string, unknown>[]): RawRow[] {
  return parsedData.map(row => {
    const normalized: RawRow = {}
    for (const [key, val] of Object.entries(row)) {
      normalized[key] = parseRawValue(val)
    }
    return normalized
  })
}

export function normalizeRow(raw: RawRow): Partial<NormalizedWord> {
  const word = raw.word?.trim() ?? ''
  const definition = raw.definition?.trim() ?? ''

  // POS: try label map first (Vietnamese labels), then raw value
  const posRaw = raw.pos?.trim().toLowerCase().replace(/\s+/g, '_') ?? 'noun'
  const pos: NormalizedWord['pos'] = POS_LABEL_MAP[posRaw]
    ?? (VALID_POS.includes(posRaw as typeof VALID_POS[number]) ? (posRaw as NormalizedWord['pos']) : 'noun')

  // Difficulty: try label map (Vietnamese), then parse as number
  const diffRaw = raw.difficulty?.trim().toLowerCase().replace(/\s+/g, '_') ?? '3'
  const difficulty = DIFFICULTY_LABEL_MAP[diffRaw]
    ?? (() => {
      const n = parseInt(diffRaw, 10)
      return isNaN(n) ? 3 : Math.max(1, Math.min(5, n))
    })()

  const wrongChoices: string[] = []
  const w1 = raw.wrong1?.trim()
  const w2 = raw.wrong2?.trim()
  const w3 = raw.wrong3?.trim()
  if (w1) wrongChoices.push(w1)
  if (w2) wrongChoices.push(w2)
  if (w3) wrongChoices.push(w3)

  return {
    word,
    phonetic: raw.phonetic?.trim() || null,
    pos,
    difficulty,
    definition,
    example: raw.example?.trim() || null,
    example_vi: raw.example_vi?.trim() || null,
    image_url: raw.image_url?.trim() || null,
    image_position: 'center',
    wrongChoices,
  }
}

export function validateRow(normalized: Partial<NormalizedWord>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!normalized.word || normalized.word.length === 0) {
    errors.push('missing_word')
  }
  if (!normalized.definition || normalized.definition.length === 0) {
    errors.push('missing_definition')
  }
  if (normalized.word && normalized.word.length > 500) {
    errors.push('word_too_long')
  }
  if (normalized.definition && normalized.definition.length > 5000) {
    errors.push('definition_too_long')
  }

  return { valid: errors.length === 0, errors }
}

export function resolveTopics(
  topicNames: string[],
  topicMap: Map<string, Topic>
): { topicIds: string[]; unmatched: string[] } {
  const topicIds: string[] = []
  const unmatched: string[] = []

  for (const name of topicNames) {
    const lower = name.toLowerCase()
    let found: Topic | undefined
    for (const [, topic] of topicMap) {
      if (topic.name.toLowerCase() === lower) {
        found = topic
        break
      }
    }
    if (!found) {
      const slugAttempt = slugify(name)
      for (const [, topic] of topicMap) {
        if (topic.slug === slugAttempt) {
          found = topic
          break
        }
      }
    }
    if (found) {
      topicIds.push(found.id)
    } else {
      unmatched.push(name)
    }
  }

  return { topicIds, unmatched }
}
