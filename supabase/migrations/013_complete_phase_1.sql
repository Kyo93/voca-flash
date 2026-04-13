-- Migration 013: Complete Phase 1 Database Foundation
-- Implement missing topic stats RPC and search indices.

-- 1. Create RPC for topic completion stats
-- Optimized to calculate total and learned words for a list of topics in one query.
CREATE OR REPLACE FUNCTION get_topic_completion_stats(
    p_user_id UUID,
    p_topic_ids UUID[]
)
RETURNS TABLE (
    topic_id UUID,
    total_words INT,
    learned_count INT,
    percent_complete INT
) AS $$
BEGIN
    RETURN QUERY
    WITH topic_counts AS (
        SELECT 
            tw.topic_id,
            COUNT(tw.word_id)::INT as total
        FROM topic_words tw
        WHERE tw.topic_id = ANY(p_topic_ids)
        GROUP BY tw.topic_id
    ),
    learned_counts AS (
        SELECT 
            tw.topic_id,
            COUNT(s.word_id)::INT as learned
        FROM topic_words tw
        JOIN user_srs_records s ON s.word_id = tw.word_id
        WHERE tw.topic_id = ANY(p_topic_ids)
          AND s.user_id = p_user_id
          AND s.mastered = true
        GROUP BY tw.topic_id
    )
     Kor:
    SELECT 
        tc.topic_id,
        tc.total as total_words,
        COALESCE(lc.learned, 0) as learned_count,
        CASE 
            WHEN tc.total > 0 THEN ROUND((COALESCE(lc.learned, 0)::FLOAT / tc.total) * 100)::INT
            ELSE 0 
        END as percent_complete
    FROM topic_counts tc
    LEFT JOIN learned_counts lc ON lc.topic_id = tc.topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add B-tree Indices for optimized ILIKE search
-- Using text_pattern_ops for leading-wildcard optimization if needed, 
-- but standard btree is usually enough for ILIKE '%term%' on small/medium sets.
-- However, for large sets, GIN with pg_trgm is better. For now, standard index for basic ILIKE.
CREATE INDEX IF NOT EXISTS idx_words_word_search ON words USING btree (word text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_words_definition_search ON words USING btree (definition text_pattern_ops);

-- 3. Force reload schema
NOTIFY pgrst, 'reload schema';
