-- ============================================================
-- 017_sync_cloud_local.sql
--
-- LOCAL REFERENCE ONLY — DO NOT APPLY TO SUPABASE CLOUD
--
-- Created: 2026-04-13
-- Project: voca-flash (nhnusgnlhnzwavpltbqj)
-- Purpose: Document current cloud RPC definitions locally
--          for future reference and disaster recovery.
--
-- How to use:
--   - Read only. Do NOT run on Supabase.
--   - This file reflects the state AFTER Phase 1 orphan RPC cleanup.
--   - All 9 active RPCs are documented below.
--
-- Cloud migration history (22 migrations applied):
--   001_initial_schema → ... → 016_fix_initial_data_completion
--   018_drop_orphan_rpc_* (Phase 1 of this audit)
--
-- Orphan RPCs dropped (Phase 1):
--   - get_initial_app_data_v2
--   - get_progress_page_data_v2
--   - get_user_memory_health
--   - get_user_memory_health_v2
--   - get_user_vocabulary (v1)
--
-- Orphan RPCs kept (SKIPPED per SAFELIST):
--   - add_admin         — may be used by Supabase Dashboard
--   - get_today_boundary_v2 — harmless helper, no callers remain
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- Helper: get_today_boundary
-- Used by: get_initial_app_data, get_progress_page_data
-- Logic: 4 AM session boundary (Asia/Ho_Chi_Minh)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_today_boundary()
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql STABLE
AS $$
BEGIN
    RETURN (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh' - INTERVAL '4 hours')::DATE + INTERVAL '4 hours';
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- RPC: get_initial_app_data
-- Used by: Dashboard, AuthContext, fetchDashboardStats
-- Returns: profile, stats, health, active_roadmap, global_review_count
-- Source: Cloud migration 016_fix_initial_data_completion
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_initial_app_data(p_user_id uuid)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_profile RECORD;
    v_total_words INT;
    v_mastered INT;
    v_learning INT;
    v_active_roadmap RECORD;
    v_due_count INT;
    v_forecast INT[];
    v_boundary TIMESTAMPTZ := get_today_boundary();
BEGIN
    SELECT * INTO v_profile FROM user_profiles WHERE id = p_user_id;

    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE mastered = true),
        COUNT(*) FILTER (WHERE mastered = false AND (fsrs_reps > 0 OR fsrs_lapses > 0))
    INTO v_total_words, v_mastered, v_learning
    FROM user_srs_records
    WHERE user_id = p_user_id;

    SELECT r.id, r.slug INTO v_active_roadmap
    FROM user_resume_pointers urp
    JOIN roadmaps r ON r.id = urp.roadmap_id
    WHERE urp.user_id = p_user_id
    ORDER BY urp.last_accessed_at DESC
    LIMIT 1;

    SELECT COUNT(*) INTO v_due_count
    FROM user_srs_records
    WHERE user_id = p_user_id
      AND mastered = false
      AND next_review_at <= NOW();

    SELECT ARRAY_AGG(cnt) INTO v_forecast FROM (
      SELECT COUNT(s.id) as cnt
      FROM generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '6 days', '1 day') AS d(day)
      LEFT JOIN user_srs_records s ON s.user_id = p_user_id
        AND s.mastered = false
        AND s.next_review_at::DATE = d.day
      GROUP BY d.day
      ORDER BY d.day
    ) t;

    RETURN json_build_object(
        'profile', row_to_json(v_profile),
        'stats', json_build_object(
            'total_words', COALESCE(v_total_words, 0),
            'mastered', COALESCE(v_mastered, 0),
            'learning', COALESCE(v_learning, 0)
        ),
        'health', json_build_object(
            'retention_rate', COALESCE(v_profile.daily_target::FLOAT / 20.0, 0.9),
            'avg_stability', (SELECT COALESCE(AVG(fsrs_stability), 0) FROM user_srs_records WHERE user_id = p_user_id),
            'new_today', (SELECT COUNT(*) FROM user_srs_records WHERE user_id = p_user_id AND created_at >= v_boundary),
            'due_today', COALESCE(v_due_count, 0),
            'forecast', COALESCE(v_forecast, ARRAY[0,0,0,0,0,0,0]),
            'stability_distribution', json_build_object(
                'fresh', (SELECT COUNT(*) FROM user_srs_records WHERE user_id = p_user_id AND mastered = false AND fsrs_stability < 5),
                'stable', (SELECT COUNT(*) FROM user_srs_records WHERE user_id = p_user_id AND mastered = false AND fsrs_stability >= 5 AND fsrs_stability <= 30),
                'rooted', (SELECT COUNT(*) FROM user_srs_records WHERE user_id = p_user_id AND mastered = false AND fsrs_stability > 30)
            )
        ),
        'active_roadmap', CASE WHEN v_active_roadmap.id IS NOT NULL
            THEN json_build_object('id', v_active_roadmap.id, 'slug', v_active_roadmap.slug)
            ELSE NULL END,
        'global_review_count', COALESCE(v_due_count, 0)
    );
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- RPC: get_progress_page_data
-- Used by: ProgressPage, fetchProgressPageData
-- Returns: memory_health, roadmap_progress, overall_stats
-- Source: Cloud migration 015_restore_progress_rpc
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_progress_page_data(p_user_id uuid)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_boundary TIMESTAMPTZ := get_today_boundary();
    v_mem_health JSON;
    v_roadmap_progress JSON;
    v_overall JSON;
