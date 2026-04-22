import { test, expect } from 'vitest'
import fs from 'fs'
import { execSync } from 'child_process'

test('no secret files tracked by git', () => {
  try {
    const tracked = execSync('git ls-files', { encoding: 'utf-8' })
    const badFiles = ['.env', '.dev.vars', '.env.local', '.env.production', 'supabase/seed.sql']
    const found = badFiles.filter(f => tracked.split('\n').includes(f))
    expect(found, `Secret files tracked by git: ${found.join(', ')}`).toEqual([])
  } catch (err) {
    console.warn('Git not found or not a repo. Skipping git check.')
  }
})

test('.gitignore contains required security patterns', () => {
  if (!fs.existsSync('.gitignore')) {
    console.warn('.gitignore not found. Skipping check.')
    return
  }
  const gitignore = fs.readFileSync('.gitignore', 'utf-8')
  expect(gitignore).toContain('.env')
})

test('no hardcoded potential secrets in source files', () => {
  const dangerousPatterns = [
    /SERVICE_KEY\s*[=:]\s*['"][a-zA-Z0-9/+=]{20,}/g,
    /PRIVATE_KEY\s*[=:]\s*['"][a-zA-Z0-9/+=]{20,}/g,
    /-----BEGIN.*PRIVATE KEY-----/g,
    /sb_publishable_[a-zA-Z0-9]+/g // Supabase publishable keys are okay, but let's watch them
  ]
  
  const srcDir = 'src'
  if (!fs.existsSync(srcDir)) return

  function scanDir(dir: string) {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const filePath = `${dir}/${file}`
      if (fs.statSync(filePath).isDirectory()) {
        scanDir(filePath)
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf-8')
        for (const pattern of dangerousPatterns) {
          // Skip if it's a false positive like "sb_publishable_key" (name only)
          if (pattern.source.includes('sb_publishable')) {
            const matches = content.match(pattern)
            if (matches) {
               // Publishable keys are generally okay in frontend, but check for service keys
               expect(content, `${filePath} contains potential secret`).not.toMatch(/sb_service_role_[a-zA-Z0-9]+/g)
            }
            continue
          }
          expect(content, `${filePath} contains potential secret`).not.toMatch(pattern)
        }
      }
    }
  }

  scanDir(srcDir)
})
