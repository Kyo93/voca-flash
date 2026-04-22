-- Update get_user_vocabulary_v2 to support p_letter filtering
CREATE OR REPLACE FUNCTION get_user_vocabulary_v2(
    p_user_id uuid,
    p_limit int DEFAULT 50,
    p_offset int DEFAULT 0,
    p_search text DEFAULT '',
    p_filter text DEFAULT 'all',
    p_letter text DEFAULT ''
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
    ORDER BY fr.word ASC, fr.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;
