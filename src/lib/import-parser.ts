import Papa from 'papaparse'
import type { RawRow, NormalizedWord, Topic } from './types'
import { MAX_FILE_SIZE } from './import-constants'
import { 
  normalizeKey, 
  normalizeParsedRows, 
  normalizeRow, 
  validateRow, 
  resolveTopics 
} from './import-utils'

// Re-export constants and utils for backward compatibility where needed
export { slugify } from './utils'
export type { RawRow, NormalizedWord } from './types'
export { parseErrorToMessage } from './import-constants'

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
        resolve(normalizeParsedRows(results.data as Record<string, unknown>[]))
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

  const gidMatch = url.match(/gid=(\d+)/)
  const gid = gidMatch ? gidMatch[1] : '0'
  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetsIdMatch[1]}/export?format=csv&gid=${gid}`

  if (typeof fetch === 'undefined') {
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

      return normalizeParsedRows(results.data)
    })
}

// ── Full Import Pipeline ───────────────────────────────────
export async function parseFile(
  file: File,
  topicMap: Map<string, Topic>
): Promise<{ rows: NormalizedWord[]; unmatchedTopics: string[] }> {
  if (!file.name.endsWith('.csv')) {
    throw new Error('UNSUPPORTED_FORMAT')
  }
  const rawRows = await parseCSV(file)
  return processRows(rawRows, topicMap)
}

export async function parseSheetsUrl(
  url: string,
  topicMap: Map<string, Topic>
): Promise<{ rows: NormalizedWord[]; unmatchedTopics: string[] }> {
  const rawRows = await parseGoogleSheetsUrl(url)
  return processRows(rawRows, topicMap)
}

// ── Process rows ───────────────────────────────────────────
export function processRows(
  rawRows: RawRow[],
  _topicMap: Map<string, Topic>
): { rows: NormalizedWord[]; unmatchedTopics: string[] } {
  const unmatchedSet = new Set<string>()

  const rows = rawRows.map((raw) => {
    const partial = normalizeRow(raw)
    const { valid, errors } = validateRow(partial)

    const topicNames = (raw.topics ?? '')
      .split(/[;,]/)
      .map(t => t.trim())
      .filter(t => t.length > 0)

    for (const name of topicNames) unmatchedSet.add(name)

    return {
      ...partial,
      topicIds: [],
      unmatchedTopics: topicNames,
      status: valid ? 'new' : 'invalid',
      validationErrors: errors,
    } as NormalizedWord
  })

  return { rows, unmatchedTopics: [...unmatchedSet] }
}

// ── Re-resolve topic IDs after topics are created ─────────
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
