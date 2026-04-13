# Implementation Checklist: Performance & Architecture Refactor

## Phase 1: Database Foundation (SQL)
- [ ] 1.1 Triển khai RPC `get_mastery_stats` để lấy số liệu nhanh.
- [ ] 1.2 Cập nhật RPC `get_user_vocabulary` hỗ trợ `limit`, `offset`, `search`, `filter`.
- [ ] 1.3 Tạo RPC `get_topic_completion_stats` (SQL Joins).
- [ ] 1.4 Thêm B-tree Index cho cột `word` và `definition` (hỗ trợ ILIKE).

## Phase 2: Storage Restructuring
- [ ] 2.1 Tạo thư mục `src/lib/storage/`.
- [ ] 2.2 Di chuyển logic Profile/Settings sang `auth-storage.ts`.
- [ ] 2.3 Di chuyển logic Mastery sang `mastery-storage.ts`.
- [ ] 2.4 Di chuyển logic Roadmap/Topic sang `roadmap-storage.ts`.
- [ ] 2.5 Di chuyển logic Review Session sang `session-storage.ts`.
- [ ] 2.6 Fix lỗi trùng lặp `UserStats` và update imports toàn bộ app.

## Phase 3: Mastery Page Optimization
- [ ] 3.1 Cập nhật `fetchUserVocabulary` trong `mastery-storage.ts` để gọi RPC mới.
- [ ] 3.2 Sửa UI `MasteryPage.tsx`: Chuyển logic `stats` dùng Server-side dữ liệu.
- [ ] 3.3 Triển khai Infinite Scroll (Tải 50 bản ghi/lần).
- [ ] 3.4 Thêm Debounced Search (300ms delay trước khi gọi API).
- [ ] 3.5 Bổ sung Skeleton Loading UI cho danh sách từ.

## Phase 4: Session Hardening
- [ ] 4.1 Thêm guard `isInitializing` vào `useReviewSession.ts`.
- [ ] 4.2 Cập nhật `submitAnswer` để xử lý lỗi khi mạng rớt (có thông báo cho user).
- [ ] 4.3 Thêm log warning nếu `upsertSrsRecord` tốn quá 2s (Latency monitoring).

---

## Verification Tasks
- [ ] Kiểm tra tốc độ load Mastery Page trên môi trường Dev.
- [ ] Xác nhận tính năng "Học tất cả kết quả lọc" hoạt động đúng.
- [ ] Kiểm tra tính tương thích ngược của các hàm Storage cũ sau khi chia nhỏ.
