-- 036_fix_retention_logging.sql
-- Fix: Only log into user_review_logs when a word is actually being REVIEWED, not when it is being learned for the first time.
-- This prevents the Retention Rate from showing 100% just because a user clicked "Mark Learned" on new words.

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
    -- Lấy trạng thái trước đó để ghi log
    SELECT fsrs_stability, fsrs_difficulty, 
           EXTRACT(DAY FROM (NOW() - last_reviewed))::INTEGER,
           fsrs_state
    INTO v_stability_before, v_difficulty_before, v_elapsed_days, v_state_before
    FROM user_srs_records
    WHERE user_id = p_user_id AND word_id = p_word_id;

    -- 1. Upsert bảng chính
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

    -- 2. Ghi log lịch sử (CHỈ ghi khi từ này không phải là từ Mới)
    -- v_state_before IS NULL -> Từ chưa từng học
    -- v_state_before = 0 -> Từ ở trạng thái New
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
