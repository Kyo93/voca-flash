-- Migration 012: Fix Mastery Stats & Vocabulary Joins
-- Switch to LEFT JOIN to ensure orphaned or new-topic cards are visible.
-- Align stats calculation with FSRS fields.

-- 1. Redefine get_mastery_stats
CREATE OR REPLACE FUNCTION get_mastery_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_total INT;
    v_mastered INT;
    v_learning INT;
    v_due INT;
    v_orphaned INT;
    v_weak INT;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE mastered = true),
        COUNT(*) FILTER (WHERE mastered = false AND fsrs_reps > 0),
        COUNT(*) FILTER (WHERE mastered = false AND next_review_at <= NOW()),
        (
            SELECT COUNT(*) 
            FROM user_srs_records s 
            LEFT JOIN topic_words tw ON tw.word_id = s.word_id 
            WHERE s.user_id = p_user_id AND tw.topic_id IS NULL
        ),
        COUNT(*) FILTER (WHERE fsrs_difficulty > 0.8) -- Consider difficulty > 0.8 as 'weak' in FSRS
    INTO v_total, v_mastered, v_learning, v_due, v_orphaned, v_weak
    FROM user_srs_records 
    WHERE user_id = p_user_id;

    RETURN json_build_object(
        'total', COALESCE(v_total, 0),
        'mastered', COALESCE(v_mastered, 0),
        'learning', COALESCE(v_learning, 0),
        'due', COALESCE(v_due, 0),
        'orphaned', COALESCE(v_orphaned, 0),
        'weak', COALESCE(v_weak, 0)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Redefine get_user_vocabulary_v2 with Pagination & Search
CREATE OR REPLACE FUNCTION get_user_vocabulary_v2(
    p_user_id UUID,
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0,
    p_search TEXT DEFAULT '',
    p_filter TEXT DEFAULT 'all'
)
RETURNS TABLE (
    word_id UUID,
    word TEXT,
    definition TEXT,
    phonetic TEXT,
    image_url TEXT,
    image_position TEXT,
    mastered BOOLEAN,
    next_review_at TIMESTAMPTZ,
    last_reviewed TIMESTAMPTZ,
    fsrs_stability FLOAT,
    fsrs_difficulty FLOAT,
    fsrs_state INTEGER,
    fsrs_reps INTEGER,
    fsrs_lapses INTEGER,
    is_orphaned BOOLEAN,
    topic_names TEXT,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_records AS (
        SELECT 
            s.*,
            w.word,
            w.definition,
            w.phonetic,
            w.image_url,
            w.image_position
        FROM user_srs_records s
        JOIN words w ON w.id = s.word_id
        WHERE s.user_id = p_user_id
          AND (
            p_search = '' OR 
            w.word ILIKE '%' || p_search || '%' OR 
            w.definition ILIKE '%' || p_search || '%'
          )
          AND (
            p_filter = 'all' OR
            (p_filter = 'due' AND s.mastered = false AND s.next_review_at <= NOW()) OR
            (p_filter = 'weak' AND s.fsrs_difficulty > 0.8) OR
            (p_filter = 'mastered' AND s.mastered = true) OR
            (p_filter = 'orphaned' AND NOT EXISTS (SELECT 1 FROM topic_words tw WHERE tw.word_id = s.word_id))
          )
    )
    SELECT 
        fr.word_id,
        fr.word,
        fr.definition,
        fr.phonetic,
        fr.image_url,
        fr.image_position,
        fr.mastered,
        fr.next_review_at,
        fr.last_reviewed,
        fr.fsrs_stability,
        fr.fsrs_difficulty,
        fr.fsrs_state,
        fr.fsrs_reps,
        fr.fsrs_lapses,
        (NOT EXISTS (SELECT 1 FROM topic_words tw WHERE tw.word_id = fr.word_id)) AS is_orphaned,
        (
            SELECT string_agg(t.name, ', ')
            FROM topic_words tw
            JOIN topics t ON t.id = tw.topic_id
            WHERE tw.word_id = fr.word_id
        ) AS topic_names,
        COUNT(*) OVER() AS total_count
    FROM filtered_records fr
    ORDER BY fr.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
