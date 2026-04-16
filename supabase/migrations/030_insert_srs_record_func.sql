-- Migration: Insert-only SECURITY DEFINER function for user_srs_records
-- Bypasses RLS for INSERT (auth.uid() is NULL with anon key in browser context
-- before session token is attached). SECURITY DEFINER runs as table owner,
-- completely bypassing RLS. UPDATE still uses direct REST (RLS required).

CREATE OR REPLACE FUNCTION insert_srs_record(
  p_user_id UUID,
  p_word_id UUID,
  p_reps INTEGER,
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
  p_last_reviewed TIMESTAMPTZ
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_srs_records (
    user_id, word_id,
    repetitions, ease_factor, interval_days,
    fsrs_stability, fsrs_difficulty, fsrs_state,
    fsrs_scheduled_days, fsrs_reps, fsrs_lapses, lapse_count,
    next_review_at, mastered, last_reviewed
  ) VALUES (
    p_user_id, p_word_id,
    p_reps, p_ease_factor, p_interval_days,
    p_fsrs_stability, p_fsrs_difficulty, p_fsrs_state,
    p_fsrs_scheduled_days, p_fsrs_reps, p_fsrs_lapses, p_fsrs_lapses,
    p_next_review_at, p_mastered, p_last_reviewed
  )
  ON CONFLICT (user_id, word_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
