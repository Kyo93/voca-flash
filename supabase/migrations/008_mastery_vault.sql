-- Migration 008: Mastery Vault (Final - Fixed)
-- Adds indices and RPC for advanced vocabulary management

-- Index for "First Encounter" sorting
CREATE INDEX IF NOT EXISTS idx_srs_records_created_at 
  ON user_srs_records(user_id, created_at);

-- RPC: Fetch user's vocabulary with orphan detection
CREATE OR REPLACE FUNCTION get_user_vocabulary(p_user_id UUID)
RETURNS TABLE (
  word_id UUID,
  word TEXT,
  definition TEXT,
  phonetic TEXT,
  pos TEXT,
  image_url TEXT,
  example TEXT,
  example_vi TEXT,
  ease_factor FLOAT8,
  interval_days INTEGER,
  repetitions INTEGER,
  lapse_count INTEGER,
  next_review_at TIMESTAMPTZ,
  last_reviewed TIMESTAMPTZ,
  mastered BOOLEAN,
  first_encountered TIMESTAMPTZ,
  topic_name TEXT,
  is_orphaned BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id AS word_id,
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
    (s.ease_factor >= 2.5) AS mastered,
    s.created_at AS first_encountered,
    COALESCE(string_agg(t.name, ', '), 'N/A') AS topic_name,
    (COUNT(tw.topic_id) = 0) AS is_orphaned
  FROM user_srs_records s
  JOIN words w ON w.id = s.word_id
  LEFT JOIN topic_words tw ON tw.word_id = w.id
  LEFT JOIN topics t ON t.id = tw.topic_id
  WHERE s.user_id = p_user_id
  GROUP BY 
    w.id, w.word, w.definition, w.phonetic, w.pos, w.image_url, w.example, w.example_vi,
    s.ease_factor, s.interval_days, s.repetitions, s.lapse_count, s.next_review_at, s.last_reviewed, s.created_at
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
