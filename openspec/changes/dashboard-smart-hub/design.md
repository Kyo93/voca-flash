# Design: Global Smart Hub & Structural Separation (Refined)

## Context & Technical Approach
Dashboard sẽ đóng vai trò là "Trạm điều khiển" chia tách 2 nhu cầu học tập:
- **Học mới (Study):** Tập trung vào lật thẻ Flashcard theo chủ đề (Contextual learning).
- **Ôn tập (Review):** Tập trung vào việc kích hoạt trí nhớ (Active Recall) cho toàn bộ từ vựng đang học.

## Key Refinements (Fixing 4 Points)

1. **Card 1 Link Integrity**: Để `saveResumePointer` hoạt động, Card 1 phải truyền đủ 3 params: `topic` (slug), `topicId`, và `roadmapId`.
2. **Data Structure**: `fetchDashboardSummary` sẽ trả về `Topic` object đầy đủ thay vì chỉ slug, đảm bảo UI có đủ IDs cho routing.
3. **Card 2 Labeling**: Do DB hiện tại chưa lưu `next_review`, Card 2 sẽ hiển thị "Số từ đang trong tiến trình học" (learning pool) thay vì "Đến hạn ôn tập". Đây là con số thực tế nhất từ dữ liệu SRS hiện tại.
4. **Fallback Strategy**: Nếu không có lịch sử học, hệ thống lấy Roadmap active đầu tiên, sau đó lấy 2 Topics có `sort_order` thấp nhất.

## Proposed Changes

---

### `src/lib/supabase-storage.ts`

#### [NEW] `fetchDashboardSummary(userId: string)`
- **Logic Resume**: Lấy `last_topic_id` và `roadmap_id` từ `user_resume_pointers`. Query chi tiết `Topic`.
- **Logic Fallback**: 
  - Fetch `roadmaps` order by `created_at` limit 1.
  - Fetch `topics` lọc theo `roadmap_id` order by `sort_order` limit 2.
- **Logic Review**: Đếm `user_srs_records` where `mastered = false`.

---

### `src/pages/DashboardPage.tsx`
- Render Card 1 với route: `/study?topic=${topic.slug}&topicId=${topic.id}&roadmapId=${topic.roadmap_id}`.
- Render Card 2 với nội dung: "{count} từ đang học" và route `/review`.

---

### `src/pages/ReviewPage.tsx` (New)
- Giao diện Placeholder báo hiệu không gian Active Recall đang được phát triển.

## Verification Plan
1. Kiểm tra URL của "Học tiếp" trên Dashboard: phải chứa đủ 3 tham số.
2. Kiểm tra log `saveResumePointer` trong console khi nhấn học từ Dashboard.
3. Kiểm tra số lượng ở Thẻ Review: phải khớp với số "Learning" ở Sidebar.
4. Kiểm tra fallback cho User mới (chưa có pointer).
