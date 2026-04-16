/**
 * tests/unit/parse-sheets-alias.test.ts
 *
 * RED phase: Xóa alias parseSheetsUrlIntoRows, dùng parseSheetsUrl trực tiếp.
 */

import { describe, it, expect } from 'vitest'

describe('parseSheetsUrlIntoRows alias — RED', () => {
  it('import-parser.ts must NOT export parseSheetsUrlIntoRows alias', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/import-parser.ts',
      'utf-8'
    )
    // After fix: no more "export { parseSheetsUrl as parseSheetsUrlIntoRows }"
    expect(source).not.toMatch(/export.*parseSheetsUrlIntoRows/)
  })

  it('ImportWordsModal.tsx must use parseSheetsUrl (not parseSheetsUrlIntoRows)', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/components/admin/ImportWordsModal.tsx',
      'utf-8'
    )
    // After fix: no reference to parseSheetsUrlIntoRows
    expect(source).not.toMatch(/parseSheetsUrlIntoRows/)
    // And should have parseSheetsUrl in the import block
    expect(source).toMatch(/parseSheetsUrl/)
    expect(source).not.toMatch(/parseSheetsUrlIntoRows/)
  })
})