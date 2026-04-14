# Design: Topic Slug Prefix + Block Roadmap Delete khi còn Topics

## Context & Technical Approach

### Problem Summary
1. `topics.slug` hiện có `UNIQUE` toàn cục → 2 roadmap không thể có topic cùng tên
2. Khi xóa roadmap, không có cơ chế ngăn chặn nếu còn topics

### Approach
- **Topic slug prefix**: Dùng `roadmap.slug` làm prefix cho topic slug → đảm bảo unique toàn cục
- **Block roadmap delete**: Kiểm tra topics trong roadmap trước khi xóa, block + warning nếu còn topic

## Data Flow

### Tạo topic mới:
```
Admin tạo "test" ở roadmap "300 từ cơ bản" (slug: 300-tu-co-ban)
  → buildTopicSlug("test", "300-tu-co-ban") = "300-tu-co-ban-test"
  → INSERT topics (slug: "300-tu-co-ban-test")
```

### Xóa roadmap:
```
Admin bấm xóa roadmap "Vỡ lòng"
  → Kiểm tra: còn topics?
    → CÓ: Hiện warning "Xóa tất cả topics trước" → block
    → KHÔNG: Cho xóa → user_learning_state bị CASCADE DELETE
```

## Cascade Chain

| Action | topics | words | word_choices | user_srs_records | user_learning_state |
|--------|--------|-------|-------------|-----------------|---------------------|
| Xóa topic | CASCADE | SET NULL | CASCADE | ✅ Không ảnh hưởng | SET NULL |
| Xóa roadmap (0 topics) | — | — | — | ✅ Không ảnh hưởng | CASCADE DELETE |

## Proposed Changes

### supabase/migrations/021_topic_slug_prefix.sql
- Migrate topic slug cũ: thêm `{roadmap_slug}-` prefix
- Giữ nguyên UNIQUE constraint (slug đã unique toàn cục sau khi migrate)

### src/components/admin/TopicFormModal.tsx
- Thêm prop `roadmapSlug?: string`
- Hàm `buildTopicSlug(name, roadmapSlug)` → prepend prefix
- Tự động update slug khi roadmap thay đổi trong modal

### src/components/admin/RoadmapList.tsx (hoặc trang Roadmaps)
- Trước khi xóa roadmap: query topics theo roadmap_id
- Nếu count > 0 → hiện ConfirmDialog warning "Xóa tất cả topics trước"
- Chỉ cho phép xóa khi topics = 0

### src/pages/admin/RoadmapsPage.tsx
- Truyền `selectedRoadmap?.slug` vào context hoặc trực tiếp vào TopicFormModal

## Verification
1. Tạo "test" ở roadmap A → slug = `{roadmap_slug_a}-test` ✅
2. Tạo "test" ở roadmap B → slug = `{roadmap_slug_b}-test` (khác nhau) ✅
3. Tạo "test" lần 2 ở roadmap A → bị block bởi UNIQUE ✅
4. Xóa topic "test" → words tồn tại, SRS records nguyên ✅
5. Xóa roadmap khi còn topics → bị block + warning ✅
