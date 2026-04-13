-- ============================================================
-- _orphan_rpc_backup.sql — BACKUP trước khi drop
-- Created: 2026-04-13
-- Project: voca-flash (nhnusgnlhnzwavpltbqj)
-- Purpose: Backup 6 orphan/legacy RPC definitions
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- get_initial_app_data_v2 (orphan — dropped Phase 1.1)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_initial_app_data_v2(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_profile RECORD;
    v_total_words INT;
    v_mastered INT;
    v_learning INT;
    v_active_roadmap RECORD;
    v_health JSON;
BEGIN
    SELECT * INTO v_profile FROM user_profiles WHERE id = p_user_id;

    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE mastered = true),
        COUNT(*) FILTER (WHERE mastered = false AND (fsrs_reps > 0 OR fsrs_lapses > 0))
    INTO v_total_words, v_mastered, v_learning
    FROM user_srs_records
    WHERE user_id = p_user_id;

    v_health := get_user_memory_health_v2(p_user_id);

    SELECT r.id, r.slug INTO v_active_roadmap
    FROM user_resume_pointers urp
    JOIN roadmaps r ON r.id = urp.roadmap_id
    WHERE urp.user_id = p_user_id
    ORDER BY urp.last_accessed_at DESC
    LIMIT 1;

    RETURN json_build_object(
        'profile', row_to_json(v_profile),
        'health', v_health,
        'stats', json_build_object(
            'total_words', COALESCE(v_total_words, 0),
            'mastered', COALESCE(v_mastered, 0),
            'learning', COALESCE(v_learning, 0)
        ),
        'active_roadmap', CASE WHEN v_active_roadmap.id IS NOT NULL
            THEN json_build_object('id', v_active_roadmap.id, 'slug', v_active_roadmap.slug)
            ELSE NULL END,
        'global_review_count', COALESCE((v_health->>'due_today')::INT, 0)
    );
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- get_progress_page_data_v2 (orphan — dropped Phase 1.2)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_progress_page_data_v2(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_roadmap_progress JSON;
    v_overall JSON;
BEGIN
    SELECT json_agg(rm) INTO v_roadmap_progress
    FROM (
        SELECT
            r.id, r.name, r.slug,
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

    SELECT json_build_object(
        'streak_days', COALESCE(streak_days, 0),
        'total_mastered', (SELECT COUNT(*) FROM user_srs_records WHERE user_id = p_user_id AND mastered = true)
    ) INTO v_overall
    FROM user_profiles
    WHERE id = p_user_id;

    RETURN json_build_object(
        'roadmap_progress', COALESCE(v_roadmap_progress, '[]'::JSON),
        'overall_stats', COALESCE(v_overall, json_build_object('streak_days', 0, 'total_mastered', 0))
    );
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- get_user_memory_health (orphan — dropped Phase 1.3)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_user_memory_health(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_boundary TIMESTAMPTZ := get_today_boundary();
    v_stats RECORD;
    v_forecast INT[];
BEGIN
    SELECT
        COUNT(*) FILTER (WHERE fsrs_scheduled_days < 5) as fresh,
        COUNT(*) FILTER (WHERE fsrs_scheduled_days >= 5 AND fsrs_scheduled_days < 30) as stable,
        COUNT(*) FILTER (WHERE fsrs_scheduled_days >= 30) as rooted,
        COUNT(*) FILTER (WHERE created_at >= v_boundary) as new_today,
        COUNT(*) FILTER (WHERE mastered = true AND last_reviewed >= v_boundary) as mastered_today,
        COUNT(*) FILTER (WHERE mastered = false AND next_review_at <= NOW()) as due_today,
        AVG(CASE WHEN fsrs_stability > 0 THEN fsrs_stability ELSE NULL END) as avg_stability,
        COALESCE(1.0 - (SUM(fsrs_lapses)::FLOAT / NULLIF(SUM(fsrs_reps), 0)), 1.0) as retention
    INTO v_stats
    FROM user_srs_records
    WHERE user_id = p_user_id;

    SELECT ARRAY(
        SELECT COUNT(s.id)::INT
        FROM generate_series(0, 6) AS day
        LEFT JOIN user_srs_records s ON
            s.user_id = p_user_id AND
            s.mastered = false AND
            CAST(s.next_review_at AS DATE) = CAST(v_boundary + (day || ' days')::INTERVAL AS DATE)
        GROUP BY day
        ORDER BY day
    ) INTO v_forecast;

    RETURN json_build_object(
        'retention_rate', GREATEST(0.0, LEAST(1.0, COALESCE(v_stats.retention, 1.0))),
        'avg_stability', COALESCE(v_stats.avg_stability, 0.0),
        'new_today', COALESCE(v_stats.new_today, 0),
        'due_today', COALESCE(v_stats.due_today, 0),
        'mastered_today', COALESCE(v_stats.mastered_today, 0),
        'forecast', COALESCE(v_forecast, ARRAY[0,0,0,0,0,0,0]),
        'stability_distribution', json_build_object(
            'fresh', COALESCE(v_stats.fresh, 0),
            'stable', COALESCE(v_stats.stable, 0),
            'rooted', COALESCE(v_stats.rooted, 0)
        )
    );
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- get_user_memory_health_v2 (orphan — dropped Phase 1.4)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_user_memory_health_v2(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_boundary TIMESTAMPTZ := get_today_boundary_v2();
    v_stats RECORD;
    v_forecast INT[];
BEGIN
    SELECT
        COUNT(*) FILTER (WHERE fsrs_scheduled_days < 5) as fresh,
        COUNT(*) FILTER (WHERE fsrs_scheduled_days >= 5 AND fsrs_scheduled_days < 30) as stable,
        COUNT(*) FILTER (WHERE fsrs_scheduled_days >= 30) as rooted,
        COUNT(*) FILTER (WHERE created_at >= v_boundary) as new_today,
        COUNT(*) FILTER (WHERE mastered = true AND last_reviewed >= v_boundary) as mastered_today,
        COUNT(*) FILTER (WHERE mastered = false AND next_review_at <= NOW()) as due_today,
        AVG(CASE WHEN fsrs_stability > 0 THEN fsrs_stability ELSE NULL END) as avg_stability,
        COALESCE(1.0 - (SUM(fsrs_lapses)::FLOAT / NULLIF(SUM(fsrs_reps), 0)), 1.0) as retention
    INTO v_stats
    FROM user_srs_records
    WHERE user_id = p_user_id;

    SELECT ARRAY(
        SELECT COUNT(s.id)::INT
        FROM generate_series(0, 6) AS day
        LEFT JOIN user_srs_records s ON
            s.user_id = p_user_id AND
            s.mastered = false AND
            CAST(s.next_review_at AS DATE) = CAST(v_boundary + (day || ' days')::INTERVAL AS DATE)
        GROUP BY day
        ORDER BY day
    ) INTO v_forecast;

    RETURN json_build_object(
        'retention_rate', GREATEST(0.0, LEAST(1.0, COALESCE(v_stats.retention, 1.0))),
        'avg_stability', COALESCE(v_stats.avg_stability, 0.0),
        'new_today', COALESCE(v_stats.new_today, 0),
        'due_today', COALESCE(v_stats.due_today, 0),
        'mastered_today', COALESCE(v_stats.mastered_today, 0),
        'forecast', COALESCE(v_forecast, ARRAY[0,0,0,0,0,0,0]),
        'stability_distribution', json_build_object(
            'fresh', COALESCE(v_stats.fresh, 0),
            'stable', COALESCE(v_stats.stable, 0),
            'rooted', COALESCE(v_stats.rooted, 0)
        )
    );
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- get_user_vocabulary (v1 — dropped Phase 1.5)
-- Superseded by get_user_vocabulary_v2
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_user_vocabulary(p_user_id uuid)
RETURNS TABLE(
    word_id uuid, word text, definition text, phonetic text, pos text,
    image_url text, example text, example_vi text,
    ease_factor double precision, interval_days integer, repetitions integer,
    lapse_count integer, next_review_at timestamptz, last_reviewed timestamptz,
    mastered boolean, first_encountered timestamptz, topic_name text,
    is_orphaned boolean, fsrs_stability double precision,
    fsrs_difficulty double precision, fsrs_state integer,
    fsrs_scheduled_days integer, fsrs_reps integer, fsrs_lapses integer
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        w.id,
        w.word,
        w.definition,
        w.phonetic,
        w.pos,
        w.image_url,
        w.example,
        w.example_vi,
        s.ease_factor,
        s.interval_days,
        s.repetitions,
        s.lapse_count,
        s.next_review_at,
        s.last_reviewed,
        s.mastered,
        s.created_at AS first_encountered,
        COALESCE(string_agg(t.name, ', '), 'N/A') AS topic_name,
        (COUNT(tw.topic_id) = 0) AS is_orphaned,
        COALESCE(s.fsrs_stability, 0)::FLOAT8,
        COALESCE(s.fsrs_difficulty, 0.5)::FLOAT8,
        COALESCE(s.fsrs_state, 0)::INTEGER,
        COALESCE(s.fsrs_scheduled_days, 0)::INTEGER,
        COALESCE(s.fsrs_reps, 0)::INTEGER,
        COALESCE(s.fsrs_lapses, 0)::INTEGER
    FROM user_srs_records s
    JOIN words w ON w.id = s.word_id
    LEFT JOIN topic_words tw ON tw.word_id = w.id
    LEFT JOIN topics t ON t.id = tw.topic_id
    WHERE s.user_id = p_user_id
    GROUP BY
        w.id, w.word, w.definition, w.phonetic, w.pos,
        w.image_url, w.example, w.example_vi, s.ease_factor,
        s.interval_days, s.repetitions, s.lapse_count,
        s.next_review_at, s.last_reviewed, s.mastered, s.created_at,
        s.fsrs_stability, s.fsrs_difficulty, s.fsrs_state,
        s.fsrs_scheduled_days, s.fsrs_reps, s.fsrs_lapses;
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- get_today_boundary_v2 (kept — SKIPPED from drop per SAFELIST)
-- Logic: same as get_today_boundary()
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_today_boundary_v2()
RETURNS timestamptz
LANGUAGE plpgsql STABLE
AS $$
BEGIN
    RETURN (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh' - INTERVAL '4 hours')::DATE + INTERVAL '4 hours';
END;
$$;
