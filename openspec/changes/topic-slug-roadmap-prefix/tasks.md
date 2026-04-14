# Implementation Checklist

## Phase 1: Database Migration (Supabase SQL Editor)

- [ ] 1.1 Tạo file `supabase/migrations/021_topic_slug_prefix.sql`
  - Tạo function `build_topic_slug(topic_name, roadmap_slug)` để migrate
  - UPDATE tất cả topics có `roadmap_id != NULL` → thêm `{roadmap_slug}-` prefix vào slug hiện tại
  - Nếu slug đã có prefix roadmap_slug → bỏ qua (tránh double-prefix khi chạy lại)
  - Verify: `SELECT slug FROM topics WHERE roadmap_id IS NOT NULL LIMIT 10`
  - `NOTIFY pgrst, 'reload schema'`

- [ ] 1.2 Chạy migration trong Supabase SQL Editor

- [ ] 1.3 Verify: kiểm tra slug đã có prefix, không duplicate

## Phase 2: Frontend — Topic Slug Generation

- [ ] 2.1 Cập nhật `src/components/admin/TopicFormModal.tsx`
  - Thêm prop `roadmapSlug?: string`
  - Thêm hàm `buildTopicSlug(name: string, roadmapSlug: string): string` → trả về `{roadmapSlug}-{slugify(name)}`
  - Logic: nếu `roadmapId` có giá trị → dùng `buildTopicSlug`, nếu không → dùng `slugify` thường
  - Tự động cập nhật slug khi `name` hoặc `roadmapId` thay đổi (chỉ khi tạo mới, không update khi edit)

- [ ] 2.2 Cập nhật `src/pages/admin/TopicsPage.tsx`
  - Truyền `roadmapSlug={selectedRoadmap?.slug}` xuống TopicFormModal

- [ ] 2.3 Cập nhật `src/components/admin/AdminSidebar.tsx`
  - Dropdown roadmap giữ nguyên (không cần thay đổi)

## Phase 3: Frontend — Block Roadmap Delete

- [ ] 3.1 Cập nhật `src/pages/admin/RoadmapsPage.tsx`
  - Thêm hàm kiểm tra topic count: `getTopicCountByRoadmap(roadmapId)`
  - Khi bấm xóa roadmap:
    - Query topics theo `roadmap_id`
    - Nếu count > 0 → hiện ConfirmDialog với message cảnh báo "Còn {count} topics trong roadmap này. Xóa tất cả topics trước."
    - Nếu count = 0 → hiện ConfirmDialog xóa bình thường

## Phase 4: Test & Verify

- [ ] 4.1 Tạo topic "test" ở roadmap A → slug = `{slug_a}-test` ✅
- [ ] 4.2 Tạo topic "test" ở roadmap B → slug = `{slug_b}-test` (khác nhau) ✅
- [ ] 4.3 Tạo "test" lần 2 ở roadmap A → bị block bởi UNIQUE ✅
- [ ] 4.4 Xóa topic "test" → words vẫn tồn tại, SRS records nguyên ✅
- [ ] 4.5 Xóa roadmap khi còn topics → bị block + warning ✅
- [ ] 4.6 Xóa roadmap khi không còn topics → xóa thành công ✅