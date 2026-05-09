import { test, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

type JsonObject = Record<string, unknown>

test('i18n files have identical key structures', () => {
  const langDir = path.resolve(__dirname, '../../src/i18n')
  const langs = ['vi.json', 'en.json']

  const getKeys = (obj: JsonObject, prefix = ''): string[] => {
    let keys: string[] = []
    for (const [k, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${k}` : k
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys = keys.concat(getKeys(value as JsonObject, fullKey))
      } else {
        keys.push(fullKey)
      }
    }
    return keys.sort()
  }

  const viData = JSON.parse(fs.readFileSync(path.join(langDir, 'vi.json'), 'utf-8')) as JsonObject
  const enData = JSON.parse(fs.readFileSync(path.join(langDir, 'en.json'), 'utf-8')) as JsonObject

  const viKeys = getKeys(viData)
  const enKeys = getKeys(enData)

  const missingInEn = viKeys.filter(k => !enKeys.includes(k))
  const missingInVi = enKeys.filter(k => !viKeys.includes(k))

  expect(missingInEn, `Keys present in vi.json but missing in en.json: ${missingInEn.join(', ')}`).toEqual([])
  expect(missingInVi, `Keys present in en.json but missing in vi.json: ${missingInVi.join(', ')}`).toEqual([])
})
