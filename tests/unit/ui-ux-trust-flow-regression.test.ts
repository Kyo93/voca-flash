import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'

type JsonObject = Record<string, unknown>

const ROOT = path.resolve(__dirname, '../..')

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
}

function readJson(relativePath: string): JsonObject {
  return JSON.parse(read(relativePath)) as JsonObject
}

function get(obj: JsonObject, key: string): unknown {
  return key.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object' && part in current) {
      return (current as JsonObject)[part]
    }
    return undefined
  }, obj)
}

describe('UI/UX trust flow regressions', () => {
  it('keeps audited settings/admin labels translated instead of leaking raw keys', () => {
    const vi = readJson('src/i18n/vi.json')
    const en = readJson('src/i18n/en.json')
    const requiredKeys = [
      'settings.profile',
      'admin.words.title',
      'admin.words.count',
      'admin.words.addWord',
      'admin.sidebar.panelTitle',
    ]

    for (const key of requiredKeys) {
      expect(get(vi, key), `vi missing ${key}`).toEqual(expect.any(String))
      expect(get(en, key), `en missing ${key}`).toEqual(expect.any(String))
      expect(get(vi, key)).not.toBe(key)
      expect(get(en, key)).not.toBe(key)
    }

    expect(get(vi, 'admin.sidebar.panelTitle')).toBe('Bảng quản trị')
  })

  it('keeps desktop Mastery inside the app shell instead of pushing the right sidebar off-screen', () => {
    const source = read('src/pages/MasteryPage.tsx')

    expect(source).toContain('data-mastery-desktop-page')
    expect(source).toMatch(/max-w-full/)
    expect(source).toMatch(/overflow-x-hidden/)
    expect(source).toMatch(/min-w-0/)
  })

  it('keeps high-frequency desktop controls at the 44px interaction target', () => {
    const header = read('src/components/Header.tsx')
    const rightSidebar = read('src/components/RightSidebar.tsx')
    const wordsTable = read('src/components/admin/words/WordsTable.tsx')

    expect(header).toMatch(/h-11 w-11/)
    expect(rightSidebar).toMatch(/h-11 w-11/)
    expect(wordsTable).toMatch(/h-11 w-11/)
    expect(wordsTable).toMatch(/min-h-11 min-w-11/)
  })

  it('initializes the direct Study route even when no topic query is present', () => {
    const source = read('src/pages/StudyPage.tsx')

    expect(source).toMatch(/useRef<string \| null>\(null\)/)
    expect(source).toMatch(/const initializedTopicKey = topic \?\? 'all'/)
    expect(source).toMatch(/initialize\(topic\)/)
  })
})
