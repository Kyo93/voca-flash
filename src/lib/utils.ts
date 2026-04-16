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