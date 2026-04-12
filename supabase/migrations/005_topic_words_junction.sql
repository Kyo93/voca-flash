-- ═══════════════════════════════════════════════════════
-- 1. Junction table: topic_words (N:N between topics ↔ words)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS topic_words (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id    UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  word_id     UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(topic_id, word_id)
);

CREATE INDEX idx_topic_words_topic ON topic_words(topic_id);
CREATE INDEX idx_topic_words_word ON topic_words(word_id);

-- RLS
ALTER TABLE topic_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_full_topic_words" ON topic_words FOR ALL USING (is_admin());
CREATE POLICY "student_read_topic_words" ON topic_words FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════
-- 2. Migrate existing data: words.topic_id → topic_words
-- ═══════════════════════════════════════════════════════
INSERT INTO topic_words (topic_id, word_id, sort_order)
SELECT w.topic_id, w.id, 0 
FROM words w 
WHERE w.topic_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- 3. GIỮ NGUYÊN cột words.topic_id trong giai đoạn chuyển tiếp
--    (Dual-write: cả topic_id CŨ lẫn topic_words MỚI đều hoạt động)
--    Sẽ DROP cột này ở migration riêng SAU KHI toàn bộ code đã chuyển
-- ═══════════════════════════════════════════════════════
