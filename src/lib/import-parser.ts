import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { RawRow, NormalizedWord } from './types'
import type { Topic } from './types'

// ── Type for parser output ─────────────────────────────────
export type { RawRow, NormalizedWord } from './types'

// ── Constants ──────────────────────────────────────────────
const VALID_POS = ['noun', 'verb', 'adj', 'adv', 'phrase', 'other'] as const
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// ── Column name normalization map ─────────────────────────
// Handles: "Word", "word", "words", "Word ", " WORD " etc.
const COLUMN_ALIASES: Record<string, string> = {
  // Word / từ
  word: 'word', words: 'word', từ: 'word', từ_vựng: 'word',
  // Phonetic
  phonetic: 'phonetic', phonetic_symbol: 'phonetic', pronunciation: 'phonetic',
  phiên_âm: 'phonetic',
  // POS
  pos: 'pos', part_of_speech: 'pos', loại_từ: 'pos', từ_loại: 'pos', type: 'pos', part: 'pos',
  // Difficulty
  difficulty: 'difficulty', level: 'difficulty', độ_khó: 'difficulty', do_kho: 'difficulty',
  // Definition
  definition: 'definition', meaning: 'definition', nghĩa: 'definition',
  dịch: 'definition', translate: 'definition',
  // Example EN
  example: 'example', ví_dụ: 'example', ví_dụ__en: 'example',
  ví_dụ_en: 'example', sentence: 'example', use: 'example',
  ví_dụ__en: 'example',
  // Example VI
  example_vi: 'example_vi', ví_dụ_vi: 'example_vi',
  ví_dụ__vi: 'example_vi', ví_dụ_vietnamese: 'example_vi',
  ví_dụ_vn: 'example_vi',
  // Image URL
  image_url: 'image_url', image: 'image_url', imageurl: 'image_url',
  img: 'image_url', ảnh: 'image_url', ảnh_minh_hoạ: 'image_url',
  ảnh_minh_hoa: 'image_url', image_minh_hoa: 'image_url',
  // Topics
  topics: 'topics', topic: 'topics', chủ_đề: 'topics',
  chude: 'topics', chủ_đề: 'topics', category: 'topics', tags: 'topics',
  chủ_đề: 'topics',
  // Wrong choices
  wrong1: 'wrong1', sai_1: 'wrong1',
  wrong2: 'wrong2', sai_2: 'wrong2',
  wrong3: 'wrong3', sai_3: 'wrong3',
  // Misc
  image_position: 'image_position', focal_point: 'image_position', position: 'image_position',
}

function normalizeKey(key: string): string {
  const k = key.toLowerCase().trim().replace(/\s+/g, '_').replace(/_+$/, '')
  return COLUMN_ALIASES[k] ?? k
}

function parseRawValue(val: unknown): string {
  if (val === null || val === undefined) return ''
  if (typeof val === 'number') return String(val)
  return String(val).trim()
}

// ── Parse CSV ─────────────────────────────────────────────
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

// ── Parse Excel (.xlsx, .xls) ──────────────────────────────
export function parseExcel(file: File): Promise<RawRow[]> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error('FILE_TOO_LARGE'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        if (!data) { reject(new Error('EMPTY_FILE')); return }

        const workbook = XLSX.read(data, { type: 'array', cellDates: true })

        // Use first sheet or pick a sheet with data
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) { reject(new Error('NO_SHEETS')); return }

        const sheet = workbook.Sheets[sheetName]
        const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        if (json.length === 0) { reject(new Error('EMPTY_FILE')); return }

        // Normalize headers
        const headers = Object.keys(json[0])
        const normalizedHeaders = headers.map(h => normalizeKey(h))

        const rows: RawRow[] = json.map((row, _i) => {
          const normalized: Record<string, string> = {}
          headers.forEach((h, idx) => {
            normalized[normalizedHeaders[idx]] = parseRawValue(row[h])
          })
          return normalized as unknown as RawRow
        })

        resolve(rows)
      } catch (err: unknown) {
        reject(new Error(`PARSE_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}`))
      }
    }
    reader.onerror = () => reject(new Error('READ_ERROR'))
    reader.readAsArrayBuffer(file)
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
  danh_từ: 'noun', danh_tu: 'noun',
  động_từ: 'verb', dong_tu: 'verb', động_từ: 'verb',
  tính_từ: 'adj', tinh_tu: 'adj',
  trạng_từ: 'adv', trang_tu: 'adv',
  cụm_từ: 'phrase', cum_tu: 'phrase',
  khác: 'other',
  noun: 'noun', danh: 'noun',
  verb: 'verb', động: 'verb', dong: 'verb',
  adj: 'adj', tính: 'adj', tinh: 'adj',
  adv: 'adv', trạng: 'adv', trang: 'adv',
  phrase: 'phrase', cụm: 'phrase',
}

const DIFFICULTY_LABEL_MAP: Record<string, number> = {
  rất_dễ: 1, rat_de: 1, very_easy: 1,
  dễ: 2, de: 2, easy: 2, dễ: 2,
  trung_bình: 3, trung_binh: 3, medium: 3, trungbình: 3, trungbinh: 3,
  khó: 4, kho: 4, hard: 4, khó: 4,
  rất_khó: 5, rat_kho: 5, very_hard: 5, rấtkhó: 5,
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
    // Try exact match first, then scan
    let found: Topic | undefined
    for (const [, topic] of topicMap) {
      if (topic.name.toLowerCase() === lower) {
        found = topic
        break
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
): Promise<NormalizedWord[]> {
  let rawRows: RawRow[]

  if (file.name.endsWith('.csv')) {
    rawRows = await parseCSV(file)
  } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    rawRows = await parseExcel(file)
  } else {
    throw new Error('UNSUPPORTED_FORMAT')
  }

  return processRows(rawRows, topicMap)
}

export async function parseSheetsUrl(
  url: string,
  topicMap: Map<string, Topic>
): Promise<NormalizedWord[]> {
  const rawRows = await parseGoogleSheetsUrl(url)
  return processRows(rawRows, topicMap)
}

function processRows(rawRows: RawRow[], topicMap: Map<string, Topic>): NormalizedWord[] {
  return rawRows.map((raw, _idx) => {
    const partial = normalizeRow(raw)
    const { valid, errors } = validateRow(partial)

    const topicNames = (raw.topics ?? '')
      .split(/[;,]/)
      .map(t => t.trim())
      .filter(t => t.length > 0)
    const { topicIds, unmatched } = resolveTopics(topicNames, topicMap)

    return {
      ...partial,
      topicIds,
      unmatchedTopics: unmatched,
      status: valid ? 'new' : 'invalid',
      validationErrors: errors,
    } as NormalizedWord
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
