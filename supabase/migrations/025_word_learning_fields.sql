-- ============================================================
-- Migration: 025_word_learning_fields
-- Description: Add synonyms, antonyms, word_family columns
--              to the words table for enhanced vocabulary learning.
-- ============================================================

ALTER TABLE words
  ADD COLUMN IF NOT EXISTS synonyms    TEXT[],
  ADD COLUMN IF NOT EXISTS antonyms   TEXT[],
  ADD COLUMN IF NOT EXISTS word_family TEXT[];

-- PostgreSQL GIN indexes for efficient text[] filtering
CREATE INDEX IF NOT EXISTS words_synonyms_idx     ON words USING GIN (synonyms);
CREATE INDEX IF NOT EXISTS words_antonyms_idx     ON words USING GIN (antonyms);
CREATE INDEX IF NOT EXISTS words_word_family_idx ON words USING GIN (word_family);

-- Reload PostgREST cache
NOTIFY pgrst, 'reload schema';
