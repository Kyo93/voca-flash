-- Migration 033: Progress Academic Insights RPC
-- Upgrades get_user_progress_analytics to include topic stats and velocity

CREATE OR REPLACE FUNCTION get_user_progress_analytics(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_retention_rate FLOAT;
    v_total_time_ms BIGINT;
    v_review_activity JSONB;
    v_weak_words JSONB;
    v_mastery_distribution JSONB;
    v_workload_forecast JSONB;
    v_heatmap_data JSONB;
    v_streak_days INT;
    v_topic_stats JSONB;
    v_learning_velocity JSONB;
BEGIN
    -- 1. Retention Rate (last 30 days)
    SELECT 
        COALESCE(AVG(CASE WHEN rating > 1 THEN 1.0 ELSE 0.0 END), 0)
    INTO v_retention_rate
    FROM user_review_logs
    WHERE user_id = p_user_id
    AND created_at > now() - interval '30 days';

    -- 2. Total Study Time
    SELECT COALESCE(SUM(review_duration_ms), 0)
    INTO v_total_time_ms
    FROM user_review_logs
    WHERE user_id = p_user_id;

    -- 3. Review Activity (last 30 days, grouped by day)
    SELECT jsonb_agg(d) INTO v_review_activity
    FROM (
        SELECT 
            date_trunc('day', created_at)::date as date,
            count(*) as reviews,
            sum(review_duration_ms) as duration_ms
        FROM user_review_logs
        WHERE user_id = p_user_id
        AND created_at > now() - interval '30 days'
        GROUP BY 1
        ORDER BY 1
    ) d;

    -- 4. Weak Words (words with most fails in last 30 days)
    SELECT jsonb_agg(w) INTO v_weak_words
    FROM (
        SELECT 
            words.id,
            words.word,
            words.definition as meaning,
            count(*) filter (where rating = 1) as fail_count
        FROM user_review_logs
        JOIN words ON words.id = user_review_logs.word_id
        WHERE user_review_logs.user_id = p_user_id
        AND user_review_logs.created_at > now() - interval '30 days'
        GROUP BY words.id, words.word, words.definition
        HAVING count(*) filter (where rating = 1) > 0
        ORDER BY fail_count DESC
        LIMIT 5
    ) w;

    -- 5. Mastery Distribution (Counts by FSRS state)
    SELECT jsonb_object_agg(
        CASE 
            WHEN fsrs_state = 0 THEN 'new'
            WHEN fsrs_state = 1 THEN 'learning'
            WHEN fsrs_state = 2 THEN 'review'
            WHEN fsrs_state = 3 THEN 'relearning'
            ELSE 'unknown'
        END,
        count
    ) INTO v_mastery_distribution
    FROM (
        SELECT fsrs_state, count(*)
        FROM user_srs_records
        WHERE user_id = p_user_id
        GROUP BY fsrs_state
    ) s;

    -- 6. Workload Forecast (Next 14 days)
    SELECT jsonb_agg(f) INTO v_workload_forecast
    FROM (
        SELECT 
            d::date as date,
            (SELECT count(*) FROM user_srs_records WHERE user_id = p_user_id AND next_review_at::date = d::date AND mastered = false) as count
        FROM generate_series(current_date, current_date + interval '13 days', interval '1 day') d
    ) f;

    -- 7. Heatmap Data (Last 90 days)
    SELECT jsonb_agg(h) INTO v_heatmap_data
    FROM (
        SELECT 
            date_trunc('day', created_at)::date as date,
            count(*) as count
        FROM user_review_logs
        WHERE user_id = p_user_id
        AND created_at > now() - interval '90 days'
        GROUP BY 1
        ORDER BY 1
    ) h;

    -- 8. Streak Days (from profile)
    SELECT COALESCE(streak_days, 0) INTO v_streak_days
    FROM user_profiles
    WHERE id = p_user_id;

    -- 9. Topic Stats (Sunburst Data)
    SELECT jsonb_agg(ts) INTO v_topic_stats
    FROM (
        SELECT 
            t.name as topic,
            jsonb_object_agg(
                CASE 
                    WHEN s.fsrs_state = 0 THEN 'new'
                    WHEN s.fsrs_state = 1 THEN 'learning'
                    WHEN s.fsrs_state = 2 THEN 'review'
                    WHEN s.fsrs_state = 3 THEN 'relearning'
                    ELSE 'unknown'
                END,
                count
            ) as states
        FROM (
            SELECT tw.topic_id, s.fsrs_state, count(*)
            FROM user_srs_records s
            JOIN topic_words tw ON tw.word_id = s.word_id
            WHERE s.user_id = p_user_id
            GROUP BY tw.topic_id, s.fsrs_state
        ) s
        JOIN topics t ON t.id = s.topic_id
        GROUP BY t.name
    ) ts;

    -- 10. Learning Velocity (Average over last 7 days)
    SELECT jsonb_build_object(
        'avg_new_per_day', COALESCE((SELECT COUNT(*)::FLOAT / 7 FROM user_srs_records WHERE user_id = p_user_id AND created_at > now() - interval '7 days'), 0),
        'avg_reviews_per_day', COALESCE((SELECT COUNT(*)::FLOAT / 7 FROM user_review_logs WHERE user_id = p_user_id AND created_at > now() - interval '7 days'), 0)
    ) INTO v_learning_velocity;

    RETURN jsonb_build_object(
        'retention_rate', v_retention_rate,
        'total_time_ms', v_total_time_ms,
        'streak_days', v_streak_days,
        'review_activity', COALESCE(v_review_activity, '[]'::jsonb),
        'weak_words', COALESCE(v_weak_words, '[]'::jsonb),
        'mastery_distribution', COALESCE(v_mastery_distribution, '{}'::jsonb),
        'workload_forecast', COALESCE(v_workload_forecast, '[]'::jsonb),
        'heatmap_data', COALESCE(v_heatmap_data, '[]'::jsonb),
        'topic_stats', COALESCE(v_topic_stats, '[]'::jsonb),
        'learning_velocity', v_learning_velocity
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
