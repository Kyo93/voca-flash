-- Migration: upsert_srs_record RPC
-- Atomic upsert for user_srs_records — no SELECT needed.

CREATE OR REPLACE FUNCTION upsert_srs_record(
  p_user_id UUID,
  p_word_id UUID,
  p_reps INTEGER,
  p_increment_lapse INTEGER,
  p_ease_factor FLOAT8,
  p_interval_days INTEGER,
  p_fsrs_stability FLOAT8,
  p_fsrs_difficulty FLOAT8,
  p_fsrs_state INTEGER,
  p_fsrs_scheduled_days INTEGER,
  p_fsrs_reps INTEGER,
  p_fsrs_lapses INTEGER,
  p_next_review_at TIMESTAMPTZ,
  p_mastered BOOLEAN,
  p_last_reviewed TIMESTAMPTZ,
  p_increment_wrong INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_srs_records (
    user_id, word_id,
    repetitions, lapse_count, ease_factor, interval_days,
    fsrs_stability, fsrs_difficulty, fsrs_state,
    fsrs_scheduled_days, fsrs_reps, fsrs_lapses,
    next_review_at, mastered, last_reviewed
  ) VALUES (
    p_user_id, p_word_id,
    p_reps,
    p_increment_lapse + COALESCE(p_increment_wrong, 0),
    p_ease_factor,
    p_interval_days,
    p_fsrs_stability, p_fsrs_difficulty, p_fsrs_state,
    p_fsrs_scheduled_days, p_fsrs_reps, p_fsrs_lapses,
    p_next_review_at, p_mastered, p_last_reviewed
  )
  ON CONFLICT (user_id, word_id) DO UPDATE SET
    repetitions = EXCLUDED.repetitions,
    lapse_count = GREATEST(user_srs_records.lapse_count, 0) + COALESCE(p_increment_wrong, 0),
    ease_factor = EXCLUDED.ease_factor,
    interval_days = EXCLUDED.interval_days,
    fsrs_stability = EXCLUDED.fsrs_stability,
    fsrs_difficulty = EXCLUDED.fsrs_difficulty,
    fsrs_state = EXCLUDED.fsrs_state,
    fsrs_scheduled_days = EXCLUDED.fsrs_scheduled_days,
    fsrs_reps = EXCLUDED.fsrs_reps,
    fsrs_lapses = EXCLUDED.fsrs_lapses,
    next_review_at = EXCLUDED.next_review_at,
    mastered = EXCLUDED.mastered,
    last_reviewed = EXCLUDED.last_reviewed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;