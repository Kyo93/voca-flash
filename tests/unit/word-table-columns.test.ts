/**
 * RED TESTS — Admin Words Table Column Restructure
 * ================================================
 * Current: TỪ | CHỦ ĐỀ | LOẠI | ĐỘ KHÓ | NGHĨA | HÀNH ĐỘNG
 * Target:  TỪ | LOẠI | ĐỘ KHÓ | NGHĨA | VÍ DỤ | DỊCH | TAGS | HÀNH ĐỘNG
 *
 * Changes:
 *  - Remove: CHỦ ĐỀ (redundant — can see in detail screen)
 *  - Add:    VÍ DỤ  (word.example — contextual usage)
 *  - Add:    DỊCH   (word.example_vi — Vietnamese translation)
 *  - Move:   TAGS    → last column before HÀNH ĐỘNG
 *
 * Run: npm test -- tests/unit/word-table-columns.test.ts
 */

import { describe, it, expect } from 'vitest'
import * as path from 'path'
import * as fs from 'fs'

const SRC = path.resolve(__dirname, '../../src')

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8')
}

function findThead(source: string): string {
  const idx = source.indexOf('<thead>')
  expect(idx).toBeGreaterThan(-1)
  return source.substring(idx, idx + 2500)
}

function findWordRow(source: string): string {
  // Find the actual <motion.tr> row inside paginated.map
  const idx = source.indexOf('<motion.tr')
  expect(idx).toBeGreaterThan(-1)
  return source.substring(idx, idx + 2500)
}

describe('Admin words table — correct columns', () => {
  it('must NOT have CHỦ ĐỀ column (removed — can view in detail screen)', () => {
    const source = readFile('components/admin/words/WordsTable.tsx')
    const thead = findThead(source)
    expect(thead).not.toContain('CHỦ ĐỀ')
    expect(thead).not.toContain('Chủ đề')
  })

  it('must have VÍ DỤ column (word.example — contextual usage)', () => {
    const source = readFile('components/admin/words/WordsTable.tsx')
    const thead = findThead(source)
    expect(thead.toLowerCase()).toContain('ví dụ')
  })

  it('must have DỊCH column (word.example_vi — Vietnamese translation)', () => {
    const source = readFile('components/admin/words/WordsTable.tsx')
    const thead = findThead(source)
    expect(thead.toLowerCase()).toContain('dịch')
  })

  it('must have TAGS column before HÀNH ĐỘNG (in thead, not in filter dropdown)', () => {
    const source = readFile('components/admin/words/WordsTable.tsx')
    const thead = findThead(source)
    // Must find TAGS and HÀNH ĐỘNG as actual <th> elements in thead
    // Use regex anchored to <th> tags to avoid matching "Tất cả chủ đề" dropdown
    expect(thead).toMatch(/<th[^>]*>\s*Tags\s*<\/th>/)
    // HÀNH ĐỘNG must also be a <th>
    expect(thead).toMatch(/Hành động/)
    // Tags <th> must appear before Hành động <th>
    const tagsIdx = thead.indexOf('Tags')
    const actionsIdx = thead.indexOf('Hành động')
    expect(tagsIdx).toBeGreaterThan(-1)
    expect(actionsIdx).toBeGreaterThan(-1)
    expect(tagsIdx).toBeLessThan(actionsIdx)
  })

  it('table body must render word.example as Ví Dụ cell', () => {
    const source = readFile('components/admin/words/WordsTable.tsx')
    const rows = findWordRow(source)
    // Must render w.example in a cell
    expect(rows).toMatch(/w\.example/)
  })

  it('table body must render word.example_vi as Dịch cell', () => {
    const source = readFile('components/admin/words/WordsTable.tsx')
    const rows = findWordRow(source)
    // Must render w.example_vi in a cell
    expect(rows).toMatch(/w\.example_vi/)
  })

  it('table body must NOT render topic pill (CHỦ ĐỀ removed)', () => {
    const source = readFile('components/admin/words/WordsTable.tsx')
    const rows = findWordRow(source)
    // Must not have the colored topic pill rendering from the old column
    // (w.topics pill display should be gone)
    expect(rows).not.toMatch(/topics\.(color|name)/)
  })
})
