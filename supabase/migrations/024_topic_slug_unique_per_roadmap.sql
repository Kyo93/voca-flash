-- ============================================================
-- Migration: 024_topic_slug_unique_per_roadmap
-- Description: Change topics.slug from global UNIQUE to
--              UNIQUE (roadmap_id, slug) per-roadmap uniqueness.
--              Fixes conflict when 2 roadmaps create same topic name.
-- ============================================================

-- Bước 1: Drop constraint cũ (global UNIQUE trên slug)
ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_slug_key;

-- Bước 2: Đảm bảo roadmap_id không NULL (topic luôn thuộc 1 roadmap)
-- Nếu có topic nào có roadmap_id = NULL → đặt thành placeholder (cần xử lý trước)
-- Hiện tại tất cả topic import đều có roadmap_id → an toàn
ALTER TABLE topics ALTER COLUMN roadmap_id SET NOT NULL;

-- Bước 3: Thêm constraint mới — unique per roadmap
-- PostgreSQL: NULL = NULL là không bằng nhau → 2 row có roadmap_id NULL sẽ KHÔNG conflict
-- Nhưng vì roadmap_id đã NOT NULL ở bước 2 → hoàn toàn safe
ALTER TABLE topics ADD CONSTRAINT topics_roadmap_slug_unique UNIQUE (roadmap_id, slug);

-- Bước 4: Reload PostgREST cache để API thấy schema mới
NOTIFY pgrst, 'reload schema';