/**
 * Tag Engine — Rule-based auto-tagging cho từ vựng VocaFlash
 *
 * Mỗi tag có danh sách keyword để match trên word + definition.
 * Thứ tự rules: keyword dài hơn (specific) check trước keyword ngắn.
 * Case-insensitive matching.
 */

import { stripDiacritics } from './utils'
import { TAG_FALLBACK_COLOR, TAG_META, TAG_KEYWORDS } from './tag-constants'

// ─── Normalize text for matching ──────────────────────────────
function normalize(text: string): string {
  return stripDiacritics(text.toLowerCase())
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Core auto-tag function ──────────────────────────────────
export function autoTag(word: string, definition: string): string[] {
  const text = normalize(`${word} ${definition}`)
  const matched: string[] = []

  for (const [tag, keywords] of TAG_KEYWORDS) {
    for (const kw of keywords) {
      const kwNorm = normalize(kw)
      if (text.includes(kwNorm)) {
        if (!matched.includes(tag)) matched.push(tag)
        break // found, move to next tag
      }
    }
  }

  return matched
}

// ─── Suggest best topic for a set of tags ─────────────────────
export function suggestTopicFromTags(
  tags: string[],
  topics: { id: string; name: string; icon: string }[]
): { id: string; name: string } | null {
  if (tags.length === 0 || topics.length === 0) return null

  for (const tag of tags) {
    const match = topics.find(t =>
      normalize(t.name).includes(tag) ||
      tag.includes(normalize(t.name))
    )
    if (match) return { id: match.id, name: match.name }
  }

  return null
}

// ─── Tag colors helper ─────────────────────────────────────────
export function getTagColor(tag: string): string {
  return TAG_META[tag]?.color ?? TAG_FALLBACK_COLOR
}

export function getTagLabel(tag: string): string {
  return TAG_META[tag]?.label ?? tag
}
