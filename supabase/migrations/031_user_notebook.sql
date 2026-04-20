-- Migration 031: User Notebook
-- Adds a table for personalized user notes on specific words

-- Create the notebook entries table
CREATE TABLE IF NOT EXISTS public.user_notebook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
  personal_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure a user can only have one note per word
  unique(user_id, word_id)
);

-- Enable RLS
ALTER TABLE public.user_notebook_entries ENABLE ROW LEVEL SECURITY;

-- Policies for user_notebook_entries
CREATE POLICY "Users can view their own notebook entries"
  ON public.user_notebook_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notebook entries"
  ON public.user_notebook_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notebook entries"
  ON public.user_notebook_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notebook entries"
  ON public.user_notebook_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_notebook_entries_user_word
  ON public.user_notebook_entries(user_id, word_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_notebook_entries TO authenticated;
GRANT SELECT ON public.user_notebook_entries TO anon;

-- Update the get_user_vocabulary function to include personal notes
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
  personal_note TEXT -- Added field
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
    s.mastered AS mastered,
    s.created_at AS first_encountered,
    COALESCE(string_agg(DISTINCT t.name, ', '), 'N/A') AS topic_name,
    (COUNT(tw.topic_id) = 0) AS is_orphaned,
    n.personal_note -- Join with notebook
  FROM user_srs_records s
  JOIN words w ON w.id = s.word_id
  LEFT JOIN topic_words tw ON tw.word_id = w.id
  LEFT JOIN topics t ON t.id = tw.topic_id
  LEFT JOIN user_notebook_entries n ON n.word_id = w.id AND n.user_id = p_user_id
  WHERE s.user_id = p_user_id
  GROUP BY 
    w.id, w.word, w.definition, w.phonetic, w.pos, w.image_url, w.example, w.example_vi,
    s.ease_factor, s.interval_days, s.repetitions, s.lapse_count, s.next_review_at, s.last_reviewed, s.mastered, s.created_at,
    n.personal_note
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
