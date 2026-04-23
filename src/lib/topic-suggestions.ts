// ─── Icon Suggestion Map ──────────────────────────────────────
import { stripDiacritics } from './utils'

export const ICON_MAP: [string[], string][] = [
  [['giao tiếp', 'communication', 'chat', 'nói'], 'chat'],
  [['giáo dục', 'học', 'học tập', 'school', 'study', 'edu', 'learning'], 'school'],
  [['sức khỏe', 'y tế', 'bệnh', 'thể thao', 'health', 'medical', 'fitness', 'sport'], 'fitness_center'],
  [['đồ ăn', 'ẩm thực', 'nấu ăn', 'food', 'eat', 'dining', 'restaurant', 'cooking'], 'restaurant'],
  [['đời thường', 'cuộc sống', 'daily', 'life', 'living', 'lifestyle'], 'waving_hand'],
  [['thiên nhiên', 'môi trường', 'cây', 'nature', 'outdoor', 'plant', 'animal', 'pets'], 'nature'],
  [['nhà cửa', 'nhà', 'home', 'house', 'housing'], 'home'],
  [['công việc', 'job', 'work', 'career', 'business', 'office'], 'work'],
  [['cảm xúc', 'tâm lý', 'emotion', 'feeling', 'mind', 'mental'], 'mood'],
  [['kỹ năng', 'skill', 'ability', 'soft skill'], 'psychology'],
  [['du lịch', 'travel', 'trip', 'journey', 'vacation'], 'travel'],
  [['âm nhạc', 'music', 'nhạc'], 'music_note'],
  [['nghệ thuật', 'art', 'design', 'creative'], 'palette'],
  [['khoa học', 'science', 'tech', 'technology'], 'science'],
  [['pháp luật', 'law', 'legal', 'justice'], 'gavel'],
  [['chính trị', 'politics', 'policy', 'political'], 'policy'],
  [['kinh tế', 'economy', 'economic', 'finance', 'money'], 'payments'],
  [['xã hội', 'social', 'society', 'community'], 'groups'],
  [['trẻ em', 'trẻ', 'kid', 'child', 'children'], 'child_care'],
  [['phổ thông', 'general', 'common', 'standard'], 'auto_stories'],
  [['công nghệ', 'tech', 'computer', 'it', 'software'], 'computer'],
  [['kỹ thuật', 'engineering', 'technical'], 'engineering'],
  [['toeic', 'ielts', 'ngoại ngữ', 'language'], 'translate'],
  [['yêu', 'tình yêu', 'love', 'romance'], 'favorite'],
  [['thể thao', 'sport', 'game', 'competition'], 'sports'],
  [['tài chính', 'finance'], 'account_balance'],
]

export const ICON_OPTIONS = [
  'chat', 'forum', 'comment', 'translate', 'language', 'text_fields',
  'school', 'auto_stories', 'menu_book', 'library_books', 'science',
  'calculate', 'biotech', 'history_edu', 'psychology', 'tips_and_updates',
  'computer', 'code', 'terminal', 'developer_mode', 'api',
  'cloud', 'storage', 'dns', 'memory', 'smartphone', 'laptop_mac',
  'work', 'business_center', 'handshake', 'analytics', 'trending_up',
  'campaign', 'storefront', 'point_of_sale', 'payments', 'receipt_long',
  'account_balance', 'savings', 'workspace_premium', 'workspace', 'support_agent',
  'fitness_center', 'sports', 'sports_esports', 'pool', 'self_improvement',
  'medical_services', 'vaccines', 'monitor_heart', 'spa', 'favorite_border',
  'home', 'groups', 'family_restroom', 'diversity_3', 'volunteer_activism',
  'emoji_people', 'accessibility_new', 'cruelty_free', 'pets', 'child_care',
  'travel_explore', 'flight', 'hotel', 'beach_access', 'terrain',
  'map', 'explore', 'directions_car', 'two_wheeler', 'sailing',
  'restaurant', 'local_cafe', 'bakery_dining', 'dinner_dining', 'lunch_dining',
  'breakfast_dining', 'kitchen', 'local_bar', 'icecream', 'cake',
  'nature', 'eco', 'forest', 'water_drop', 'waves', 'whatshot',
  'sunny', 'cloud', 'partly_cloudy_day', 'grass', 'potted_plant',
  'palette', 'brush', 'draw', 'photo_camera', 'movie', 'music_note',
  'headphones', 'videocam', 'mic', 'album', 'audiotrack',
  'gavel', 'balance', 'policy', 'real_estate_agent', 'account_box',
  'mood', 'sentiment_satisfied', 'sentiment_very_satisfied', 'mood_bad', 'psychology_alt',
  'lightbulb', 'bulb', 'extension', 'build', 'build_circle', 'settings',
  'bookmark', 'label', 'local_offer', 'discount', 'attach_money', 'paid',
  'push_pin', 'flag', 'stars', 'emoji_events', 'celebration',
  'waving_hand', 'sign_language',
]

export const COLOR_PALETTE = [
  '#E57E22', '#6B8E23', '#4A5568', '#8B5CF6', '#E74C3C',
  '#1ABC9C', '#F1C40F', '#D97706', '#1F2937', '#9CA3AF',
]

export function suggestIcon(name: string): string {
  const lower = stripDiacritics(name.toLowerCase())
  for (const [keywords, icon] of ICON_MAP) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) return icon
  }
  return 'label'
}

export function suggestImageUrl(name: string): string {
  const seed = stripDiacritics(name).replace(/\s+/g, '-').toLowerCase()
  return `https://picsum.photos/seed/${seed}/800/450`
}

export function suggestColor(name: string): string {
  const idx = stripDiacritics(name)
    .split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % COLOR_PALETTE.length
  return COLOR_PALETTE[idx]
}
