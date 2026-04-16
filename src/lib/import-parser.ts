import Papa from 'papaparse'
import type { RawRow, NormalizedWord } from './types'
import type { Topic } from './types'

// ── Type for parser output ─────────────────────────────────
export type { RawRow, NormalizedWord } from './types'

// ── Constants ──────────────────────────────────────────────
const VALID_POS = ['noun', 'verb', 'adj', 'adv', 'phrase', 'other'] as const
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// ── Column name normalization map ─────────────────────────
// Column aliases: CSV header → DB field
// Header đặt đúng tên như bảng bên dưới → import tự động khớp
const COLUMN_ALIASES: Record<string, string> = {
  // word
  word: 'word', words: 'word',
  // phonetic
  phonetic: 'phonetic',
  // pos
  pos: 'pos', type: 'pos',
  // difficulty
  difficulty: 'difficulty', level: 'difficulty',
  // definition
  definition: 'definition', meaning: 'definition',
  // example EN
  example: 'example',
  // example VI
  example_vi: 'example_vi',
  // image_url
  image_url: 'image_url', image: 'image_url',
  // topics
  topics: 'topics', topic: 'topics',
  // wrong choices
  wrong1: 'wrong1',
  wrong2: 'wrong2',
  wrong3: 'wrong3',
  // misc
  image_position: 'image_position',
}

function normalizeKey(key: string): string {
  return COLUMN_ALIASES[key.toLowerCase().trim()] ?? key.toLowerCase().trim()
}

// ── Parse CSV ─────────────────────────────────────────────
function parseRawValue(val: unknown): string {
  if (val === null || val === undefined) return ''
  if (typeof val === 'number') return String(val)
  return String(val).trim()
}
export function parseCSV(file: File): Promise<RawRow[]> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error('FILE_TOO_LARGE'))
      return
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => normalizeKey(header),
      complete: (results) => {
        if (!results.data || (results.data as unknown[]).length === 0) {
          reject(new Error('EMPTY_FILE'))
          return
        }
        if (results.errors.length > 0) {
          const critical = results.errors.filter(e => e.type === 'Quotes' || e.type === 'FieldMismatch')
          if (critical.length > 0) {
            reject(new Error(`PARSE_ERROR: ${critical[0].message}`))
            return
          }
        }
        // Normalize rows
        const rows = (results.data as Record<string, unknown>[]).map(row => {
          const normalized: Record<string, string> = {}
          for (const [key, val] of Object.entries(row)) {
            const normalizedKey = normalizeKey(key)
            normalized[normalizedKey] = parseRawValue(val)
          }
          return normalized as unknown as RawRow
        })
        resolve(rows)
      },
      error: (err) => reject(new Error(`PARSE_ERROR: ${err.message}`)),
    })
  })
}

