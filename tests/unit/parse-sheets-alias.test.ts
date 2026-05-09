import { describe, it, expect } from 'vitest'
import { readSourceFile } from './source-reader'

describe('parseSheetsUrlIntoRows alias removal', () => {
  it('import-parser.ts does not export parseSheetsUrlIntoRows alias', () => {
    expect(readSourceFile('lib/import-parser.ts')).not.toMatch(/export.*parseSheetsUrlIntoRows/)
  })

  it('useImportFlow.ts uses parseSheetsUrl directly', () => {
    const source = readSourceFile('hooks/admin/useImportFlow.ts')
    expect(source).not.toMatch(/parseSheetsUrlIntoRows/)
    expect(source).toMatch(/parseSheetsUrl/)
  })
})
