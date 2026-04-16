-- supabase/migrations/026_topic_word_counts_rpc.sql
-- Replaces client-side SELECT + JOIN in fetchTopicWordCounts with server-side RPC.
-- Reduces 2 round-trips (topic_words + topics) to 1.

CREATE OR REPLACE FUNCTION get_topic_word_counts()
RETURNS TABLE(slug TEXT, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT t.slug, COUNT(tw.word_id)::BIGINT AS count
  FROM topics t
  LEFT JOIN topic_words tw ON tw.topic_id = t.id
  GROUP BY t.id, t.slug
  ORDER BY t.slug;
END;
$$;
