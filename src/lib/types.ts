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
  word: string
  phonetic: string | null
  pos: 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'other' | null
  difficulty: number // 1-5
  definition: string
  example: string | null
  example_vi: string | null
  image_url: string | null
  image_position: string | null // CSS object-position: 'center' | 'top' | 'bottom'
  tags: string[]           // ← semantic tags auto-assigned by rule engine
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
  // Settings
  daily_target: number
  srs_intensity: number
  tts_voice: string | null
  tts_rate: number
  auto_play_audio: boolean
  app_language: string
  theme_mode: string
  last_study_date: string | null
  created_at: string
  updated_at: string
}

// ── User Resume Pointer ─────────────────────────────────────
export interface ResumePointer {
  id: string
  user_id: string
  roadmap_id: string
  last_topic_id: string | null
  last_accessed_at: string
}

// ── User SRS Record ───────────────────────────────────────────
export interface SrsRecord {
  id: string
  user_id: string
  word_id: string
  repetitions: number
  lapse_count: number
  ease_factor: number
  interval_days: number
  // FSRS fields
  fsrs_stability: number
  fsrs_difficulty: number
  fsrs_state: number
  fsrs_scheduled_days: number
  fsrs_reps: number
  fsrs_lapses: number
  // Shared fields
  next_review_at: string | null
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

// ── Mastery Vault Types ─────────────────────────────────────
// NOTE: These fields match get_user_vocabulary_v2 return shape.
// Fields from old v1 (pos, ease_factor, interval_days, repetitions,
// lapse_count, first_encountered, example_vi) are intentionally
// excluded — v2 does not return them.
export interface MasteryWord {
  word_id: string
  word: string
  definition: string
  phonetic: string | null
  image_url: string | null
  example: string | null
  // FSRS fields
  fsrs_stability: number
  fsrs_difficulty: number
  fsrs_state: number
  fsrs_reps: number
  fsrs_lapses: number
  // Shared
  next_review_at: string | null
  last_reviewed: string | null
  mastered: boolean
  is_orphaned: boolean
  topic_names: string | null
}

// ── Data Transfer Objects (DTOs) ──────────────────────────

export interface InitialAppData {
  profile: UserProfile | null
  stats: {
    total_words: number
    mastered: number
    learning: number
  }
  health: {
    retention_rate: number
    avg_stability: number
    new_today: number
    due_today: number
    stability_distribution: {
      fresh: number
      stable: number
      rooted: number
    }
    forecast: number[]
  }
  active_roadmap: {
    id: string
    slug: string
  } | null
  global_review_count: number
}

export interface ProgressPageData {
  memory_health: {
    learning: number
    new_today: number
    mastered: number
    mastered_today: number
    due: number
    orphaned: number
    weak: number
  }
  roadmap_progress: {
    id: string
    name: string
    slug: string
    total: number
    mastered: number
    percent: number
  }[]
  overall_stats: {
    streak_days: number
    total_mastered: number
  }
}

export interface LibraryPageData {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  total_words: number
  mastered_count: number
  resume_state: {
    last_topic_id: string
    last_accessed_at: string
  } | null
}

export interface DashboardSummary {
  resumeTopic: Topic | null
  fallbackTopics: Topic[]
  globalReviewCount: number
}

export interface MasteryStats {
  total: number
  mastered: number
  due: number
  weak: number
  orphaned: number
  learning: number
  streak_days?: number
}

// ── Batch Import Types ───────────────────────────────────
export interface BatchInsertResult {
  inserted: number
  errors: { word: string; error: string }[]
}

export interface NormalizedWord {
  word: string
  phonetic: string | null
  pos: Word['pos']
  difficulty: number
  definition: string
  example: string | null
  example_vi: string | null
  image_url: string | null
  image_position: string
  topicIds: string[]
  wrongChoices: string[]
  status: 'new' | 'duplicate' | 'invalid'
  duplicateAction?: 'keep' | 'update' | 'skip'
  validationErrors?: string[]
  unmatchedTopics?: string[]
}

export interface RawRow {
  word?: string
  phonetic?: string
  pos?: string
  difficulty?: string
  definition?: string
  example?: string
  example_vi?: string
  image_url?: string
  topics?: string
  wrong1?: string
  wrong2?: string
  wrong3?: string
  [key: string]: string | undefined
}
