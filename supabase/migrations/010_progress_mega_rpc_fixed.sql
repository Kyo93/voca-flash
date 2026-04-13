-- Migration 010: Progress Mega RPCs (Refixed & Aligned)
-- Re-defines get_initial_app_data and get_progress_page_data
-- Uses user_srs_records and implements protective null-handling

-- ── 1. HELPERS ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_today_boundary()
RETURNS TIMESTAMPTZ AS $$
BEGIN
  -- Logic matches getTodayBoundary() in TS: 4 AM reset.
  -- Subtracting 4 hours from local time, then truncating to day, then adding 4 hours.
  -- Alternatively, just shift the current time by -4 hours and compare with date.
  RETURN (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh' - INTERVAL '4 hours')::DATE + INTERVAL '4 hours';
END;
$$ LANGUAGE plpgsql STABLE;

-- ── 2. GET INITIAL APP DATA ──────────────────────────────────
CREATE OR REPLACE FUNCTION get_initial_app_data(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_profile RECORD;
    v_total_words INT;
    v_mastered INT;
    v_learning INT;
    v_active_roadmap RECORD;
    v_due_count INT;
BEGIN
    -- 1. Get profile
    SELECT * INTO v_profile FROM user_profiles WHERE id = p_user_id;
    
    -- 2. Stats from user_srs_records
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE mastered = true),
        COUNT(*) FILTER (WHERE mastered = false AND (repetitions > 0 OR lapse_count > 0))
    INTO v_total_words, v_mastered, v_learning
    FROM user_srs_records 
    WHERE user_id = p_user_id;

    -- 3. Active Roadmap (Last accessed)
    SELECT r.id, r.slug INTO v_active_roadmap
    FROM user_resume_pointers urp
    JOIN roadmaps r ON r.id = urp.roadmap_id
    WHERE urp.user_id = p_user_id
    ORDER BY urp.last_accessed_at DESC
    LIMIT 1;

    -- 4. Global Review Count
    SELECT COUNT(*) INTO v_due_count
    FROM user_srs_records
    WHERE user_id = p_user_id
      AND mastered = false
      AND next_review_at <= NOW();

    RETURN json_build_object(
        'profile', row_to_json(v_profile),
        'stats', json_build_object(
            'total_words', COALESCE(v_total_words, 0),
            'mastered', COALESCE(v_mastered, 0),
            'learning', COALESCE(v_learning, 0)
        ),
        'active_roadmap', CASE WHEN v_active_roadmap.id IS NOT NULL 
            THEN json_build_object('id', v_active_roadmap.id, 'slug', v_active_roadmap.slug)
            ELSE NULL END,
        'global_review_count', COALESCE(v_due_count, 0)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. GET PROGRESS PAGE DATA ───────────────────────────────
CREATE OR REPLACE FUNCTION get_progress_page_data(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_boundary TIMESTAMPTZ := get_today_boundary();
    v_mem_health JSON;
    v_roadmap_progress JSON;
    v_overall JSON;
BEGIN
    -- 1. Memory Health
    SELECT json_build_object(
        'learning', COUNT(*) FILTER (WHERE mastered = false AND (repetitions > 0 OR lapse_count > 0)),
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
        'weak', COUNT(*) FILTER (WHERE mastered = false AND lapse_count > 2)
    ) INTO v_mem_health
    FROM user_srs_records
    WHERE user_id = p_user_id;

    -- 2. Roadmap Progress
    -- Aggregates total words and mastered words per roadmap for the current user
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

-- ── 4. GET LIBRARY PAGE DATA ───────────────────────────────
CREATE OR REPLACE FUNCTION get_library_page_data(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_agg(lp)
        FROM (
            SELECT 
                r.id,
                r.name,
                r.slug,
                r.description,
                r.image_url,
                COUNT(DISTINCT tw.word_id) as total_words,
                COUNT(DISTINCT s.word_id) FILTER (WHERE s.mastered = true) as mastered_count,
                (
                    SELECT json_build_object(
                        'last_topic_id', urp.last_topic_id,
                        'last_accessed_at', urp.last_accessed_at
                    )
                    FROM user_resume_pointers urp
                    WHERE urp.user_id = p_user_id AND urp.roadmap_id = r.id
                    ORDER BY urp.last_accessed_at DESC
                    LIMIT 1
                ) as resume_state
            FROM roadmaps r
            LEFT JOIN topics t ON t.roadmap_id = r.id
            LEFT JOIN topic_words tw ON tw.topic_id = t.id
            LEFT JOIN user_srs_records s ON s.word_id = tw.word_id AND s.user_id = p_user_id
            WHERE r.is_active = true
            GROUP BY r.id, r.name, r.slug, r.description, r.image_url
            ORDER BY r.created_at
        ) lp
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
