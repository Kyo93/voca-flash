# Design: Zen Arena Refinement

## Context & Technical Approach
Dựa trên kết quả Code Review sau Phase Zen Arena 2.0, chúng ta cần tinh chỉnh các chi tiết nhỏ về hiệu suất, logic shuffle và trải nghiệm người dùng (UX) để đạt độ hoàn thiện cao nhất.

Cách tiếp cận:
- **Hardening Logic**: Thay thế các thuật toán shuffle không đồng nhất bằng phương pháp tin cậy hơn.
- **State Atomicity**: Chuyển đổi các cập nhật state quan trọng sang dạng functional updates để tránh race-condition.
- **UX Polish**: Thêm phím tắt (keyboard shortcuts) và tinh chỉnh thời gian animation.

## Proposed Changes

### [Component] `SessionSummary.tsx`
- Giới hạn `stepTime` của bộ đếm XP ở mức tối thiểu 10ms.
- Sử dụng CSS variable cho background để đảm bảo tính nhất quán.

### [Component] `ConstructionChallenge.tsx`
- Triển khai thuật toán Fisher-Yates shuffle cho việc trộn ký tự.
- Thêm lắng nghe phím `Backspace` để kích hoạt hàm `undo()`.

### [Component] `RecognitionChallenge.tsx`
- Sử dụng `Set` hoặc filter để loại bỏ các lựa chọn bị trùng lặp.
- Thêm `AnimatePresence` mode `wait` hoặc `popLayout` chuẩn xác hơn nếu cần.

### [Hook] `useReviewSession.ts`
- Cập nhật `setCurrentIndex(prev => prev + 1)` để đảm bảo tính nguyên tử của index.
- Tinh chỉnh logic điểm thưởng cho `ghost_recall`.

## Verification
- Kiểm tra tính năng Undo bằng phím Backspace.
- Kiểm tra không còn lựa chọn trùng lặp trong Recognition Challenge.
- Kiểm tra bộ đếm XP chạy ổn định với số điểm lớn.
