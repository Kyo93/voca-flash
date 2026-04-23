/** Fisher-Yates uniform shuffle */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ── String utilities ─────────────────────────────────────────

export function stripDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function slugify(name: string): string {
  return stripDiacritics(name.toLowerCase())
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ── Time formatting ──────────────────────────────────────────

import { TIME_CONSTANTS } from './constants'

export function getTodayBoundary(): Date {
  const boundary = new Date()
  boundary.setHours(TIME_CONSTANTS.DAY_BOUNDARY_HOUR, 0, 0, 0)
  if (new Date().getHours() < TIME_CONSTANTS.DAY_BOUNDARY_HOUR) {
    boundary.setDate(boundary.getDate() - 1)
  }
  return boundary
}

export function getEndOfStudyDay(): Date {
  const boundary = getTodayBoundary()
  boundary.setDate(boundary.getDate() + 1)
  return boundary
}

export function formatRelativeTime(dateStr: string, t?: (key: string, options?: Record<string, unknown>) => string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / TIME_CONSTANTS.ONE_MINUTE_MS)
    
    if (diffMin < 1) return t ? t('common.time.just_now') : 'vừa xong'
    if (diffMin < TIME_CONSTANTS.ONE_HOUR_MINS) {
      return t ? t('common.time.minutes_ago', { count: diffMin }) : `${diffMin} phút trước`
    }
    
    const diffH = Math.floor(diffMin / TIME_CONSTANTS.ONE_HOUR_MINS)
    if (diffH < TIME_CONSTANTS.ONE_DAY_HOURS) {
      return t ? t('common.time.hours_ago', { count: diffH }) : `${diffH} giờ trước`
    }
    
    const diffD = Math.floor(diffH / TIME_CONSTANTS.ONE_DAY_HOURS)
    return t ? t('common.time.days_ago', { count: diffD }) : `${diffD} ngày trước`
  } catch {
    return ''
  }
}

/** e.g. "25Mar26-13:30" */
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

// ── Color Utilities ──────────────────────────────────────────

export function hexToRgba(hex: string, alpha: number): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return `rgba(0, 0, 0, ${alpha})`;
  }
}

export function darkenColor(hex: string, percent: number): string {
  try {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = Math.floor(r * (1 - percent));
    g = Math.floor(g * (1 - percent));
    b = Math.floor(b * (1 - percent));

    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return 'inherit';
  }
}

/** Default brand orange dùng làm fallback khi topic chưa cấu hình màu. */
export const DEFAULT_TOPIC_COLOR = '#f97316';

/**
 * Trả về `style` cho topic chip/badge: nền pastel (~12% alpha) + chữ theo màu topic.
 * Tự fallback về `DEFAULT_TOPIC_COLOR` nếu không có màu.
 */
export function topicColorStyle(color?: string | null): { backgroundColor: string; color: string } {
  const resolved = color ?? DEFAULT_TOPIC_COLOR;
  return {
    backgroundColor: `${resolved}20`,
    color: resolved,
  };
}