import { test, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

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
