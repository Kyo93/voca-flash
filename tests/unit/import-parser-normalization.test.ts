/**
 * tests/unit/import-parser-normalization.test.ts
 *
 * RED: import-parser.ts normalizeKey đã được gọi 2 lần:
 *   1. qua transformHeader trong Papa.parse
 *   2. lại trong vòng for loop sau khi parse
 *
 * Fix: bỏ vòng for loop thứ 2 — key đã được normalize rồi qua transformHeader.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const PARSER_PATH = resolve(
  'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash',
  'src/lib/import-parser.ts'
)

describe('import-parser normalization — no redundant loop', () => {

  it('parseCSV must NOT normalize keys twice (transformHeader already handles it)', async () => {
    const source = readFileSync(PARSER_PATH, 'utf-8')
    // After fix: không còn vòng for normalize lần 2 trong parseCSV
    // parseCSV body should NOT have Object.entries(row) + normalizeKey inside a for loop
    // Check for the specific redundant pattern:
    // for (const [key, val] of Object.entries(row)) { ... normalizeKey(key) ... }
    // This is inside parseCSV's complete callback
    const parseCSVMatch = source.match(/function parseCSV[\s\S]*?(?=\nexport|$)/)
    if (!parseCSVMatch) return

    const parseCSVBody = parseCSVMatch[0]
    // The redundant loop uses normalizeKey on the key inside Object.entries iteration
    const hasRedundantLoop =
      parseCSVBody.includes('Object.entries(row)') &&
      parseCSVBody.includes('normalizeKey(key)')
    expect(hasRedundantLoop).toBe(false)
  })

  it('parseGoogleSheetsUrl must NOT normalize keys twice (transformHeader already handles it)', async () => {
    const source = readFileSync(PARSER_PATH, 'utf-8')
    const sheetsMatch = source.match(/function parseGoogleSheetsUrl[\s\S]*?(?=\nexport|$)/)
    if (!sheetsMatch) return

    const sheetsBody = sheetsMatch[0]
    const hasRedundantLoop =
      sheetsBody.includes('Object.entries(row)') &&
      sheetsBody.includes('normalizeKey(key)')
    expect(hasRedundantLoop).toBe(false)
  })

  it('after fix: parseCSV should use normalized keys directly from Papa results', async () => {
    const source = readFileSync(PARSER_PATH, 'utf-8')
    const parseCSVMatch = source.match(/function parseCSV[\s\S]*?(?=\nexport|$)/)
    if (!parseCSVMatch) return

    const parseCSVBody = parseCSVMatch[0]
    // Should have parseRawValue called, but key should NOT go through normalizeKey
    // parseRawValue is fine — it's for the value, not the key
    // The fix: val = parseRawValue(val) without normalizeKey(key)
    const stillNormalizesKey =
      parseCSVBody.includes('normalizeKey(key)')
    expect(stillNormalizesKey).toBe(false)
  })
})