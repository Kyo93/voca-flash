# Design: Performance & Architecture Refactor (Bridge Plan)

## Context & Technical Approach
Hiện tại ứng dụng đang gặp vấn đề về khả năng mở rộng (Scalability) do toàn bộ dữ liệu được tải về Client và xử lý thủ công. Kế hoạch này tập trung vào việc "Đẩy logic về phía Server" và "Module hóa" mã nguồn.

### Current Status (2026-04-13)
- **Phase 1 (Partial):** `get_mastery_stats` và `get_user_vocabulary_v2` đã xong.
- **Phase 2 (Done):** Đã chia tách thành công `src/lib/storage/` (auth, mastery, roadmap, session).
- **Remaining:** RPC `get_topic_completion_stats`, Indices, và UI Optimization cho Mastery Page.

### Core Strategies
1. **Database-First Logic:** Chuyển các phép tính thống kê (Stats) và lọc (Filtering) sang Supabase RPC.
2. **Modular Storage:** Tách module để dễ bảo trì, hiện đã hoàn thành cấu trúc thư mục.
3. **Pagination Foundation:** Triển khai cơ chế Phân trang cho Mastery Page (50 bản ghi/lần).
4. **Resilient Session:** Sửa lỗi Race conditions trong Review session bằng state `isInitializing`.

---

## Proposed Changes

### 1. Database Layer (Supabase RPCs) - Finishing Phase 1
- **`get_topic_completion_stats`**: 
    - Nhận vào `p_user_id` và `p_topic_ids[]`.
    - Trả về bảng gồm `topic_id`, `total_words`, `learned_count`, `percent_complete`.
    - Dùng SQL JOIN giữa `topic_words` và `user_srs_records`.
- **Search Indices**:
    - `CREATE INDEX idx_words_word_search ON words USING btree (word text_pattern_ops);`
    - `CREATE INDEX idx_words_def_search ON words USING btree (definition text_pattern_ops);`

### 2. Mastery Page Optimization (Phase 3)
- **State Management**: Thay đổi `MasteryPage` để quản lý `words` theo dạng append (để hỗ trợ Infinite Scroll).
- **Search & Filter**: Mỗi khi search/filter thay đổi, reset `offset` về 0 và gọi lại API.
- **IntersectionObserver**: Đặt một `target` ở cuối danh sách để trigger fetch trang tiếp theo.

### 3. Session Hardening (Phase 4)
- **`useReviewSession.ts`**: Thêm `guard` để tránh trường hợp session bị khởi tạo 2 lần khi React StrictMode chạy trong Dev.

---

## Verification
1. **Performance Test**: Kiểm tra Network Tab để xác nhận query chỉ lấy đúng 50 từ/lần.
2. **Search Speed**: Test với từ khóa phổ biến để xem Index có hoạt động tốt không.
3. **Progress Integrity**: Đảm bảo thanh tiến độ Roadmap vẫn tải chính xác sau khi chuyển sang RPC mới.
