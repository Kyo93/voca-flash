import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const VN_CHAR_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir)
  files.forEach(file => {
    const filePath = join(dir, file)
    if (statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList)
    } else {
      if (extname(file) === '.tsx') {
        fileList.push(filePath)
      }
    }
  })
  return fileList
}

describe('i18n Hardcoded String Audit', () => {
  const directories = [
    'src/pages',
    'src/components'
  ]

  directories.forEach(dir => {
    const files = getFiles(dir)
    
    files.forEach(file => {
      it(`File: ${file} should not have hardcoded Vietnamese strings`, () => {
        const content = readFileSync(file, 'utf-8')
        
        // Remove comments to avoid false positives in documentation/logic comments
        const cleanContent = content
          .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
        
        const hasVn = VN_CHAR_REGEX.test(cleanContent)
        
        if (hasVn) {
          const matches = cleanContent.match(new RegExp(`.{0,20}${VN_CHAR_REGEX.source}.{0,20}`, 'gi'))
          throw new Error(`Hardcoded Vietnamese found in ${file}:\n...${matches?.slice(0, 3).join('\n...')}\n`)
        }
        
        expect(hasVn).toBe(false)
      })
    })
  })
})
