import { test, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

test('Build output does not contain catastrophic syntax corruption', () => {
  const assetsDir = path.resolve(__dirname, '../../dist/assets')
  
  if (!fs.existsSync(assetsDir)) {
    console.warn('dist/assets not found. Skipping frontend safety check. Run npm run build first.')
    return
  }

  const files = fs.readdirSync(assetsDir)
  const indexFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'))

  if (!indexFile) {
    console.warn('index-*.js not found in dist/assets. Skipping check.')
    return
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
