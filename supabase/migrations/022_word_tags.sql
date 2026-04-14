-- ═══════════════════════════════════════════════════════════
-- 022: Thêm trường tags cho từ vựng
-- Tags là mảng string — 1 từ có thể có nhiều tag
-- ═══════════════════════════════════════════════════════════

ALTER TABLE words
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- Index cho GIN search nhanh theo tag
CREATE INDEX IF NOT EXISTS idx_words_tags ON words USING GIN(tags);

-- RLS: tags visible to all (read), write via admin policy
-- (existing policies on words table already cover this)
