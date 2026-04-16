-- Migration: Fix RLS on user_srs_records
-- Root cause: user_srs_records inherited RLS from user_progress (all disabled)
-- but has no policies for INSERT/UPDATE. RPC upsert_srs_record is fire-and-forget
-- so errors are silently swallowed — records silently never saved.

-- 1. Ensure RLS is enabled on user_srs_records
ALTER TABLE user_srs_records ENABLE ROW LEVEL SECURITY;

-- 2. Create comprehensive RLS policy for user_srs_records
--    Matches the pattern of user_resume_pointers (006_user_learning_state.sql)
CREATE POLICY "user_full_srs_records"
  ON user_srs_records
  FOR ALL
  USING (auth.uid() = user_id);

-- 3. Create a fallback for anonymous/guest users (if any future guest mode is added)
--    Currently all users are authenticated, so this is a no-op but documents intent.
CREATE POLICY "anon_read_srs_records"
  ON user_srs_records
  FOR SELECT
  USING (auth.uid() IS NULL AND false); -- always false for now, no guest mode
