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

describe('TopicPanel — clean flat cards with icon inside, name prominent, slug below', () => {

  it('card must have topic icon shown inside (material-symbols-outlined with topic.icon)', () => {
    const source = readFile('components/admin/TopicPanel.tsx')
    expect(source).toMatch(/topic\.icon/)
  })

  it('topic name must be displayed prominently (text-sm)', () => {
    const source = readFile('components/admin/TopicPanel.tsx')
    expect(source).toMatch(/text-sm/)          // font-size 14px
    expect(source).toMatch(/\{topic\.name\}/)  // name value rendered
  })

  it('slug must be displayed as mono text', () => {
    const source = readFile('components/admin/TopicPanel.tsx')
    expect(source).toMatch(/font-mono/)         // mono font
    expect(source).toMatch(/\/{topic\.slug\}/) // slug value
  })

  it('action buttons (edit/delete) must be shown on hover via group-hover', () => {
    const source = readFile('components/admin/TopicPanel.tsx')
    expect(source).toMatch(/opacity-0 group-hover:opacity-100/)
    expect(source).not.toContain('>Sửa<')
    expect(source).not.toContain('>Xóa<')
  })

  it('card background must be tinted with topic color', () => {
    const source = readFile('components/admin/TopicPanel.tsx')
    expect(source).toMatch(/backgroundColor:.*topicColor.*1A/)
  })
})
