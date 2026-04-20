/**
 * Tag Engine — Rule-based auto-tagging cho từ vựng VocaFlash
 *
 * Mỗi tag có danh sách keyword để match trên word + definition.
 * Thứ tự rules: keyword dài hơn (specific) check trước keyword ngắn.
 * Case-insensitive matching.
 */

import { stripDiacritics } from './utils'

// ─── Tag definitions ────────────────────────────────────────
export const TAG_META: Record<string, { label: string; color: string }> = {
  'work':           { label: 'Công việc',        color: '#F97316' },
  'food':           { label: 'Ẩm thực',          color: '#EF4444' },
  'health':         { label: 'Sức khỏe',         color: '#10B981' },
  'travel':         { label: 'Du lịch',           color: '#3B82F6' },
  'technology':     { label: 'Công nghệ',         color: '#6366F1' },
  'education':      { label: 'Giáo dục',          color: '#8B5CF6' },
  'finance':        { label: 'Tài chính',         color: '#F59E0B' },
  'emotion':        { label: 'Cảm xúc',           color: '#EC4899' },
  'social':         { label: 'Xã hội',            color: '#14B8A6' },
  'nature':         { label: 'Thiên nhiên',       color: '#22C55E' },
  'sports':         { label: 'Thể thao',          color: '#06B6D4' },
  'family':         { label: 'Gia đình',          color: '#F472B6' },
  'business':       { label: 'Kinh doanh',         color: '#FB923C' },
  'communication':  { label: 'Giao tiếp',          color: '#A78BFA' },
  'daily-life':     { label: 'Đời thường',        color: '#6B7280' },
  'creative':       { label: 'Sáng tạo',           color: '#E879F9' },
  'science':        { label: 'Khoa học',           color: '#0EA5E9' },
  'law':            { label: 'Pháp luật',          color: '#7C3AED' },
  'politics':       { label: 'Chính trị',          color: '#B45309' },
  'shopping':       { label: 'Mua sắm',            color: '#DB2777' },
  'time':           { label: 'Thời gian',          color: '#64748B' },
  'weather':        { label: 'Thời tiết',           color: '#38BDF8' },
  'animal':         { label: 'Động vật',           color: '#A3E635' },
  'place':          { label: 'Địa điểm',           color: '#84CC16' },
  'color':          { label: 'Màu sắc',            color: '#F43F5E' },
  'number':         { label: 'Số đếm',             color: '#0D9488' },
  'personality':    { label: 'Tính cách',          color: '#C026D3' },
  'relationship':   { label: 'Quan hệ',            color: '#F87171' },
  'communication-type': { label: 'Phong cách giao tiếp', color: '#818CF8' },
  'abstract':       { label: 'Khái niệm trừu tượng', color: '#9CA3AF' },
}

