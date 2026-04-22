import { test, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

test('i18n files have identical key structures', () => {
  const langDir = path.resolve(__dirname, '../../src/i18n')
  const langs = ['vi.json', 'en.json']
  
  const getKeys = (obj: any, prefix = ''): string[] => {
    let keys: string[] = []
    for (const k in obj) {
      const fullKey = prefix ? `${prefix}.${k}` : k
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        keys = keys.concat(getKeys(obj[k], fullKey))
      } else {
        keys.push(fullKey)
      }
    }
    return keys.sort()
  }

  const viData = JSON.parse(fs.readFileSync(path.join(langDir, 'vi.json'), 'utf-8'))
  const enData = JSON.parse(fs.readFileSync(path.join(langDir, 'en.json'), 'utf-8'))

  const viKeys = getKeys(viData)
  const enKeys = getKeys(enData)

  const missingInEn = viKeys.filter(k => !enKeys.includes(k))
  const missingInVi = enKeys.filter(k => !viKeys.includes(k))

  expect(missingInEn, `Keys present in vi.json but missing in en.json: ${missingInEn.join(', ')}`).toEqual([])
  expect(missingInVi, `Keys present in en.json but missing in vi.json: ${missingInVi.join(', ')}`).toEqual([])
})
