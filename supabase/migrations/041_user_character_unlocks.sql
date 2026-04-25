-- 041_user_character_unlocks.sql
-- Spendable EXP wallet and collectible character unlocks.

ALTER TABLE user_reward_progress
  ADD COLUMN IF NOT EXISTS spent_xp INTEGER NOT NULL DEFAULT 0 CHECK (spent_xp >= 0),
  ADD COLUMN IF NOT EXISTS selected_character_id TEXT;

CREATE TABLE IF NOT EXISTS user_character_unlocks (
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, character_id)
);

CREATE INDEX IF NOT EXISTS idx_user_character_unlocks_user_id
  ON user_character_unlocks(user_id);

ALTER TABLE user_character_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_full_user_character_unlocks" ON user_character_unlocks;
CREATE POLICY "admin_full_user_character_unlocks" ON user_character_unlocks
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "user_read_own_character_unlocks" ON user_character_unlocks;
CREATE POLICY "user_read_own_character_unlocks" ON user_character_unlocks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_insert_own_character_unlocks" ON user_character_unlocks;
CREATE POLICY "user_insert_own_character_unlocks" ON user_character_unlocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION unlock_user_character(
  p_user_id UUID,
  p_character_id TEXT,
  p_cost_xp INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_progress user_reward_progress%ROWTYPE;
  v_cost INTEGER := GREATEST(COALESCE(p_cost_xp, 0), 0);
  v_inserted BOOLEAN := FALSE;
BEGIN
  IF p_user_id <> auth.uid() AND NOT is_admin() THEN
    RAISE EXCEPTION 'Cannot unlock character for another user';
  END IF;

  IF COALESCE(p_character_id, '') = '' THEN
    RAISE EXCEPTION 'Character id is required';
  END IF;

  INSERT INTO user_reward_progress (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT *
  INTO v_progress
  FROM user_reward_progress
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT EXISTS (
    SELECT 1
    FROM user_character_unlocks
    WHERE user_id = p_user_id
      AND character_id = p_character_id
  ) THEN
    IF (v_progress.total_xp - v_progress.spent_xp) < v_cost THEN
      RAISE EXCEPTION 'Not enough available XP';
    END IF;

    INSERT INTO user_character_unlocks (user_id, character_id)
    VALUES (p_user_id, p_character_id);

    UPDATE user_reward_progress
    SET spent_xp = spent_xp + v_cost,
        selected_character_id = COALESCE(selected_character_id, p_character_id)
    WHERE user_id = p_user_id
    RETURNING * INTO v_progress;

    v_inserted := TRUE;
  END IF;

  RETURN jsonb_build_object(
    'inserted', v_inserted,
    'reward_progress', jsonb_build_object(
      'user_id', v_progress.user_id,
      'total_xp', v_progress.total_xp,
      'study_xp', v_progress.study_xp,
      'review_xp', v_progress.review_xp,
      'spent_xp', v_progress.spent_xp,
      'arena_sessions', v_progress.arena_sessions,
      'selected_character_id', v_progress.selected_character_id,
      'updated_at', v_progress.updated_at
    ),
    'unlocked_character_ids', (
      SELECT COALESCE(jsonb_agg(character_id ORDER BY unlocked_at), '[]'::jsonb)
      FROM user_character_unlocks
      WHERE user_id = p_user_id
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION select_user_character(
  p_user_id UUID,
  p_character_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_progress user_reward_progress%ROWTYPE;
BEGIN
  IF p_user_id <> auth.uid() AND NOT is_admin() THEN
    RAISE EXCEPTION 'Cannot select character for another user';
  END IF;

  IF COALESCE(p_character_id, '') = '' THEN
    RAISE EXCEPTION 'Character id is required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM user_character_unlocks
    WHERE user_id = p_user_id
      AND character_id = p_character_id
  ) AND p_character_id <> 'seedling_scholar' THEN
    RAISE EXCEPTION 'Character is not unlocked';
  END IF;

  INSERT INTO user_reward_progress (user_id, selected_character_id)
  VALUES (p_user_id, p_character_id)
  ON CONFLICT (user_id) DO UPDATE SET
    selected_character_id = EXCLUDED.selected_character_id
  RETURNING * INTO v_progress;

  RETURN jsonb_build_object(
    'reward_progress', jsonb_build_object(
      'user_id', v_progress.user_id,
      'total_xp', v_progress.total_xp,
      'study_xp', v_progress.study_xp,
      'review_xp', v_progress.review_xp,
      'spent_xp', v_progress.spent_xp,
      'arena_sessions', v_progress.arena_sessions,
      'selected_character_id', v_progress.selected_character_id,
      'updated_at', v_progress.updated_at
    )
  );
END;
$$;
