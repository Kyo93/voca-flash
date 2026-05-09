import { test, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

function walkFiles(dir: string, extension: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir)) {
    const filePath = path.join(dir, entry)
    if (fs.statSync(filePath).isDirectory()) {
      walkFiles(filePath, extension, files)
    } else if (filePath.endsWith(extension)) {
      files.push(filePath)
    }
  }
  return files
}

test('Build output does not contain catastrophic syntax corruption', () => {
  const assetsDir = path.resolve(__dirname, '../../dist/assets')

  expect(
    fs.existsSync(assetsDir),
    'dist/assets is required for frontend safety checks; run npm run build before this test',
  ).toBe(true)

  const files = fs.readdirSync(assetsDir)
  const indexFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'))

  expect(indexFile, 'index-*.js is required for frontend safety checks').toBeDefined()
  if (!indexFile) {
    throw new Error('index-*.js is required for frontend safety checks')
  }

  const content = fs.readFileSync(path.join(assetsDir, indexFile), 'utf-8')
  
  // 1. Syntax Validation (Check for broken template literals)
  // ❌ Bug #1: Single-quote wrapping template string
  expect(content).not.toMatch(/=\s*'[^']*\$\{t\(/)
  
  // 2. Delimiter consistency
  // ❌ Bug #4: Mismatched delimiters
  expect(content).not.toMatch(/t\('[^']*\`/)
  expect(content).not.toMatch(/t\(\`[^']*'\)/)
  
  // 3. HTML structure integrity
  // ❌ Bug #2: Spaces inside tags or broken closers
  expect(content).not.toMatch(/<\s+[a-zA-Z]/) // e.g., "< div"
  expect(content).not.toMatch(/<\/\s+[a-zA-Z]/) // e.g., "</ div"
  expect(content).not.toMatch(/--\s+>/) // e.g., "text-- >"
})

test('Tailwind utility names are not constructed with runtime interpolation', () => {
  const files = walkFiles(path.resolve(__dirname, '../../src'), '.tsx')
  const findings = files.flatMap((file) => {
    const source = fs.readFileSync(file, 'utf-8')
    return source
      .split(/\r?\n/)
      .map((line, index) => ({ line, number: index + 1 }))
      .filter(({ line }) => /\b(?:bg|text|border|border-t|border-b|from|to|via)-\$\{/.test(line))
      .map(({ line, number }) => `${path.relative(process.cwd(), file)}:${number} ${line.trim()}`)
  })

  expect(findings).toEqual([])
})
