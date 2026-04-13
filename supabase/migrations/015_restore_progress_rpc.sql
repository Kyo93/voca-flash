-- Migration 015: Restore Progress Page RPC
-- Restores memory_health section missing from the current database version

CREATE OR REPLACE FUNCTION get_progress_page_data(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_boundary TIMESTAMPTZ := get_today_boundary();
    v_mem_health JSON;
    v_roadmap_progress JSON;
    v_overall JSON;
BEGIN
    -- 1. Memory Health (Now using FSRS fields)
    SELECT json_build_object(
        'learning', COUNT(*) FILTER (WHERE mastered = false AND (fsrs_reps > 0 OR fsrs_lapses > 0)),
        'new_today', COUNT(*) FILTER (WHERE created_at >= v_boundary),
        'mastered', COUNT(*) FILTER (WHERE mastered = true),
        'mastered_today', COUNT(*) FILTER (WHERE mastered = true AND last_reviewed >= v_boundary),
        'due', COUNT(*) FILTER (WHERE mastered = false AND next_review_at <= NOW()),
        'orphaned', (
            SELECT COUNT(*) 
            FROM user_srs_records s 
            LEFT JOIN topic_words tw ON tw.word_id = s.word_id 
            WHERE s.user_id = p_user_id AND tw.topic_id IS NULL
        ),
        'weak', COUNT(*) FILTER (WHERE mastered = false AND fsrs_lapses > 2)
    ) INTO v_mem_health
    FROM user_srs_records
    WHERE user_id = p_user_id;

    -- 2. Roadmap Progress
    SELECT json_agg(rm) INTO v_roadmap_progress
    FROM (
        SELECT 
            r.id,
            r.name,
            r.slug,
            COUNT(DISTINCT tw.word_id) as total,
            COUNT(DISTINCT s.word_id) FILTER (WHERE s.mastered = true) as mastered,
            CASE 
                WHEN COUNT(DISTINCT tw.word_id) > 0 
                THEN ROUND((COUNT(DISTINCT s.word_id) FILTER (WHERE s.mastered = true)::FLOAT / COUNT(DISTINCT tw.word_id)) * 100)
                ELSE 0 
            END as percent
        FROM roadmaps r
        JOIN topics t ON t.roadmap_id = r.id
        JOIN topic_words tw ON tw.topic_id = t.id
        LEFT JOIN user_srs_records s ON s.word_id = tw.word_id AND s.user_id = p_user_id
        WHERE r.is_active = true
        GROUP BY r.id, r.name, r.slug
        ORDER BY r.created_at
    ) rm;

    -- 3. Overall Stats
    SELECT json_build_object(
        'streak_days', COALESCE(streak_days, 0),
        'total_mastered', (SELECT COUNT(*) FROM user_srs_records WHERE user_id = p_user_id AND mastered = true)
    ) INTO v_overall
    FROM user_profiles
    WHERE id = p_user_id;

    RETURN json_build_object(
        'memory_health', COALESCE(v_mem_health, json_build_object(
            'learning',0, 'new_today',0, 'mastered',0, 'mastered_today',0, 'due',0, 'orphaned',0, 'weak',0
        )),
        'roadmap_progress', COALESCE(v_roadmap_progress, '[]'::JSON),
        'overall_stats', COALESCE(v_overall, json_build_object('streak_days', 0, 'total_mastered', 0))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
