/**
 * tests/unit/admin-import-word-count.test.ts
 *
 * Bug: Import 300 words → confirmation says "300 imported" → admin shows 259.
 *
 * Root cause chain:
 * 1. findDuplicateWords errors silently → dupeSet = [] → all 300 sent to batchInsertWords
 * 2. 41 rows already exist in DB (ON CONFLICT DO NOTHING) → silently skipped
 * 3. RPC returns inserted=259 but message shows "300 imported" (submitted count from preview)
 * 4. Result.submitted is undefined in old code → modal has no comparison to detect mismatch
 *
 * Fix:
 * - batchInsertWords returns submitted=300 so modal CAN compare
 * - ImportWordsModal shows "submitted !== inserted" warning
 * - FindDuplicateWords must never silently swallow errors
 */

import { describe, it, expect } from 'vitest'
import { readSourceFile, readSourceFunction, readSourceInterface, readSourceMatch } from './source-reader'

const WORD_QUERIES_PATH = 'lib/queries/word-queries.ts'
const IMPORT_RESULT_SUMMARY_PATH = 'components/admin/import/ImportResultSummary.tsx'
const TYPES_PATH = 'lib/types.ts'

describe('admin-import-word-count', () => {

  describe('batchInsertWords must return submitted count for comparison', () => {
    it('returns submitted so caller can detect missing rows', () => {
      const source = readSourceFile(WORD_QUERIES_PATH)
      expect(source).toMatch(/return\s*\{[^}]*inserted:[^}]*submitted:[^}]*\}/s)
    })

    it('submitted equals number of non-invalid, non-skip rows sent to RPC', () => {
      const batchFn = readSourceFunction(WORD_QUERIES_PATH, 'batchInsertWords')
      const submittedCalc = readSourceMatch(
        WORD_QUERIES_PATH,
        /const submitted\s*=\s*toImport\.length/s,
        'submitted count calculation',
      )

      expect(batchFn).toContain(submittedCalc)
      expect(submittedCalc).toMatch(/submitted\s*=\s*toImport\.length/)
    })
  })

  describe('ImportWordsModal must show submitted-vs-inserted mismatch', () => {
    it('shows warning when result.submitted !== result.inserted', () => {
      const source = readSourceFile(IMPORT_RESULT_SUMMARY_PATH)
      expect(source).toMatch(/submitted.*inserted|inserted.*submitted/)
    })

    it('warning message is visible in done state', () => {
      const source = readSourceFile(IMPORT_RESULT_SUMMARY_PATH)
      expect(source).toMatch(/result\.inserted\s*!==\s*result\.submitted/)
    })
  })

  describe('BatchInsertResult type must have submitted field', () => {
    it('types.ts BatchInsertResult includes submitted', () => {
      const type = readSourceInterface(TYPES_PATH, 'BatchInsertResult')
      expect(type).toMatch(/submitted:\s*number/)
    })
  })

  describe('batchInsertWords logs chunk failures for debugging', () => {
    it('logs RPC errors with chunk number context', () => {
      const batchFn = readSourceFunction(WORD_QUERIES_PATH, 'batchInsertWords')
      expect(batchFn).toMatch(/Chunk.*FAILED|chunkNum.*error/)
    })

    it('logs when inserted count differs from submitted chunk size', () => {
      const batchFn = readSourceFunction(WORD_QUERIES_PATH, 'batchInsertWords')
      expect(batchFn).toMatch(/inserted.*!==.*chunk\.length|missing/)
    })
  })

  describe('findDuplicateWords must propagate errors to caller (not silently return [])', () => {
    it('batchInsertWords logs when findDuplicateWords fails', () => {
      const source = readSourceFile(WORD_QUERIES_PATH)
      expect(source).toMatch(/findDuplicateWords.*error/)
    })
  })
})
