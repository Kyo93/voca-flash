// Shared TypeScript interfaces — VocaFlash + Admin Panel

// ── Roadmap ────────────────────────────────────────────────
export interface Roadmap {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── Topic ───────────────────────────────────────────────────
export interface Topic {
  id: string
  roadmap_id: string | null
  name: string
  slug: string
  description: string | null
  image_url: string | null
  icon: string
  color: string
  sort_order: number
  created_at: string
  updated_at: string
}

// ── Word ───────────────────────────────────────────────────
export interface Word {
  id: string
  topic_id: string | null
  word: string
  phonetic: string | null
  pos: 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'other' | null
  difficulty: number // 1-5
  definition: string
  example: string | null
  example_vi: string | null
  created_at: string
  updated_at: string
  // Joined
  topics?: Pick<Topic, 'id' | 'name' | 'slug' | 'color'> | null
}

// ── Word Choice ─────────────────────────────────────────────
export interface WordChoice {
  id: string
  word_id: string
  choice: string
  sort: number // 1, 2, 3 (wrong options)
}

// ── User Profile ────────────────────────────────────────────
export interface UserProfile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  streak_days: number
  total_words: number
  created_at: string
  updated_at: string
}

// ── User Progress ───────────────────────────────────────────
export interface UserProgress {
  id: string
  user_id: string
  word_id: string
  correct_count: number
  wrong_count: number
  mastered: boolean
  last_reviewed: string | null
  created_at: string
  updated_at: string
}

// ── Admin User ───────────────────────────────────────────────
export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'superadmin'
  created_at: string
}

// ── Auth types ───────────────────────────────────────────────
export interface AuthSession {
  id: string
  email: string
}