// ─── Keyword rules (specific → general order matters) ────────
// Từ khóa dài hơn/specific hơn đặt trước để tránh conflict
const TAG_KEYWORDS: [string, string[]][] = [
  ['work', [
    'job', 'career', 'office', 'salary', 'employer', 'employee', 'meeting',
    'project', 'deadline', 'client', 'manager', 'colleague', 'business trip',
    'work from home', 'remote work', 'employment', 'promotion', 'resume',
    'coworker', 'shift', 'overtime', 'position', 'internship', 'interview',
    'application', 'candidate', 'recruit', 'team', 'staff', 'workplace',
  ]],
  ['food', [
    'eat', 'food', 'restaurant', 'cook', 'meal', 'breakfast', 'lunch',
    'dinner', 'recipe', 'ingredient', 'delicious', 'taste', 'flavor',
    'dish', 'cuisine', 'appetite', 'hungry', 'thirsty', 'drink', 'cafe',
    'baker', 'vegetable', 'fruit', 'meat', 'seafood', 'dessert', 'snack',
  ]],
  ['health', [
    'health', 'doctor', 'hospital', 'medicine', 'sick', 'illness', 'disease',
    'pain', 'ache', 'treatment', 'patient', 'symptom', 'prescription',
    'vaccine', 'clinic', 'pharmacy', 'exercise', 'fitness', 'body', 'blood',
    'heart', 'lung', 'mental health', 'stress', 'insomnia', 'headache',
  ]],
  ['travel', [
    'travel', 'trip', 'flight', 'hotel', 'tourist', 'airport', 'passport',
    'vacation', 'destination', 'journey', 'abroad', 'overseas', 'tourism',
    'backpack', 'itinerary', 'souvenir', 'visa', 'customs', 'immigration',
    'luggage', 'baggage', 'check-in', 'boarding pass', 'immigration',
  ]],
  ['technology', [
    'computer', 'software', 'internet', 'online', 'app', 'device', 'digital',
    'data', 'database', 'website', 'email', 'password', 'username', 'download',
    'upload', 'browser', 'server', 'algorithm', 'programming', 'code', 'cyber',
    'wifi', 'bluetooth', 'screen', 'laptop', 'smartphone', 'tablet', 'robot',
    'artificial intelligence', 'machine learning', 'cloud computing', 'cybersecurity',
  ]],
  ['education', [
    'school', 'study', 'learn', 'teacher', 'student', 'exam', 'course',
    'degree', 'university', 'college', 'classroom', 'lecture', 'homework',
    'assignment', 'research', 'scholarship', 'tuition', 'curriculum',
    'semester', 'grade', 'graduate', 'professor', 'tuition', 'diploma',
  ]],
  ['finance', [
    'money', 'bank', 'cost', 'price', 'pay', 'buy', 'sell', 'invest',
    'profit', 'loss', 'budget', 'income', 'expense', 'tax', 'debt', 'loan',
    'credit', 'insurance', 'stock', 'share', 'dividend', 'interest rate',
    'mortgage', 'rent', 'payment', 'transaction', 'currency', 'dollar',
    'euro', 'pound', 'capital', 'asset', 'liability', 'balance',
  ]],
  ['emotion', [
    'feel', 'happy', 'sad', 'angry', 'love', 'hate', 'fear', 'hope',
    'dream', 'worry', 'stress', 'anxious', 'nervous', 'excited', 'bored',
    'jealous', 'proud', 'shame', 'guilt', 'regret', 'relief', 'joy',
    'sorrow', 'grief', 'passion', 'envy', 'compassion', 'gratitude',
  ]],
  ['social', [
    'friend', 'party', 'community', 'neighbor', 'society', 'population',
    'volunteer', 'charity', 'donate', 'immigrant', 'refugee', 'citizen',
    'citizenship', 'public', 'crowd', 'social media', 'socialize',
  ]],
  ['nature', [
    'nature', 'environment', 'plant', 'tree', 'flower', 'forest', 'ocean',
    'river', 'lake', 'mountain', 'desert', 'rain', 'climate', 'ecosystem',
    'wildlife', 'conservation', 'pollution', 'recycle', 'sustainable',
    'energy', 'renewable', 'carbon', 'green', 'landscape', 'scenery',
  ]],
  ['sports', [
    'sport', 'football', 'soccer', 'basketball', 'tennis', 'swim',
    'gym', 'athlete', 'coach', 'stadium', 'championship', 'tournament',
    'match', 'score', 'team', 'goal', 'referee', 'fitness', 'jogging',
    'running', 'cycling', 'marathon', 'yoga', 'gymnastics', 'volleyball',
  ]],
  ['family', [
    'family', 'parent', 'mother', 'father', 'sibling', 'brother', 'sister',
    'child', 'children', 'baby', 'grandparent', 'grandmother', 'grandfather',
    'marriage', 'wedding', 'husband', 'wife', 'couple', 'daughter', 'son',
    'relative', 'aunt', 'uncle', 'cousin', 'nephew', 'niece', 'twins',
  ]],
  ['business', [
    'business', 'company', 'enterprise', 'entrepreneur', 'startup', 'brand',
    'marketing', 'advertising', 'customer', 'product', 'service', 'revenue',
    'strategy', 'negotiate', 'contract', 'deal', 'partnership', 'franchise',
    'corporate', 'merger', 'acquisition', 'ceo', 'executive', 'board',
  ]],
  ['communication', [
    'communicate', 'communication', 'speak', 'speech', 'talk', 'converse',
    'discuss', 'debate', 'present', 'presentation', 'negotiate', 'persuade',
    'express', 'explain', 'describe', 'narrate', 'interview', 'lecture',
  ]],
  ['daily-life', [
    'daily', 'routine', 'schedule', 'morning', 'afternoon', 'evening',
    'night', 'habit', 'apartment', 'house', 'bedroom', 'bathroom', 'kitchen',
    'laundry', 'clean', 'chore', 'errand', 'grocery', 'commute', 'driver',
    'license', 'traffic', 'public transport', 'subway', 'bus', 'taxi',
  ]],
  ['creative', [
    'art', 'music', 'paint', 'draw', 'design', 'creative', 'photography',
    'fashion', 'style', 'craft', 'handmade', 'sculpture', 'gallery', 'museum',
    'concert', 'band', 'song', 'lyrics', 'poem', 'dance', 'theater', 'film',
  ]],
  ['science', [
    'science', 'research', 'experiment', 'hypothesis', 'theory', 'scientist',
    'laboratory', 'lab', 'data', 'analysis', 'discovery', 'physics', 'chemistry',
    'biology', 'mathematics', 'formula', 'equation', 'statistics', 'quantum',
    'genetic', 'evolution', 'cell', 'organism', 'species', 'astronomy',
  ]],
  ['law', [
    'law', 'legal', 'court', 'judge', 'lawyer', 'attorney', 'defendant',
    'plaintiff', 'witness', 'evidence', 'verdict', 'trial', 'jury', 'crime',
    'criminal', 'prison', 'jail', 'arrest', 'detain', 'charge', 'bail',
    'civil', 'rights', 'justice', 'statute', 'amendment',
  ]],
  ['politics', [
    'politics', 'political', 'government', 'president', 'minister', 'parliament',
    'congress', 'senate', 'election', 'vote', 'voter', 'campaign', 'policy',
    'democracy', 'republic', 'monarchy', 'diplomatic', 'ambassador', 'treaty',
  ]],
  ['shopping', [
    'shop', 'store', 'buy', 'purchase', 'mall', 'market', 'supermarket',
    'retail', 'sale', 'discount', 'coupon', 'price', 'budget', 'checkout',
    'cart', 'delivery', 'shipping', 'return', 'refund', 'brand', 'fashion',
    'clothing', 'shoes', 'electronics', 'furniture', 'groceries',
  ]],
  ['time', [
    'time', 'hour', 'minute', 'second', 'clock', 'watch', 'schedule',
    'appointment', 'meeting', 'yesterday', 'today', 'tomorrow', 'weekday',
    'weekend', 'month', 'year', 'decade', 'century', 'era', 'period',
    'moment', 'instant', 'dawn', 'dusk', 'midnight', 'noon', 'afternoon',
  ]],
  ['weather', [
    'weather', 'rain', 'sunny', 'cloudy', 'wind', 'storm', 'snow', 'hail',
    'fog', 'temperature', 'humid', 'climate', 'forecast', 'typhoon', 'flood',
    'drought', 'heatwave', 'breeze', 'thunder', 'lightning', 'umbrella',
  ]],
  ['animal', [
    'animal', 'pet', 'dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig',
    'chicken', 'sheep', 'goat', 'rabbit', 'wildlife', 'zoo', 'poultry',
    'livestock', 'insect', 'butterfly', 'bee', 'spider', 'snake', 'tiger',
  ]],
  ['place', [
    'city', 'town', 'village', 'country', 'state', 'province', 'region',
    'capital', 'metropolitan', 'urban', 'rural', 'suburb', 'district',
    'street', 'avenue', 'road', 'highway', 'bridge', 'park', 'square',
    'building', 'station', 'museum', 'library', 'hospital', 'airport',
  ]],
  ['color', [
    'color', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink',
    'black', 'white', 'gray', 'brown', 'paint', 'shade', 'hue', 'tone',
    'pigment', 'dye', 'rainbow', 'bright', 'dark', 'pale', 'vibrant',
  ]],
  ['number', [
    'number', 'digit', 'integer', 'fraction', 'percentage', 'percent', 'decimal',
    'sum', 'total', 'average', 'quantity', 'amount', 'count', 'figure',
    'statistics', 'graph', 'chart', 'data', 'measurement', 'distance', 'height',
  ]],
  ['personality', [
    'personality', 'character', 'trait', 'behavior', 'temperament', 'attitude',
    'introvert', 'extrovert', 'optimist', 'pessimist', 'confident', 'shy',
    'generous', 'greedy', 'loyal', 'stubborn', 'humorous', 'serious',
    'ambitious', 'creative', 'reliable', 'dishonest', 'brave', 'coward',
  ]],
  ['relationship', [
    'relationship', 'friend', 'enemy', 'colleague', 'mentor', 'mentee',
    'neighbor', 'partner', 'spouse', 'acquaintance',
    'collaboration', 'cooperation', 'trust', 'betrayal', 'loyalty', 'friendship',
  ]],
  ['communication-type', [
    'tone', 'manner', 'etiquette', 'politeness', 'rudeness', 'formal',
    'informal', 'slang', 'dialect', 'accent', 'vocabulary', 'body language',
    'gesture', 'facial expression', 'intonation', 'pitch', 'volume',
  ]],
  ['abstract', [
    'idea', 'concept', 'theory', 'philosophy', 'belief', 'value', 'principle',
    'freedom', 'justice', 'peace', 'war', 'conflict', 'power', 'authority',
    'responsibility', 'success', 'failure', 'purpose', 'meaning', 'exist',
  ]],
]

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
  return TAG_META[tag]?.color ?? '#9CA3AF'
}

export function getTagLabel(tag: string): string {
  return TAG_META[tag]?.label ?? tag
}
