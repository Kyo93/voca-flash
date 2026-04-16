/**
 * RED TEST — WordFormModal should NOT have Topics section
 * ========================================================
 * Topics assignment is done via RoadmapSetupPage, not in the word form.
 * The "Chủ đề" section clutters the form and causes duplicate checkboxes
 * (e.g. "Greetings" appearing twice).
 *
 * Run: npm test -- tests/unit/word-form-remove-topics.test.ts
 */

import { describe, it, expect } from 'vitest'
import * as path from 'path'
import * as fs from 'fs'

const SRC = path.resolve(__dirname, '../../src')

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8')
}

describe('WordFormModal must NOT have Topics section', () => {
  it('must NOT render a Topics/Chủ đề section in the form', () => {
    const source = readFile('components/admin/WordFormModal.tsx')
    // After removal: no "Chủ đề" section, no showTopics prop
    expect(source.toLowerCase()).not.toContain('chủ đề')
    expect(source.toLowerCase()).not.toContain('showtopics')
    expect(source.toLowerCase()).not.toContain('topicids')
  })

  it('must NOT include topicIds in the onSave payload', () => {
    const source = readFile('components/admin/WordFormModal.tsx')
    // After removal: handleSubmit does not pass topicIds to onSave
    expect(source).not.toMatch(/topicIds\s*\(/)
    expect(source).not.toMatch(/onSave.*topicIds/)
  })
})
