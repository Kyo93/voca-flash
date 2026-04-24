-- Migration 038: Extend get_user_vocabulary_v2 with topic, stability, and sort filters
-- Fixes: "Tất cả chủ đề", "Tất cả trạng thái", and "Sắp xếp" dropdowns in Kho từ vựng
-- Stability buckets align with src/lib/constants.ts → SRS_STABILITY_LEVELS
--   fresh:    stability < 3
--   learning: 3 <= stability < 21
--   mastered: 21 <= stability < 90
--   rooted:   stability >= 90

CREATE OR REPLACE FUNCTION get_user_vocabulary_v2(
    p_user_id uuid,
    p_limit int DEFAULT 50,
    p_offset int DEFAULT 0,
    p_search text DEFAULT '',
    p_filter text DEFAULT 'all',
    p_letter text DEFAULT '',
    p_topic_id uuid DEFAULT NULL,
    p_stability text DEFAULT '',
    p_sort_by text DEFAULT 'date'
)
RETURNS TABLE (
    word_id uuid,
    word text,
    definition text,
    phonetic text,
    image_url text,
    image_position text,
    mastered boolean,
    next_review_at timestamptz,
    last_reviewed timestamptz,
    fsrs_stability float,
    fsrs_difficulty float,
    fsrs_state integer,
    fsrs_reps integer,
    fsrs_lapses integer,
    is_orphaned boolean,
    topic_names text,
    total_count bigint
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
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
          AND (
            p_letter = '' OR
            (p_letter = '#' AND w.word ~ '^[^a-zA-Z]') OR
            (p_letter <> '#' AND w.word ILIKE p_letter || '%')
          )
          AND (
            p_topic_id IS NULL OR
            EXISTS (
                SELECT 1 FROM topic_words tw
                WHERE tw.word_id = s.word_id AND tw.topic_id = p_topic_id
            )
          )
          AND (
            p_stability = '' OR
            (p_stability = 'fresh'    AND COALESCE(s.fsrs_stability, 0) < 3) OR
            (p_stability = 'learning' AND COALESCE(s.fsrs_stability, 0) >= 3  AND COALESCE(s.fsrs_stability, 0) < 21) OR
            (p_stability = 'mastered' AND COALESCE(s.fsrs_stability, 0) >= 21 AND COALESCE(s.fsrs_stability, 0) < 90) OR
            (p_stability = 'rooted'   AND COALESCE(s.fsrs_stability, 0) >= 90)
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
    ORDER BY
        CASE WHEN p_sort_by = 'alphabetical' THEN fr.word END ASC,
        CASE WHEN p_sort_by = 'stability'    THEN fr.fsrs_stability END DESC,
        CASE WHEN p_sort_by = 'date'         THEN fr.created_at END DESC,
        fr.word ASC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Drop older overloads so PostgREST resolves to the new 9-arg signature unambiguously.
DROP FUNCTION IF EXISTS get_user_vocabulary_v2(uuid, int, int, text, text, text);
DROP FUNCTION IF EXISTS get_user_vocabulary_v2(uuid, integer, integer, text, text);
