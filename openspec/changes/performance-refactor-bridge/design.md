# Design: Performance & Architecture Refactor (Bridge Plan)

## Context & Technical Approach
Hiện tại ứng dụng đang gặp vấn đề về khả năng mở rộng (Scalability) do toàn bộ dữ liệu được tải về Client và xử lý thủ công. Kế hoạch này tập trung vào việc "Đẩy logic về phía Server" và "Module hóa" mã nguồn để chuẩn bị cho việc phát triển quy mô lớn.

### Core Strategies
1. **Database-First Logic:** Chuyển các phép tính thống kê (Stats) và lọc (Filtering) sang Supabase RPC.
2. **Modular Storage:** Chia nhỏ `supabase-storage.ts` để dễ bảo trì và tránh trùng lặp Type.
3. **Pagination Foundation:** Triển khai cơ chế Phân trang cho mọi danh sách lớn.
4. **Resilient Session:** Sửa lỗi Race conditions trong Review session.

---

## Proposed Changes

### 1. Storage Refactor (`src/lib/storage/`)
- Tách `supabase-storage.ts` thành các module độc lập:
    - `auth-storage.ts`: Profile, Settings, Streaks.
    - `mastery-storage.ts`: Vocab, Pagination, Mastery Stats.
    - `roadmap-storage.ts`: Roadmaps, Topics, Roadmap Stats.
    - `session-storage.ts`: Reviews, SRS Upserts.
- Loại bỏ các Interface trùng lặp.

### 2. Database Layer (Supabase RPCs)
- **`get_mastery_stats`**: Tính toán các chỉ số cho trang Mastery trong 1 lần query.
- **`get_user_vocabulary` (v2)**: 
    - Tham số: `p_limit`, `p_offset`, `p_search`, `p_filter`.
    - Trả về: `data[]` + `total_count`.
- **`get_topic_completion_stats`**: Thay thế vòng lặp O(N) phía Client bằng SQL Aggregation.

### 3. Logic & Hooks
- **`useReviewSession.ts`**:
    - Thêm flag `isInitializing` để chặn race conditions.
    - Thêm cơ chế retry cho các lệnh upsert quan trọng.
- **`MasteryPage.tsx`**:
    - Triển khai `IntersectionObserver` cho Infinite Scroll.
    - Dùng `Skeleton` UI thay cho màn hình Loading trống.

---

## Verification
1. **Performance Test**: Đo thời gian tải trang Mastery với 1000+ từ (Mục tiêu < 500ms).
2. **Data Integrity**: Đảm bảo số lượng từ "Mastered" khớp giữa Dashboard và Mastery Page.
3. **Stress Test**: Chỉnh Network thành "Slow 3G" để kiểm tra tính ổn định của Review Session.
