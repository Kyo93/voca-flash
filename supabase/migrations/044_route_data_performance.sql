-- Route-shaped reads for hot mobile paths.
-- Keeps study prep and roadmap detail screens from over-fetching client-side data.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_topics_slug
  ON topics(slug);

CREATE INDEX IF NOT EXISTS idx_topic_words_topic_sort_word
  ON topic_words(topic_id, sort_order, word_id);

CREATE INDEX IF NOT EXISTS idx_topic_words_word_topic
  ON topic_words(word_id, topic_id);

CREATE INDEX IF NOT EXISTS idx_srs_user_word
  ON user_srs_records(user_id, word_id);

CREATE INDEX IF NOT EXISTS idx_srs_user_due_unmastered
  ON user_srs_records(user_id, next_review_at)
  WHERE mastered = false;

CREATE INDEX IF NOT EXISTS idx_words_word_trgm
  ON words USING gin (lower(word) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_words_definition_trgm
  ON words USING gin (lower(definition) gin_trgm_ops);

CREATE OR REPLACE FUNCTION get_study_prep_data(
  p_user_id UUID DEFAULT NULL,
  p_topic_slug TEXT DEFAULT NULL
)
RETURNS TABLE (
  word_id UUID,
  word TEXT,
  definition TEXT,
  phonetic TEXT,
  example TEXT,
  example_vi TEXT,
  image_url TEXT,
  image_position TEXT,
  topic_slug TEXT,
  created_at TIMESTAMPTZ,
  has_progress BOOLEAN,
  mastered BOOLEAN,
  next_review_at TIMESTAMPTZ,
  last_reviewed TIMESTAMPTZ,
  fsrs_stability FLOAT8,
  fsrs_difficulty FLOAT8,
  fsrs_state INTEGER,
  fsrs_reps INTEGER,
  fsrs_lapses INTEGER,
  fsrs_scheduled_days INTEGER,
  repetitions INTEGER,
  lapse_count INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH scoped_words AS (
    SELECT DISTINCT ON (w.id)
      w.id AS word_id,
      w.word,
      w.definition,
      w.phonetic,
      w.example,
      w.example_vi,
      w.image_url,
      w.image_position,
      t.slug AS topic_slug,
      w.created_at,
      COALESCE(tw.sort_order, 0) AS sort_order
    FROM words w
    LEFT JOIN topic_words tw ON tw.word_id = w.id
    LEFT JOIN topics t ON t.id = tw.topic_id
    WHERE p_topic_slug IS NULL OR t.slug = p_topic_slug
    ORDER BY w.id, COALESCE(tw.sort_order, 0), w.created_at
  )
  SELECT
    sw.word_id,
    sw.word,
    sw.definition,
    sw.phonetic,
    sw.example,
    sw.example_vi,
    sw.image_url,
    COALESCE(sw.image_position, 'center') AS image_position,
    sw.topic_slug,
    sw.created_at,
    (s.word_id IS NOT NULL) AS has_progress,
    COALESCE(s.mastered, false) AS mastered,
    s.next_review_at,
    s.last_reviewed,
    s.fsrs_stability,
    s.fsrs_difficulty,
    s.fsrs_state,
    s.fsrs_reps,
    s.fsrs_lapses,
    s.fsrs_scheduled_days,
    s.repetitions,
    s.lapse_count
  FROM scoped_words sw
  LEFT JOIN user_srs_records s
    ON s.word_id = sw.word_id
   AND s.user_id = p_user_id
  ORDER BY sw.sort_order, sw.created_at, sw.word;
$$;

CREATE OR REPLACE FUNCTION get_roadmap_detail_data(
  p_user_id UUID,
  p_roadmap_slug TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_roadmap roadmaps%ROWTYPE;
  v_featured_id UUID;
  v_up_next_id UUID;
  v_total INTEGER := 0;
  v_learned INTEGER := 0;
  v_mastered INTEGER := 0;
  v_topics_json JSONB := '[]'::jsonb;
  v_topic_progress_json JSONB := '{}'::jsonb;
BEGIN
  SELECT *
    INTO v_roadmap
  FROM roadmaps
  WHERE slug = p_roadmap_slug
    AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'roadmap', NULL,
      'topics', '[]'::jsonb,
      'stats', jsonb_build_object('total', 0, 'learned', 0, 'mastered', 0),
      'topic_progress', '{}'::jsonb,
      'featured_id', NULL,
      'up_next_id', NULL
    );
  END IF;

  WITH roadmap_words AS (
    SELECT DISTINCT tw.word_id
    FROM topics t
    JOIN topic_words tw ON tw.topic_id = t.id
    WHERE t.roadmap_id = v_roadmap.id
  )
  SELECT
    COUNT(*)::INTEGER,
    COUNT(s.word_id)::INTEGER,
    COUNT(s.word_id) FILTER (WHERE s.mastered = true)::INTEGER
    INTO v_total, v_learned, v_mastered
  FROM roadmap_words rw
  LEFT JOIN user_srs_records s
    ON s.word_id = rw.word_id
   AND s.user_id = p_user_id;

  WITH topic_counts AS (
    SELECT
      t.id AS topic_id,
      COUNT(DISTINCT tw.word_id)::INTEGER AS total
    FROM topics t
    LEFT JOIN topic_words tw ON tw.topic_id = t.id
    WHERE t.roadmap_id = v_roadmap.id
    GROUP BY t.id
  ),
  topic_learning AS (
    SELECT
      t.id AS topic_id,
      COUNT(DISTINCT s.word_id)::INTEGER AS learned,
      COUNT(DISTINCT s.word_id) FILTER (WHERE s.mastered = true)::INTEGER AS mastered
    FROM topics t
    LEFT JOIN topic_words tw ON tw.topic_id = t.id
    LEFT JOIN user_srs_records s
      ON s.word_id = tw.word_id
     AND s.user_id = p_user_id
    WHERE t.roadmap_id = v_roadmap.id
    GROUP BY t.id
  ),
  progress_rows AS (
    SELECT
      tc.topic_id,
      tc.total,
      COALESCE(tl.learned, 0) AS learned,
      COALESCE(tl.mastered, 0) AS mastered,
      CASE
        WHEN tc.total = 0 THEN 0
        ELSE ROUND((COALESCE(tl.learned, 0)::NUMERIC / tc.total::NUMERIC) * 100)::INTEGER
      END AS percent
    FROM topic_counts tc
    LEFT JOIN topic_learning tl ON tl.topic_id = tc.topic_id
  )
  SELECT COALESCE(
    jsonb_object_agg(
      topic_id::TEXT,
      jsonb_build_object(
        'total', total,
        'learned', learned,
        'mastered', mastered,
        'percent', percent
      )
    ),
    '{}'::jsonb
  )
    INTO v_topic_progress_json
  FROM progress_rows;

  SELECT last_topic_id
    INTO v_featured_id
  FROM user_resume_pointers
  WHERE user_id = p_user_id
    AND roadmap_id = v_roadmap.id
  ORDER BY last_accessed_at DESC
  LIMIT 1;

  IF v_featured_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM topics WHERE id = v_featured_id AND roadmap_id = v_roadmap.id
  ) THEN
    SELECT id
      INTO v_featured_id
    FROM topics
    WHERE roadmap_id = v_roadmap.id
    ORDER BY sort_order, created_at
    LIMIT 1;
  END IF;

  WITH topic_progress AS (
    SELECT
      t.id AS topic_id,
      COUNT(DISTINCT tw.word_id)::INTEGER AS total,
      COUNT(DISTINCT s.word_id)::INTEGER AS learned
    FROM topics t
    LEFT JOIN topic_words tw ON tw.topic_id = t.id
    LEFT JOIN user_srs_records s
      ON s.word_id = tw.word_id
     AND s.user_id = p_user_id
    WHERE t.roadmap_id = v_roadmap.id
    GROUP BY t.id
  )
  SELECT t.id
    INTO v_up_next_id
  FROM topics t
  LEFT JOIN topic_progress tp ON tp.topic_id = t.id
  WHERE t.roadmap_id = v_roadmap.id
    AND (v_featured_id IS NULL OR t.id <> v_featured_id)
    AND COALESCE(tp.learned, 0) < COALESCE(tp.total, 0)
  ORDER BY t.sort_order, t.created_at
  LIMIT 1;

  WITH ordered_topics AS (
    SELECT
      t.*,
      CASE
        WHEN t.id = v_featured_id THEN 0
        WHEN t.id = v_up_next_id THEN 1
        ELSE 2
      END AS priority
    FROM topics t
    WHERE t.roadmap_id = v_roadmap.id
    ORDER BY priority, t.sort_order, t.created_at
  )
  SELECT COALESCE(
    jsonb_agg(to_jsonb(ordered_topics) - 'priority' ORDER BY priority, sort_order, created_at),
    '[]'::jsonb
  )
    INTO v_topics_json
  FROM ordered_topics;

  RETURN jsonb_build_object(
    'roadmap', to_jsonb(v_roadmap),
    'topics', v_topics_json,
    'stats', jsonb_build_object(
      'total', COALESCE(v_total, 0),
      'learned', COALESCE(v_learned, 0),
      'mastered', COALESCE(v_mastered, 0)
    ),
    'topic_progress', v_topic_progress_json,
    'featured_id', v_featured_id,
    'up_next_id', v_up_next_id
  );
END;
$$;

NOTIFY pgrst, 'reload schema';
