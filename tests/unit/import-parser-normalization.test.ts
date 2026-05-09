import { describe, it, expect } from 'vitest'
import { readSourceFunction } from './source-reader'

function readParserFunction(functionName: string) {
  return readSourceFunction('lib/import-parser.ts', functionName)
}

function hasRedundantKeyNormalization(source: string) {
  return source.includes('Object.entries(row)') && source.includes('normalizeKey(key)')
}

describe('import-parser normalization', () => {
  it('parseCSV does not normalize keys after transformHeader already handled them', () => {
    expect(hasRedundantKeyNormalization(readParserFunction('parseCSV'))).toBe(false)
  })

  it('parseGoogleSheetsUrl does not normalize keys after transformHeader already handled them', () => {
    expect(hasRedundantKeyNormalization(readParserFunction('parseGoogleSheetsUrl'))).toBe(false)
  })

  it('parseCSV still normalizes values without re-normalizing keys', () => {
    expect(readParserFunction('parseCSV')).not.toContain('normalizeKey(key)')
  })
})
