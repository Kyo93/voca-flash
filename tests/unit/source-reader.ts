import { existsSync, readFileSync, readdirSync } from 'fs'
import { resolve } from 'path'

const PROJECT_ROOT = resolve(__dirname, '../..')

export function projectPath(relativePath: string) {
  return resolve(PROJECT_ROOT, relativePath)
}

export function readProjectFile(relativePath: string) {
  return readFileSync(projectPath(relativePath), 'utf-8')
}

export function readSourceFile(relativePath: string) {
  return readProjectFile(`src/${relativePath}`)
}

export function readSourceMatch(relativePath: string, pattern: RegExp, description: string) {
  const source = readSourceFile(relativePath)
  const match = source.match(pattern)
  if (!match) {
    throw new Error(`Expected ${description} in src/${relativePath}`)
  }

  return match[0]
}

export function readSourceFunction(relativePath: string, functionName: string) {
  return readSourceMatch(
    relativePath,
    new RegExp(`(?:export\\s+)?(?:async\\s+)?function ${functionName}[\\s\\S]*?(?=\\nexport|$)`),
    `${functionName} function`,
  )
}

export function readSourceInterface(relativePath: string, interfaceName: string) {
  return readSourceMatch(
    relativePath,
    new RegExp(`export interface ${interfaceName}[\\s\\S]*?^}`, 'm'),
    `${interfaceName} interface`,
  )
}

export function listProjectDir(relativePath: string) {
  return readdirSync(projectPath(relativePath))
}

export function projectFileExists(relativePath: string) {
  return existsSync(projectPath(relativePath))
}
