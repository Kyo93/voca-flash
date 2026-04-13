-- Migration 014: Implement 7-Day Review Forecast
-- Updates get_initial_app_data to return a dynamic forecast array

CREATE OR REPLACE FUNCTION get_initial_app_data(p_user_id UUID)
RETURNS JSON AS $$
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
    -- 1. Get profile
    SELECT * INTO v_profile FROM user_profiles WHERE id = p_user_id;
    
    -- 2. Stats from user_srs_records (Using FSRS fields)
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE mastered = true),
        COUNT(*) FILTER (WHERE mastered = false AND (fsrs_reps > 0 OR fsrs_lapses > 0))
    INTO v_total_words, v_mastered, v_learning
    FROM user_srs_records 
    WHERE user_id = p_user_id;

    -- 3. Active Roadmap
    SELECT r.id, r.slug INTO v_active_roadmap
    FROM user_resume_pointers urp
    JOIN roadmaps r ON r.id = urp.roadmap_id
    WHERE urp.user_id = p_user_id
    ORDER BY urp.last_accessed_at DESC
    LIMIT 1;

    -- 4. Global Review Count (Due right now)
    SELECT COUNT(*) INTO v_due_count
    FROM user_srs_records
    WHERE user_id = p_user_id
      AND mastered = false
      AND next_review_at <= NOW();

    -- 5. 7-Day Forecast
    -- Counts non-mastered words due on each day from Today to Day 6
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
            'retention_rate', COALESCE(v_profile.daily_target::FLOAT / 20.0, 0.9), -- Simplified for now or use complex logic
            'avg_stability', (SELECT COALESCE(AVG(fsrs_stability), 0) FROM user_srs_records WHERE user_id = p_user_id),
            'new_today', (SELECT COUNT(*) FROM user_srs_records WHERE user_id = p_user_id AND created_at >= v_boundary),
            'due_today', COALESCE(v_due_count, 0),
            'forecast', COALESCE(v_forecast, ARRAY[0,0,0,0,0,0,0])
        ),
        'active_roadmap', CASE WHEN v_active_roadmap.id IS NOT NULL 
            THEN json_build_object('id', v_active_roadmap.id, 'slug', v_active_roadmap.slug)
            ELSE NULL END,
        'global_review_count', COALESCE(v_due_count, 0)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
