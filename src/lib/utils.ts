/**
 * Fisher-Yates Shuffle Algorithm
 * Trộn mảng một cách ngẫu nhiên và đồng nhất.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ── String utilities ─────────────────────────────────────────

/**
 * Strips Unicode diacritical marks (accents) from text.
 * Used by both slugify and tag-engine for case-insensitive matching.
 */
export function stripDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Converts a string to a URL-safe slug.
 * Handles Unicode characters, special characters, and whitespace.
 */
export function slugify(name: string): string {
  return stripDiacritics(name.toLowerCase())
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ── Study Post-Flip Challenge ─────────────────────────────────

const HARD_CODED_DISTRACTORS = [
  'để nhớ lại điều gì đó',
  'học thuộc một cách có hệ thống',
  'ghi nhớ thông tin quan trọng',
  'tập trung chú ý vào điều gì',
  'hiểu rõ vấn đề cốt lõi',
  'áp dụng kiến thức vào thực tế',
  'phân tích tình huống cụ thể',
  'đánh giá kết quả công việc',
]

export function generateChoices(word: import('./types').Word): string[] {
  const correct = word.definition
  const distractors = HARD_CODED_DISTRACTORS
    .filter(d => d !== correct)
    .slice(0, 3)
  return shuffleArray([correct, ...distractors])
}

// ── Time formatting ──────────────────────────────────────────

/**
 * Format a ISO timestamp to Vietnamese relative time or absolute date.
 * Used for displaying created_at / updated_at in admin lists and modals.
 */
export function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'vừa xong'
    if (diffMin < 60) return `${diffMin} phút trước`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH} giờ trước`
    const diffD = Math.floor(diffH / 24)
    return `${diffD} ngày trước`
  } catch {
    return ''
  }
}

/**
 * Format a ISO timestamp to a compact detailed date string.
 * e.g. "25Mar26-13:30" (DDMMMYY-HH:mm in UTC/local)
 */
export function formatDetailedDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[d.getMonth()]
    const year2 = String(d.getFullYear()).slice(-2)
    const hour = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${day}${month}${year2}-${hour}:${min}`
  } catch {
    return ''
  }
}

// ── Slug Utilities ─────────────────────────────────────────

/**
 * Generate a slug that is unique within existingSlugs.
 * If roadmapSlug is provided, prefix the slug with "roadmapSlug-" to avoid
 * cross-roadmap collisions (e.g., two roadmaps creating "Animals" topic).
 * If base slug is not taken → return it.
 * Otherwise append -1, -2, ... until unique.
 */
export function generateUniqueSlug(
  base: string,
  existingSlugs: Set<string>,
  roadmapSlug?: string,
): string {
  const prefixed = roadmapSlug ? `${roadmapSlug}-${base}` : base
  if (!existingSlugs.has(prefixed)) return prefixed
  let i = 1
  while (existingSlugs.has(`${prefixed}-${i}`)) i++
  return `${prefixed}-${i}`
}