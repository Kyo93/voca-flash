-- ============================================================
-- Migration: 019_add_word_unique_constraint
-- Description: Add UNIQUE constraint on words(word) to prevent
--              duplicate word entries. This enables INSERT ...
--              ON CONFLICT DO UPDATE upsert behavior in the
--              batch_insert_words RPC.
-- ============================================================

-- First, remove any duplicate words keeping the oldest (lowest created_at)
DELETE FROM words a
USING words b
WHERE a.id > b.id
  AND lower(a.word) = lower(b.word);

-- Add the unique constraint (case-insensitive via function index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_words_word_lower ON words (lower(word));
