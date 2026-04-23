-- 037_cleanup_duplicate_rpc.sql
-- Drop duplicate versions of upsert_srs_record_v2 to resolve status 300 (Multiple Choices) error.

-- 1. Drop the ambiguous version where p_rating is at the 3rd position
DROP FUNCTION IF EXISTS upsert_srs_record_v2(
    uuid, uuid, integer, integer, integer, double precision, double precision, integer, integer, timestamptz, boolean, timestamptz, integer
);

-- 2. Drop the canonical version to recreate it cleanly
DROP FUNCTION IF EXISTS upsert_srs_record_v2(
    uuid, uuid, integer, integer, double precision, double precision, integer, integer, timestamptz, boolean, timestamptz, integer, integer
);

-- 3. Recreate the canonical version (matching migration 036 but ensuring it's the only one)
CREATE OR REPLACE FUNCTION upsert_srs_record_v2(
    p_user_id UUID,
    p_word_id UUID,
    p_reps INTEGER,
    p_lapse_count INTEGER,
    p_stability FLOAT8,
    p_difficulty FLOAT8,
    p_state INTEGER,
    p_scheduled_days INTEGER,
    p_next_review_at TIMESTAMPTZ,
    p_mastered BOOLEAN,
    p_last_reviewed TIMESTAMPTZ,
    p_rating INTEGER DEFAULT 0,
    p_review_duration_ms INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_stability_before FLOAT8;
    v_difficulty_before FLOAT8;
    v_elapsed_days INTEGER;
    v_state_before INTEGER;
BEGIN
    -- Get previous state for logging
    SELECT fsrs_stability, fsrs_difficulty, 
           EXTRACT(DAY FROM (NOW() - last_reviewed))::INTEGER,
           fsrs_state
    INTO v_stability_before, v_difficulty_before, v_elapsed_days, v_state_before
    FROM user_srs_records
    WHERE user_id = p_user_id AND word_id = p_word_id;

    -- 1. Upsert main table
    INSERT INTO user_srs_records (
        user_id, word_id, repetitions, lapse_count, 
        fsrs_stability, fsrs_difficulty, fsrs_state,
        fsrs_scheduled_days, fsrs_reps, fsrs_lapses,
        next_review_at, mastered, last_reviewed
    ) VALUES (
        p_user_id, p_word_id, p_reps, p_lapse_count,
        p_stability, p_difficulty, p_state,
        p_scheduled_days, p_reps, p_lapse_count,
        p_next_review_at, p_mastered, p_last_reviewed
    )
    ON CONFLICT (user_id, word_id) DO UPDATE SET
        repetitions = EXCLUDED.repetitions,
        lapse_count = EXCLUDED.lapse_count,
        fsrs_stability = EXCLUDED.fsrs_stability,
        fsrs_difficulty = EXCLUDED.fsrs_difficulty,
        fsrs_state = EXCLUDED.fsrs_state,
        fsrs_scheduled_days = EXCLUDED.fsrs_scheduled_days,
        fsrs_reps = EXCLUDED.fsrs_reps,
        fsrs_lapses = EXCLUDED.fsrs_lapses,
        next_review_at = EXCLUDED.next_review_at,
        mastered = EXCLUDED.mastered,
        last_reviewed = EXCLUDED.last_reviewed;

    -- 2. Log history (Only if rating > 0 AND it's not a brand new word)
    -- This matches FSRS logic: first learning attempt usually doesn't count towards retention metrics
    IF p_rating > 0 AND v_state_before IS NOT NULL AND v_state_before > 0 THEN
        INSERT INTO user_review_logs (
            user_id, word_id, rating,
            stability_before, difficulty_before,
            stability_after, difficulty_after,
            elapsed_days, scheduled_days,
            review_duration_ms
        ) VALUES (
            p_user_id, p_word_id, p_rating,
            v_stability_before, v_difficulty_before,
            p_stability, p_difficulty,
            v_elapsed_days, p_scheduled_days,
            p_review_duration_ms
        );
    END IF;
END;
$$;
