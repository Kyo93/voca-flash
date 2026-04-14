-- Migration 021: Topic Slug Roadmap Prefix
-- Fix: topics.slug là UNIQUE global → thêm roadmap slug làm prefix để 2 roadmap có topic cùng tên không bị conflict.

-- Bước 1: Tạo function migrate topic slug với prefix
CREATE OR REPLACE FUNCTION migrate_topic_slugs()
RETURNS void AS $$
DECLARE
  r RECORD;
  new_slug TEXT;
BEGIN
  FOR r IN
    SELECT t.id, t.slug, t.roadmap_id, rd.slug AS roadmap_slug
    FROM topics t
    JOIN roadmaps rd ON rd.id = t.roadmap_id
    WHERE t.roadmap_id IS NOT NULL
  LOOP
    -- Chỉ migrate nếu slug chưa có prefix roadmap_slug (tránh double-prefix khi chạy lại)
    IF r.slug NOT LIKE r.roadmap_slug || '-%' THEN
      new_slug := r.roadmap_slug || '-' || r.slug;
      UPDATE topics SET slug = new_slug WHERE id = r.id;
      RAISE NOTICE 'Migrated topic slug: % -> %', r.slug, new_slug;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bước 2: Chạy migrate
SELECT migrate_topic_slugs();

-- Bước 3: Drop function tạm (không cần nữa)
DROP FUNCTION IF EXISTS migrate_topic_slugs();

-- Bước 4: Verify không duplicate sau migrate
-- (Sẽ throw error nếu có duplicate — nghĩa là data đã có vấn đề trước đó)
-- SELECT slug, COUNT(*) FROM topics GROUP BY slug HAVING COUNT(*) > 1;

-- Bước 5: Reload PostgREST cache
NOTIFY pgrst, 'reload schema';