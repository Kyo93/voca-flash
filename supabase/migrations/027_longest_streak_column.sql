-- supabase/migrations/027_longest_streak_column.sql
-- Add longest_streak column to track streak record.
-- recordStreak in auth.ts will update this when newStreak > current longest.

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 1;

-- Backfill: set longest_streak = streak_days for existing users
UPDATE user_profiles
SET longest_streak = COALESCE(streak_days, 1)
WHERE longest_streak IS NULL OR longest_streak < COALESCE(streak_days, 1);
