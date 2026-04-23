-- Migration 036: Fix Review Due Boundary
-- Allows users to review all words scheduled for any time within the current study day (up to +24 hours from the daily boundary).

CREATE OR REPLACE FUNCTION get_initial_app_data_v2(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_profile JSON;
    v_total_words INT;
    v_mastered INT;
    v_learning INT;
    v_active_roadmap JSON;
    v_due_count INT;
    v_forecast INT[];
    v_retention_rate FLOAT;
    v_boundary TIMESTAMPTZ := ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh' - INTERVAL '4 hours')::DATE + INTERVAL '4 hours') AT TIME ZONE 'Asia/Ho_Chi_Minh';
BEGIN
    -- Profile
    SELECT json_build_object(
        'id', id,
        'email', email,
        'display_name', display_name,
        'avatar_url', avatar_url,
        'streak_days', streak_days,
        'daily_target', daily_target,
        'srs_intensity', srs_intensity,
        'tts_voice', tts_voice,
        'tts_rate', tts_rate,
        'auto_play_audio', auto_play_audio,
        'app_language', app_language,
        'theme_mode', theme_mode,
        'last_study_date', last_study_date,
        'longest_streak', COALESCE(longest_streak, 1)
    ) INTO v_profile
    FROM user_profiles
    WHERE id = p_user_id;

    -- Stats
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE mastered = true),
        COUNT(*) FILTER (WHERE mastered = false AND (fsrs_reps > 0 OR fsrs_lapses > 0))
    INTO v_total_words, v_mastered, v_learning
    FROM user_srs_records
    WHERE user_id = p_user_id;

    -- Active roadmap
    SELECT json_build_object('id', r.id, 'slug', r.slug) INTO v_active_roadmap
    FROM user_resume_pointers urp
    JOIN roadmaps r ON r.id = urp.roadmap_id
    WHERE urp.user_id = p_user_id
    ORDER BY urp.last_accessed_at DESC
    LIMIT 1;

    -- Due count (Modified to include all words up to the end of the current study day)
    SELECT COUNT(*) INTO v_due_count
    FROM user_srs_records
    WHERE user_id = p_user_id
      AND mastered = false
      AND next_review_at <= (v_boundary + INTERVAL '24 hours');

    -- 7-day forecast (Timezone aware)
    SELECT ARRAY_AGG(cnt)::INT[] INTO v_forecast FROM (
        SELECT COUNT(s.id) as cnt
        FROM generate_series(
            (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE, 
            (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE + INTERVAL '6 days', 
            '1 day'
        ) AS d(day)
        LEFT JOIN user_srs_records s ON s.user_id = p_user_id
          AND s.mastered = false
          AND (s.next_review_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE = d.day::DATE
        GROUP BY d.day
        ORDER BY d.day
    ) t;

    -- Retention rate: real calculation from review logs (last 30 days)
    SELECT COALESCE(AVG(CASE WHEN rating > 1 THEN 1.0 ELSE 0.0 END), 0)
    INTO v_retention_rate
    FROM user_review_logs
    WHERE user_id = p_user_id
    AND created_at > now() - interval '30 days';

    RETURN json_build_object(
        'profile', COALESCE(v_profile, json_build_object('id', p_user_id)),
        'stats', json_build_object(
            'total_words', COALESCE(v_total_words, 0),
            'mastered', COALESCE(v_mastered, 0),
            'learning', COALESCE(v_learning, 0)
        ),
        'health', json_build_object(
            'retention_rate', v_retention_rate,
            'avg_stability', (SELECT COALESCE(AVG(fsrs_stability), 0) FROM user_srs_records WHERE user_id = p_user_id),
            'new_today', (SELECT COUNT(*) FROM user_srs_records WHERE user_id = p_user_id AND created_at >= v_boundary),
            'due_today', COALESCE(v_due_count, 0),
            'mastered_today', (SELECT COUNT(*) FROM user_srs_records WHERE user_id = p_user_id AND mastered = true AND last_reviewed >= v_boundary),
            'forecast', COALESCE(v_forecast, ARRAY[0,0,0,0,0,0,0]::INT[]),
            'stability_distribution', json_build_object(
                'fresh', (SELECT COUNT(*) FROM user_srs_records WHERE user_id = p_user_id AND mastered = false AND fsrs_stability < 5),
                'stable', (SELECT COUNT(*) FROM user_srs_records WHERE user_id = p_user_id AND mastered = false AND fsrs_stability >= 5 AND fsrs_stability <= 30),
                'rooted', (SELECT COUNT(*) FROM user_srs_records WHERE user_id = p_user_id AND mastered = false AND fsrs_stability > 30)
            )
        ),
        'active_roadmap', v_active_roadmap,
        'global_review_count', COALESCE(v_due_count, 0)
    );
END;
$$;
