-- 043_default_character_evolution.sql
-- Ensure the always-unlocked starter character can persist evolution state.

CREATE OR REPLACE FUNCTION evolve_user_character(
  p_user_id UUID,
  p_character_id TEXT,
  p_target_stage INTEGER,
  p_cost_xp INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_progress user_reward_progress%ROWTYPE;
  v_unlock user_character_unlocks%ROWTYPE;
  v_cost INTEGER := GREATEST(COALESCE(p_cost_xp, 0), 0);
BEGIN
  IF p_user_id <> auth.uid() AND NOT is_admin() THEN
    RAISE EXCEPTION 'Cannot evolve character for another user';
  END IF;

  IF COALESCE(p_character_id, '') = '' THEN
    RAISE EXCEPTION 'Character id is required';
  END IF;

  IF COALESCE(p_target_stage, 0) < 1 THEN
    RAISE EXCEPTION 'Target stage is invalid';
  END IF;

  INSERT INTO user_reward_progress (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT *
  INTO v_progress
  FROM user_reward_progress
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF p_character_id = 'seedling_scholar' THEN
    INSERT INTO user_character_unlocks (user_id, character_id)
    VALUES (p_user_id, p_character_id)
    ON CONFLICT (user_id, character_id) DO NOTHING;
  END IF;

  SELECT *
  INTO v_unlock
  FROM user_character_unlocks
  WHERE user_id = p_user_id
    AND character_id = p_character_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Character is not unlocked';
  END IF;

  IF p_target_stage <= v_unlock.current_stage THEN
    RETURN jsonb_build_object(
      'inserted', false,
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
      'unlocked_characters', (
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
          'character_id', character_id,
          'current_stage', current_stage,
          'evolution_spent_xp', evolution_spent_xp
        ) ORDER BY unlocked_at), '[]'::jsonb)
        FROM user_character_unlocks
        WHERE user_id = p_user_id
      )
    );
  END IF;

  IF p_target_stage <> v_unlock.current_stage + 1 THEN
    RAISE EXCEPTION 'Characters must evolve one stage at a time';
  END IF;

  IF (v_progress.total_xp - v_progress.spent_xp) < v_cost THEN
    RAISE EXCEPTION 'Not enough available XP';
  END IF;

  UPDATE user_reward_progress
  SET spent_xp = spent_xp + v_cost
  WHERE user_id = p_user_id
  RETURNING * INTO v_progress;

  UPDATE user_character_unlocks
  SET current_stage = p_target_stage,
      evolution_spent_xp = evolution_spent_xp + v_cost,
      evolved_at = now()
  WHERE user_id = p_user_id
    AND character_id = p_character_id
  RETURNING * INTO v_unlock;

  RETURN jsonb_build_object(
    'inserted', true,
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
    'unlocked_characters', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'character_id', character_id,
        'current_stage', current_stage,
        'evolution_spent_xp', evolution_spent_xp
      ) ORDER BY unlocked_at), '[]'::jsonb)
      FROM user_character_unlocks
      WHERE user_id = p_user_id
    )
  );
END;
$$;