BEGIN
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
$$;

-- ══════════════════════════════════════════════════════════════
-- RPC: get_library_page_data
-- Used by: LibraryPage, fetchLibraryPageData
-- Returns: Roadmap[] with total_words, mastered_count, resume_state
-- Source: Cloud (inline in 010 migrations)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_library_page_data(p_user_id uuid)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT json_agg(lp)
        FROM (
            SELECT
                r.id, r.name, r.slug, r.description, r.image_url,
                COUNT(DISTINCT tw.word_id) as total_words,
                COUNT(DISTINCT s.word_id) as mastered_count,
                (
                    SELECT json_build_object('last_topic_id', urp.last_topic_id, 'last_accessed_at', urp.last_accessed_at)
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
$$;

-- ══════════════════════════════════════════════════════════════
-- RPC: get_mastery_stats
-- Used by: Dashboard, fetchMasteryStats
-- Returns: {total, mastered, due, orphaned, weak, learning}
-- Source: Cloud migration 012_fix_mastery_stats_joins
-- Note: learning count uses BOTH repetitions AND fsrs_reps (hybrid SM-2 + FSRS)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_mastery_stats(p_user_id uuid)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
AS $$
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
        COUNT(*) FILTER (WHERE mastered = false AND (repetitions > 0 OR fsrs_reps > 0 OR lapse_count > 0)),
        COUNT(*) FILTER (WHERE mastered = false AND next_review_at <= NOW()),
        (
            SELECT COUNT(*)
            FROM user_srs_records s
            LEFT JOIN topic_words tw ON tw.word_id = s.word_id
            WHERE s.user_id = p_user_id AND tw.topic_id IS NULL
        ),
        COUNT(*) FILTER (WHERE fsrs_difficulty > 0.8 OR lapse_count > 2)
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
$$;

-- ══════════════════════════════════════════════════════════════
-- RPC: get_topic_completion_stats
-- Used by: RoadmapTopicsPage, fetchTopicCompletionMap
-- Params: p_user_id uuid, p_topic_ids uuid[]
-- Returns: TABLE(topic_id uuid, total bigint, learned bigint, percent integer)
-- Source: Cloud (refined version — simpler than local 013)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_topic_completion_stats(p_user_id uuid, p_topic_ids uuid[])
RETURNS TABLE(
    topic_id uuid,
    total_words bigint,
    learned_count bigint,
    percent_complete integer
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tw.topic_id,
        COUNT(tw.word_id) as total,
        COUNT(srs.word_id) as learned,
        CASE
            WHEN COUNT(tw.word_id) = 0 THEN 0
            ELSE ROUND((COUNT(srs.word_id)::FLOAT / COUNT(tw.word_id)::FLOAT) * 100)::INT
        END as percent
    FROM topic_words tw
    LEFT JOIN user_srs_records srs ON srs.word_id = tw.word_id AND srs.user_id = p_user_id
    WHERE tw.topic_id = ANY(p_topic_ids)
    GROUP BY tw.topic_id;
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- RPC: get_user_vocabulary_v2
-- Used by: MasteryPage, fetchUserVocabulary
-- Params: p_user_id, p_limit, p_offset, p_search, p_filter
-- Returns: TABLE (17 columns including FSRS fields)
-- Source: Cloud migration 012
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_user_vocabulary_v2(
    p_user_id uuid,
    p_limit int DEFAULT 50,
    p_offset int DEFAULT 0,
    p_search text DEFAULT '',
    p_filter text DEFAULT 'all'
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
$$;

-- ══════════════════════════════════════════════════════════════
-- RPC: reset_topic_progress
-- Used by: StudyPrepScreen, resetTopicProgress
-- Params: p_topic_id uuid
-- Returns: void
-- Note: Uses topic_words junction table (N:N)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION reset_topic_progress(p_topic_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM user_srs_records
    WHERE user_id = auth.uid()
    AND word_id IN (
        SELECT word_id FROM topic_words WHERE topic_id = p_topic_id
    );
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- Helper: is_admin
-- Used by: ALL RLS policies ( SECURITY DEFINER )
-- Returns: boolean
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM admin_users WHERE id = auth.uid()
    );
$$;

-- ══════════════════════════════════════════════════════════════
-- Helper: is_authenticated
-- Used by: RLS policies
-- Returns: boolean
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT auth.uid() IS NOT NULL;
$$;

-- ══════════════════════════════════════════════════════════════
-- NOTES:
-- - All functions above use SECURITY DEFINER to bypass RLS
--   within RPC execution context.
-- - Cloud also has add_admin() and get_today_boundary_v2()
--   which are intentionally SKIPPED from this file.
-- - Trigger: on_auth_user_created → handle_new_user (signup)
-- - Triggers: trg_*_updated_at on all major tables
-- ══════════════════════════════════════════════════════════════
