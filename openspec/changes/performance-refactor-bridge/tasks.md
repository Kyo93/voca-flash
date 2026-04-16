# Implementation Checklist: Performance & Architecture Refactor

## Phase 1: Database Foundation (SQL)
- [x] 1.1 Triển khai RPC `get_mastery_stats` để lấy số liệu nhanh. (Done in Migration 012)
- [x] 1.2 Cập nhật RPC `get_user_vocabulary` hỗ trợ `limit`, `offset`, `search`, `filter`. (Done in Migration 012)
- [ ] 1.3 Tạo RPC `get_topic_completion_stats` (SQL Joins).
- [ ] 1.4 Thêm B-tree Index cho cột `word` và `definition` (hỗ trợ ILIKE).

## Phase 2: Storage Restructuring
- [x] 2.1 Tạo thư mục `src/lib/storage/`.
- [x] 2.2 Di chuyển logic Profile/Settings sang `auth-storage.ts`.
- [x] 2.3 Di chuyển logic Mastery sang `mastery-storage.ts`.
- [x] 2.4 Di chuyển logic Roadmap/Topic sang `roadmap-storage.ts`.
- [x] 2.5 Di chuyển logic Review Session sang `session-storage.ts`.
- [ ] 2.6 Fix lỗi trùng lặp `UserStats` và update imports toàn bộ app.

## Phase 3: Mastery Page Optimization
- [x] 3.1 Cập nhật `fetchUserVocabulary` trong `mastery-storage.ts` để gọi RPC mới. (Done)
- [ ] 3.2 Sửa UI `MasteryPage.tsx`: Chuyển sang State-based data (append mode).
- [ ] 3.3 Triển khai Infinite Scroll (Tải 50 bản ghi/lần).
- [ ] 3.4 Bổ sung Skeleton Loading UI cho danh sách từ.

## Phase 4: Session Hardening
- [ ] 4.1 Thêm guard `isInitializing` vào `useReviewSession.ts`.
- [ ] 4.2 Cập nhật `submitAnswer` để xử lý lỗi mạng (Error toast).
- [ ] 4.3 Thêm log warning nếu `upsertSrsRecord` tốn quá 2s.

---

## Verification Tasks
- [ ] Kiểm tra Network Tab: Chỉ tải 50 từ khi mở Mastery Page.
- [ ] Kiểm tra thanh tiến độ Roadmap: Đảm bảo vẫn hiển thị đúng % sau khi dùng RPC mới.
- [ ] Test Search: Tìm kiếm từ khóa và verify kết quả từ Server.
