/**
 * Topic Card Design Tests (RoadmapSetupPage TopicPanel)
 * Verifies the outer-icon-bar + inner-card layout:
 *  1. Color accent bar (left edge) + icon badge (left of card)
 *  2. Slug displayed as badge tag outside the card
 *  3. Action buttons icon-only, shown on hover
 *  4. Full-card background tint in topic color
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

describe('TopicPanel — outer icon/slug bar + inner card layout', () => {

  it('must have color accent bar (left of card)', () => {
    const source = readFile('pages/admin/RoadmapSetupPage.tsx')
    // Color bar: div with className including 'w-1' and style backgroundColor
    expect(source).toMatch(/className="w-1.*rounded-full/)
    expect(source).toMatch(/style=\{\{\s*backgroundColor:\s*topicColor/)
  })

  it('must have icon badge outside the card (left of card)', () => {
    const source = readFile('pages/admin/RoadmapSetupPage.tsx')
    // Icon badge: w-10 h-10 rounded-xl, shows topic.icon
    expect(source).toMatch(/topic\.icon/)
    expect(source).toMatch(/w-10.*h-10.*rounded-xl/)
  })

  it('must display slug as badge tag next to topic name', () => {
    const source = readFile('pages/admin/RoadmapSetupPage.tsx')
    // Slug badge: /{topic.slug} inside a tag near the name
    expect(source).toMatch(/\/{topic\.slug}/)
  })

  it('action buttons must be icon-only (no text label), shown on hover', () => {
    const source = readFile('pages/admin/RoadmapSetupPage.tsx')
    // Hover reveal pattern present
    expect(source).toMatch(/opacity-0 group-hover:opacity-100/)
    // No text labels on action buttons
    expect(source).not.toContain('>Sửa<')
    expect(source).not.toContain('>Xóa<')
  })

  it('card must have subtle full-card background tint in the topic color', () => {
    const source = readFile('pages/admin/RoadmapSetupPage.tsx')
    // backgroundColor with topicColor variable (opacity ~8%)
    expect(source).toMatch(/backgroundColor:.*topicColor.*1A/)
  })
})
