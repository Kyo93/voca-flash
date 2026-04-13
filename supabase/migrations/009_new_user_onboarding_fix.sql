-- Migration 009: New User Onboarding Fix
-- Fixes: Missing INSERT policy + ensures handle_new_user trigger exists
-- Created: 2026-04-13

-- ═══════════════════════════════════════════════════════════
-- 1. ENSURE handle_new_user TRIGGER EXISTS
-- (In case 001 was not fully applied to cloud)
-- ═══════════════════════════════════════════════════════════

-- Drop existing trigger if exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, daily_target, theme_mode)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    20,          -- default daily_target
    'light'      -- default theme_mode
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════
-- 2. ADD MISSING INSERT POLICY FOR user_profiles
-- (Allows app code to upsert profile if trigger somehow misses)
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "user_insert_own_profile" ON user_profiles;

CREATE POLICY "user_insert_own_profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════
-- 3. ADD last_study_date COLUMN (referenced by recordStreak)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS last_study_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS daily_words_studied INTEGER DEFAULT 0;