// ── Parse Google Sheets URL ────────────────────────────────
export function parseGoogleSheetsUrl(url: string): Promise<RawRow[]> {
  const sheetsIdMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (!sheetsIdMatch) {
    return Promise.reject(new Error('INVALID_SHEETS_URL'))
  }

  // Extract GID from URL (sheet tab ID), default to 0
  const gidMatch = url.match(/gid=(\d+)/)
  const gid = gidMatch ? gidMatch[1] : '0'

  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetsIdMatch[1]}/export?format=csv&gid=${gid}`

  // Must be called from a browser context — rejected synchronously if unavailable
  const fetchAvailable = typeof fetch !== 'undefined'

  if (!fetchAvailable) {
    return Promise.reject(new Error('FETCH_UNAVAILABLE'))
  }

  return fetch(exportUrl, { redirect: 'follow' })
    .then(response => {
      if (!response.ok) {
        if (response.status === 403 || response.status === 404) {
          throw new Error('SHEETS_ACCESS_DENIED')
        }
        throw new Error(`SHEETS_FETCH_FAILED: ${response.status}`)
      }
      return response.text()
    })
    .then(text => {
      // Synchronous overload: Papa.parse(string, ParseConfig)
      const results = Papa.parse<Record<string, unknown>>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => normalizeKey(header),
      })

      if (results.errors.length > 0) {
        const critical = results.errors.filter(e => e.type === 'Quotes' || e.type === 'FieldMismatch')
        if (critical.length > 0) {
          throw new Error(`PARSE_ERROR: ${critical[0].message}`)
        }
      }

      if (!results.data || results.data.length === 0) {
        throw new Error('EMPTY_FILE')
      }

      const rows: RawRow[] = results.data.map(row => {
        const normalized: Record<string, string> = {}
        for (const [key, val] of Object.entries(row)) {
          normalized[normalizeKey(key)] = parseRawValue(val)
        }
        return normalized as unknown as RawRow
      })

      return rows
    })
}

// ── Value mapping ──────────────────────────────────────────
const POS_LABEL_MAP: Record<string, NormalizedWord['pos']> = {
  danh_từ: 'noun', danh_tu: 'noun', noun: 'noun',
  động_từ: 'verb', dong_tu: 'verb', verb: 'verb',
  tính_từ: 'adj', tinh_tu: 'adj', adj: 'adj',
  trạng_từ: 'adv', trang_tu: 'adv', adv: 'adv',
  cụm_từ: 'phrase', cum_tu: 'phrase', phrase: 'phrase',
  khác: 'other',
}

const DIFFICULTY_LABEL_MAP: Record<string, number> = {
  rất_dễ: 1, rat_de: 1, very_easy: 1,
  dễ: 2, de: 2, easy: 2,
  trung_bình: 3, trung_binh: 3, medium: 3, trungbình: 3, trungbinh: 3,
  khó: 4, kho: 4, hard: 4,
  rất_khó: 5, rat_kho: 5, very_hard: 5,
}

// ── Slug Utilities ────────────────────────────────────────────
/** Convert a topic name to a URL-safe slug. */
export function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/**
 * Generate a slug that is unique within existingSlugs.
 * If roadmapSlug is provided, prefix the slug with "roadmapSlug-" to avoid
 * cross-roadmap collisions (e.g., two roadmaps creating "Animals" topic).
 * If base slug is not taken → return it.
 * Otherwise append -1, -2, ... until unique.
 */
export function generateUniqueSlug(
  base: string,
  existingSlugs: Set<string>,
  roadmapSlug?: string,
): string {
  const prefixed = roadmapSlug ? `${roadmapSlug}-${base}` : base
  if (!existingSlugs.has(prefixed)) return prefixed
  let i = 1
  while (existingSlugs.has(`${prefixed}-${i}`)) i++
  return `${prefixed}-${i}`
}

// ── Normalize Row ──────────────────────────────────────────
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

  const topicsRaw = raw.topics ?? ''
  // extracted but resolved later in resolveTopics / processRows
  void topicsRaw

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

// ── Validate Row ───────────────────────────────────────────
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

// ── Resolve Topics ─────────────────────────────────────────
export function resolveTopics(
  topicNames: string[],
  topicMap: Map<string, Topic>
): { topicIds: string[]; unmatched: string[] } {
  const topicIds: string[] = []
  const unmatched: string[] = []

  for (const name of topicNames) {
    const lower = name.toLowerCase()
    // Try exact name match first
    let found: Topic | undefined
    for (const [, topic] of topicMap) {
      if (topic.name.toLowerCase() === lower) {
        found = topic
        break
      }
    }
    // Fallback: try slug match
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

// ── Full Import Pipeline ───────────────────────────────────
export async function parseFile(
  file: File,
  topicMap: Map<string, Topic>
): Promise<{ rows: NormalizedWord[]; unmatchedTopics: string[] }> {
  let rawRows: RawRow[]

  if (!file.name.endsWith('.csv')) {
    throw new Error('UNSUPPORTED_FORMAT')
  }
  rawRows = await parseCSV(file)

  return processRows(rawRows, topicMap)
}

export async function parseSheetsUrl(
  url: string,
  topicMap: Map<string, Topic>
): Promise<{ rows: NormalizedWord[]; unmatchedTopics: string[] }> {
  const rawRows = await parseGoogleSheetsUrl(url)
  return processRows(rawRows, topicMap)
}

// Alias for backward compat
export { parseSheetsUrl as parseSheetsUrlIntoRows }

// ── Process rows ───────────────────────────────────────────
// Returns rows + list of unique topic names for auto-creation.
// NOTE: Does NOT resolve topic IDs here — caller must create topics
// first, then call resolveUnmatchedTopics to populate topicIds.
export function processRows(
  rawRows: RawRow[],
  _topicMap: Map<string, Topic>
): { rows: NormalizedWord[]; unmatchedTopics: string[] } {
  const unmatchedSet = new Set<string>()

  const rows = rawRows.map((raw) => {
    const partial = normalizeRow(raw)
    const { valid, errors } = validateRow(partial)

    // Collect ALL topic names as unmatched — resolve happens after topics are created
    const topicNames = (raw.topics ?? '')
      .split(/[;,]/)
      .map(t => t.trim())
      .filter(t => t.length > 0)

    for (const name of topicNames) unmatchedSet.add(name)

    return {
      ...partial,
      topicIds: [],           // will be resolved by resolveUnmatchedTopics after topics created
      unmatchedTopics: topicNames,
      status: valid ? 'new' : 'invalid',
      validationErrors: errors,
    } as NormalizedWord
  })

  return { rows, unmatchedTopics: [...unmatchedSet] }
}

// ── Re-resolve topic IDs after topics are created ─────────
// Call this after createMissingTopics to patch row.topicIds with new IDs.
export function resolveUnmatchedTopics(
  rows: NormalizedWord[],
  topicMap: Map<string, Topic>
): NormalizedWord[] {
  return rows.map(row => {
    if (row.unmatchedTopics && row.unmatchedTopics.length > 0) {
      const { topicIds } = resolveTopics(row.unmatchedTopics, topicMap)
      return { ...row, topicIds, unmatchedTopics: [] }
    }
    return row
  })
}

// ── Error code → user message ─────────────────────────────
export function parseErrorToMessage(code: string): string {
  const messages: Record<string, string> = {
    FILE_TOO_LARGE: 'admin.import.fileTooLarge',
    EMPTY_FILE: 'admin.import.emptyFile',
    INVALID_SHEETS_URL: 'admin.import.invalidUrl',
    SHEETS_ACCESS_DENIED: 'admin.import.sheetsError',
    SHEETS_FETCH_FAILED: 'admin.import.sheetsError',
    UNSUPPORTED_FORMAT: 'admin.import.invalidFile',
    PARSE_ERROR: 'admin.import.invalidFile',
    READ_ERROR: 'admin.import.invalidFile',
    NO_SHEETS: 'admin.import.invalidFile',
  }
  return messages[code] ?? 'admin.import.invalidFile'
}
