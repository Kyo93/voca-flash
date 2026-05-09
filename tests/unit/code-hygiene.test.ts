import { describe, expect, it } from 'vitest'
import ts from 'typescript'
import { readdirSync, readFileSync, statSync } from 'fs'
import path from 'path'

function walkFiles(dir: string, extension: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const filePath = path.join(dir, entry)
    if (statSync(filePath).isDirectory()) {
      walkFiles(filePath, extension, files)
    } else if (filePath.endsWith(extension)) {
      files.push(filePath)
    }
  }
  return files
}

function getLine(sourceFile: ts.SourceFile, node: ts.Node): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
}

function getJsxParent(node: ts.Node): ts.JsxElement | undefined {
  let current: ts.Node | undefined = node.parent
  while (current) {
    if (ts.isJsxElement(current)) return current
    current = current.parent
  }
  return undefined
}

function isIconText(node: ts.JsxText): boolean {
  const parent = getJsxParent(node)
  return parent ? parent.openingElement.getText().includes('material-symbols-outlined') : false
}

function isAllowedStaticText(text: string): boolean {
  if (!/[A-Za-zÀ-ỹ]/.test(text)) return true
  if (/^&[a-z]+;$/.test(text)) return true
  if (/^[A-Z]$/.test(text)) return true
  if (/^[A-Z]{2,3}$/.test(text)) return true
  if (/^[a-z]$/.test(text)) return true
  if (/^\+?\d+[a-z]?$/i.test(text)) return true
  return text === 'VocaFlash'
}

describe('code hygiene guardrails', () => {
  it('keeps executable backup SQL files out of Supabase migrations', () => {
    const migrationFiles = readdirSync(path.resolve('supabase/migrations'))
      .filter((file) => file.endsWith('.sql'))

    const backupFiles = migrationFiles.filter((file) => file.startsWith('_') || /backup|orphan/i.test(file))

    expect(backupFiles).toEqual([])
  })

  it('does not hardcode user-visible strings in JSX text, labels, titles, or prompts', () => {
    const files = [
      path.resolve('src/App.tsx'),
      ...walkFiles(path.resolve('src/pages'), '.tsx'),
      ...walkFiles(path.resolve('src/components'), '.tsx'),
    ]

    const textAttributes = new Set(['placeholder', 'title', 'aria-label', 'alt', 'label'])
    const findings: string[] = []

    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

      function visit(node: ts.Node) {
        if (ts.isJsxText(node) && !isIconText(node)) {
          const text = node.getText(sourceFile).replace(/\s+/g, ' ').trim()
          if (text && !isAllowedStaticText(text)) {
            findings.push(`${path.relative(process.cwd(), file)}:${getLine(sourceFile, node)} "${text}"`)
          }
        }

        if (
          ts.isJsxAttribute(node) &&
          textAttributes.has(node.name.getText(sourceFile)) &&
          node.initializer &&
          ts.isStringLiteral(node.initializer)
        ) {
          const text = node.initializer.text.trim()
          if (text && !isAllowedStaticText(text)) {
            findings.push(`${path.relative(process.cwd(), file)}:${getLine(sourceFile, node)} ${node.name.getText(sourceFile)}="${text}"`)
          }
        }

        if (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          node.expression.name.text === 'prompt' &&
          node.arguments[0] &&
          ts.isStringLiteral(node.arguments[0])
        ) {
          findings.push(`${path.relative(process.cwd(), file)}:${getLine(sourceFile, node)} prompt="${node.arguments[0].text}"`)
        }

        ts.forEachChild(node, visit)
      }

      visit(sourceFile)
    }

    expect(findings).toEqual([])
  })

  it('does not use direct hex colors in active TSX UI files', () => {
    const files = walkFiles(path.resolve('src'), '.tsx')
    const findings = files.flatMap((file) => {
      const source = readFileSync(file, 'utf8')
      return source
        .split(/\r?\n/)
        .map((line, index) => ({ line, number: index + 1 }))
        .filter(({ line }) => /#[0-9A-Fa-f]{3,8}/.test(line))
        .map(({ line, number }) => `${path.relative(process.cwd(), file)}:${number} ${line.trim()}`)
    })

    expect(findings).toEqual([])
  })

  it('keeps hardcoded TypeScript color literals isolated to token and data-color modules', () => {
    const allowedColorDataFiles = new Set([
      path.normalize('src/lib/tag-constants.ts'),
      path.normalize('src/lib/theme.ts'),
      path.normalize('src/lib/tokens.ts'),
      path.normalize('src/lib/topic-suggestions.ts'),
      path.normalize('src/lib/utils.ts'),
    ])
    const files = [
      ...walkFiles(path.resolve('src'), '.ts'),
      ...walkFiles(path.resolve('src'), '.tsx'),
    ]

    const findings = files.flatMap((file) => {
      const relativePath = path.normalize(path.relative(process.cwd(), file))
      if (allowedColorDataFiles.has(relativePath)) return []

      const source = readFileSync(file, 'utf8')
      return source
        .split(/\r?\n/)
        .map((line, index) => ({ line, number: index + 1 }))
        .filter(({ line }) => /#[0-9A-Fa-f]{3,8}/.test(line))
        .map(({ line, number }) => `${path.relative(process.cwd(), file)}:${number} ${line.trim()}`)
    })

    expect(findings).toEqual([])
  })

  it('keeps selected hook-level UI copy in i18n instead of hardcoded strings', () => {
    const files = [
      path.resolve('src/hooks/useDashboard.ts'),
      path.resolve('src/hooks/admin/useWordForm.ts'),
    ]
    const findings = files.flatMap((file) => {
      const source = readFileSync(file, 'utf8')
      return source
        .split(/\r?\n/)
        .map((line, index) => ({ line, number: index + 1 }))
        .filter(({ line }) => /['"`][^'"`]*[À-ỹ][^'"`]*['"`]/.test(line))
        .map(({ line, number }) => `${path.relative(process.cwd(), file)}:${number} ${line.trim()}`)
    })

    expect(findings).toEqual([])
  })
})
