/**
 * RED TESTS — Topic Card Design Improvements (RoadmapSetupPage TopicPanel)
 * =========================================================================
 * 3 issues:
 *  1. Cards too cramped — gap is space-y-1 (4px), should be space-y-3 (12px)
 *  2. "Sửa" + "Xóa" buttons always visible (text + icon), too cluttered
 *     Fix: icon-only, hidden by default, shown on hover
 *  3. No topic-color tint — cards have no background color tied to the topic
 *     Fix: subtle left border in topic color (muted via opacity)
 *
 * Run: npm test -- tests/unit/topic-card-design.test.ts
 */

import { describe, it, expect } from 'vitest'
import * as path from 'path'
import * as fs from 'fs'

const SRC = path.resolve(__dirname, '../../src')

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8')
}

function findContainer(source: string): string {
  // space-y-3 lives on the container div, which wraps topics.map
  const containerIdx = source.indexOf('overflow-y-auto space-y-3')
  expect(containerIdx).toBeGreaterThan(-1)
  // 1200 chars: container → empty state → topics.map → first card → buttons
  return source.substring(containerIdx, containerIdx + 1200)
}

function findUncategorizedSection(source: string): string {
  const idx = source.indexOf('Chưa phân loại')
  expect(idx).toBeGreaterThan(-1)
  return source.substring(Math.max(0, idx - 200), idx + 50)
}

describe('TopicPanel — topic cards must have proper spacing, elegant actions, topic-color tint', () => {

  it('card list gap must be space-y-3 (12px), not space-y-1 (4px)', () => {
    const source = readFile('pages/admin/RoadmapSetupPage.tsx')
    const container = findContainer(source)
    expect(container).toMatch(/space-y-3/)
    expect(container).not.toMatch(/space-y-1(?!-)/)
  })

  it('action buttons must be icon-only (no text label), shown on hover', () => {
    const source = readFile('pages/admin/RoadmapSetupPage.tsx')
    // Buttons live inside the card div — find it and search the button section
    const cardIdx = source.indexOf('relative group rounded-lg')
    const btnIdx = source.indexOf('opacity-0 group-hover:opacity-100')
    expect(cardIdx).toBeGreaterThan(-1)
    expect(btnIdx).toBeGreaterThan(-1)
    const buttonSection = source.substring(cardIdx, btnIdx + 300)
    // No text labels
    expect(buttonSection).not.toContain('>Sửa<')
    expect(buttonSection).not.toContain('>Xóa<')
    // Hover reveal pattern present
    expect(source).toMatch(/opacity-0 group-hover:opacity-100/)
  })

  it('topic card must have a subtle full-card background tint in the topic color (muted)', () => {
    const source = readFile('pages/admin/RoadmapSetupPage.tsx')
    // The style= attribute on the card div must contain backgroundColor with topic.color
    // NOT borderLeftColor — this is a full-card background tint, not a border
    const cardIdx = source.indexOf('relative group rounded-lg')
    const styleIdx = source.indexOf('backgroundColor:', cardIdx)
    const borderIdx = source.indexOf('borderLeftColor:', cardIdx)
    expect(styleIdx).toBeGreaterThan(-1)
    expect(borderIdx).toBe(-1) // borderLeftColor must be REMOVED
    const styleSection = source.substring(styleIdx, styleIdx + 100)
    // Must reference topic.color in the background (opacity ~8-15%)
    expect(styleSection).toMatch(/topic\.color/)
  })
})
