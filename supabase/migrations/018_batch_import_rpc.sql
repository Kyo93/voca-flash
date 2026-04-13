-- ============================================================
-- Migration: 018_batch_import_rpc
-- Description: RPC functions for batch word import — duplicate
--               detection and transactional batch insert with
--               topic_words junctions and word_choices.
-- ============================================================

-- ── find_duplicate_words ────────────────────────────────────
-- Batch-check for existing words (case-insensitive).
-- Returns an array of words already present in the words table.
-- Security: SECURITY DEFINER so it runs with caller privileges;
--           STABLE so the planner knows it does not mutate.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION find_duplicate_words(p_words TEXT[])
RETURNS TEXT[] AS $$
  SELECT ARRAY(
    SELECT LOWER(word)
    FROM words
    WHERE LOWER(word) = ANY(SELECT LOWER(w) FROM unnest(p_words) AS w)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── batch_insert_words ──────────────────────────────────────
-- Insert a batch of words (passed as a JSONB array) inside a
-- single transaction.  Each element may contain:
--   word, phonetic, pos, difficulty, definition,
--   example, example_vi, image_url, image_position,
--   topic_ids (UUID[]), wrong_choices (TEXT[])
--
-- Returns { inserted: number, errors: { word, error }[] }
--
-- Security: SECURITY DEFINER so row-level policies on words /
--           topic_words / word_choices are bypassed (caller is
--           the service-role key used by the admin import flow).
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION batch_insert_words(p_words JSONB)
RETURNS JSONB AS $$
DECLARE
  inserted_count INT := 0;
  errors          JSONB := '[]'::JSONB;
  w               JSONB;
  new_id          UUID;
  wrong_choice    TEXT;
  sort_num        INT;
BEGIN
  FOR w IN SELECT * FROM jsonb_array_elements(p_words)
  LOOP
    BEGIN
      -- ── words ─────────────────────────────────────────────
      INSERT INTO words (
        word, phonetic, pos, difficulty, definition,
        example, example_vi, image_url, image_position
      )
      VALUES (
        w->>'word',
        w->>'phonetic',
        CASE
          WHEN (w->>'pos')::text IN ('noun','verb','adj','adv','phrase','other')
          THEN (w->>'pos')::TEXT
          ELSE NULL
        END,
        GREATEST(1, LEAST(5, COALESCE((w->>'difficulty')::INT, 3))),
        w->>'definition',
        w->>'example',
        w->>'example_vi',
        w->>'image_url',
        COALESCE(w->>'image_position', 'center')
      ) RETURNING id INTO new_id;

      -- ── topic_words junctions ─────────────────────────────
      IF jsonb_typeof(w->'topic_ids') = 'array' THEN
        INSERT INTO topic_words (topic_id, word_id)
          SELECT t::UUID, new_id
          FROM   jsonb_array_elements_text(w->'topic_ids') AS t
          WHERE  t IS NOT NULL AND t != ''
        ON CONFLICT DO NOTHING;
      END IF;

      -- ── word_choices (wrong options) ──────────────────────
      IF jsonb_typeof(w->'wrong_choices') = 'array' THEN
        sort_num := 1;
        FOR wrong_choice IN
          SELECT * FROM jsonb_array_elements_text(w->'wrong_choices')
        LOOP
          IF wrong_choice IS NOT NULL AND wrong_choice != '' THEN
            INSERT INTO word_choices (word_id, choice, sort)
            VALUES (new_id, wrong_choice, sort_num);
            sort_num := sort_num + 1;
          END IF;
        END LOOP;
      END IF;

      inserted_count := inserted_count + 1;

    EXCEPTION WHEN OTHERS THEN
      errors := errors || jsonb_build_object(
        'word',  w->>'word',
        'error', SQLERRM
      );
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'inserted', inserted_count,
    'errors',   errors
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
