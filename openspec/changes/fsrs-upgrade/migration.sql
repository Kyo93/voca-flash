-- Migration 009: FSRS Fields
-- Thêm columns cho ts-fsrs@5.3.2
-- Columns mới có DEFAULT = 0 (backward compatible với dữ liệu cũ)

-- 1. Thêm FSRS columns vào user_srs_records
ALTER TABLE user_srs_records
ADD COLUMN IF NOT EXISTS fsrs_stability FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS fsrs_difficulty FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS fsrs_state INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fsrs_scheduled_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fsrs_elapsed_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fsrs_reps INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fsrs_lapses INTEGER DEFAULT 0;

-- 2. Index cho FSRS queries (tối ưu performance)
CREATE INDEX IF NOT EXISTS idx_srs_fsrs_state
  ON user_srs_records(user_id, fsrs_state);
CREATE INDEX IF NOT EXISTS idx_srs_stability
  ON user_srs_records(user_id, fsrs_stability);

-- 3. Cập nhật RPC get_user_vocabulary thêm FSRS fields
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
  is_orphaned BOOLEAN,
  -- FSRS fields (NEW)
  fsrs_stability FLOAT,
  fsrs_difficulty FLOAT,
  fsrs_state INTEGER,
  fsrs_scheduled_days INTEGER
) AS $$
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
    COALESCE(s.fsrs_stability, 0),
    COALESCE(s.fsrs_difficulty, 0.5),
    COALESCE(s.fsrs_state, 0),
    COALESCE(s.fsrs_scheduled_days, 0)
  FROM user_srs_records s
  JOIN words w ON w.id = s.word_id
  LEFT JOIN topic_words tw ON tw.word_id = w.id
  LEFT JOIN topics t ON t.id = tw.topic_id
  WHERE s.user_id = p_user_id
  GROUP BY
    w.id, w.word, w.definition, w.phonetic, w.pos,
    w.image_url, w.example, w.example_vi, s.ease_factor,
    s.interval_days, s.repetitions, s.lapse_count,
    s.next_review_at, s.last_reviewed, s.mastered, s.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;