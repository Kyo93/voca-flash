-- ============================================================
-- voca-flash-admin: Initial Schema
-- Created: 2026-04-11
-- Tables: roadmaps, topics, words, word_choices,
--         user_profiles, user_progress, admin_users
-- ============================================================

-- ── 1. ROADMAPS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmaps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. TOPICS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS topics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id  UUID REFERENCES roadmaps(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  icon        TEXT DEFAULT '📚',
  color       TEXT DEFAULT '#F97316',   -- terracotta default
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. WORDS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS words (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id    UUID REFERENCES topics(id) ON DELETE SET NULL,
  word        TEXT NOT NULL,
  phonetic    TEXT,
  pos         TEXT CHECK (pos IN ('noun','verb','adj','adv','phrase','other')),
  difficulty  SMALLINT CHECK (difficulty BETWEEN 1 AND 5) DEFAULT 3,
  definition  TEXT NOT NULL,
  example     TEXT,
  example_vi  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 4. WORD CHOICES (wrong answers) ──────────────────────────
CREATE TABLE IF NOT EXISTS word_choices (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id  UUID REFERENCES words(id) ON DELETE CASCADE,
  choice   TEXT NOT NULL,
  sort     SMALLINT NOT NULL DEFAULT 1  -- 1, 2, 3 (3 wrong options)
);

-- ── 5. USER PROFILES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  display_name TEXT,
  avatar_url  TEXT,
  streak_days INTEGER NOT NULL DEFAULT 0,
  total_words INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 6. USER PROGRESS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  word_id         UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  correct_count   INTEGER NOT NULL DEFAULT 0,
  wrong_count     INTEGER NOT NULL DEFAULT 0,
  mastered        BOOLEAN NOT NULL DEFAULT false,
  last_reviewed   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, word_id)
);

-- ── 7. ADMIN USERS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'admin'
                CHECK (role IN ('superadmin', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_topics_roadmap   ON topics(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_words_topic       ON words(topic_id);
CREATE INDEX IF NOT EXISTS idx_word_choices_word ON word_choices(word_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_word ON user_progress(word_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_mastered ON user_progress(mastered);

-- ============================================================
-- AUTO-UPDATE updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_roadmaps_updated_at
  BEFORE UPDATE ON roadmaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_words_updated_at
  BEFORE UPDATE ON words
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Auto-create user_profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE roadmaps         ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics            ENABLE ROW LEVEL SECURITY;
ALTER TABLE words             ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_choices      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users       ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: check if current user is authenticated
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
  SELECT auth.uid() IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER;

-- ── roadmaps ──
CREATE POLICY "admin_full_roadmaps" ON roadmaps
  FOR ALL USING (is_admin());

CREATE POLICY "student_read_roadmaps" ON roadmaps
  FOR SELECT USING (true);

-- ── topics ──
CREATE POLICY "admin_full_topics" ON topics
  FOR ALL USING (is_admin());

CREATE POLICY "student_read_topics" ON topics
  FOR SELECT USING (true);

-- ── words ──
CREATE POLICY "admin_full_words" ON words
  FOR ALL USING (is_admin());

CREATE POLICY "student_read_words" ON words
  FOR SELECT USING (true);

-- ── word_choices ──
CREATE POLICY "admin_full_word_choices" ON word_choices
  FOR ALL USING (is_admin());

CREATE POLICY "student_read_word_choices" ON word_choices
  FOR SELECT USING (true);

-- ── user_profiles: admin sees all, user sees own ──
CREATE POLICY "admin_full_user_profiles" ON user_profiles
  FOR ALL USING (is_admin());

CREATE POLICY "user_read_own_profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "user_update_own_profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ── user_progress: admin sees all, user sees own ──
CREATE POLICY "admin_full_user_progress" ON user_progress
  FOR ALL USING (is_admin());

CREATE POLICY "user_crud_own_progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

-- ── admin_users: only admin can see/manage ──
CREATE POLICY "admin_only_admin_users" ON admin_users
  FOR ALL USING (is_admin());
