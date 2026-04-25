-- 040_user_reward_progress.sql
-- Persistent EXP, levels, and medal progress for learner motivation.

CREATE TABLE IF NOT EXISTS user_reward_progress (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  study_xp INTEGER NOT NULL DEFAULT 0 CHECK (study_xp >= 0),
  review_xp INTEGER NOT NULL DEFAULT 0 CHECK (review_xp >= 0),
  arena_sessions INTEGER NOT NULL DEFAULT 0 CHECK (arena_sessions >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_reward_progress_total_xp
  ON user_reward_progress(total_xp DESC);

ALTER TABLE user_reward_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_full_user_reward_progress" ON user_reward_progress;
CREATE POLICY "admin_full_user_reward_progress" ON user_reward_progress
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "user_read_own_reward_progress" ON user_reward_progress;
CREATE POLICY "user_read_own_reward_progress" ON user_reward_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_insert_own_reward_progress" ON user_reward_progress;
CREATE POLICY "user_insert_own_reward_progress" ON user_reward_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_update_own_reward_progress" ON user_reward_progress;
CREATE POLICY "user_update_own_reward_progress" ON user_reward_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_user_reward_progress_updated_at ON user_reward_progress;
CREATE TRIGGER trg_user_reward_progress_updated_at
  BEFORE UPDATE ON user_reward_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION increment_user_reward_progress(
  p_user_id UUID,
  p_xp_delta INTEGER DEFAULT 0,
  p_study_xp_delta INTEGER DEFAULT 0,
  p_review_xp_delta INTEGER DEFAULT 0,
  p_arena_session_delta INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row user_reward_progress%ROWTYPE;
  v_xp_delta INTEGER := GREATEST(COALESCE(p_xp_delta, 0), 0);
  v_study_delta INTEGER := GREATEST(COALESCE(p_study_xp_delta, 0), 0);
  v_review_delta INTEGER := GREATEST(COALESCE(p_review_xp_delta, 0), 0);
  v_session_delta INTEGER := GREATEST(COALESCE(p_arena_session_delta, 0), 0);
BEGIN
  IF p_user_id <> auth.uid() AND NOT is_admin() THEN
    RAISE EXCEPTION 'Cannot update reward progress for another user';
  END IF;

  INSERT INTO user_reward_progress (
    user_id,
    total_xp,
    study_xp,
    review_xp,
    arena_sessions
  ) VALUES (
    p_user_id,
    v_xp_delta,
    v_study_delta,
    v_review_delta,
    v_session_delta
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = user_reward_progress.total_xp + EXCLUDED.total_xp,
    study_xp = user_reward_progress.study_xp + EXCLUDED.study_xp,
    review_xp = user_reward_progress.review_xp + EXCLUDED.review_xp,
    arena_sessions = user_reward_progress.arena_sessions + EXCLUDED.arena_sessions
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'user_id', v_row.user_id,
    'total_xp', v_row.total_xp,
    'study_xp', v_row.study_xp,
    'review_xp', v_row.review_xp,
    'arena_sessions', v_row.arena_sessions,
    'updated_at', v_row.updated_at
  );
END;
$$;
