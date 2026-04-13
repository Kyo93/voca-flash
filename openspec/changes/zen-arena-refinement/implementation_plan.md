# Implementation Plan: Zen Arena Refinement (Logic & UX Polish)

Kế hoạch này tập trung vào việc xử lý các vấn đề đã phát hiện trong Code Review để nâng cấp VocaFlash từ "hoạt động tốt" lên "hoàn thiện từng pixel".

## Proposed Changes

### 1. Hardening Foundations
#### [NEW] [utils.ts](file:///c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/lib/utils.ts)
- Triển khai `shuffleArray<T>(array: T[])` sử dụng thuật toán **Fisher-Yates** để thay thế cho `Math.random() - 0.5`.

### 2. Kinetic UI & UX Polish
#### [MODIFY] [ConstructionChallenge.tsx](file:///c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/components/review/ConstructionChallenge.tsx)
- Sử dụng `shuffleArray` mới.
- Thêm `useEffect` lắng nghe sự kiện bàn phím:
    - `Backspace`: Gọi hàm `undo()`.
    - `Enter`: Submit nếu đã đủ ký tự (nice to have).
- Tăng cường khả năng truy cập (A11y).

#### [MODIFY] [RecognitionChallenge.tsx](file:///c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/components/review/RecognitionChallenge.tsx)
- Lọc bỏ định nghĩa đúng khỏi danh sách `choices` trước khi shuffle để tránh trùng lặp.
- Đảm bảo `shuffled` luôn chứa đúng 4 lựa chọn duy nhất.

#### [MODIFY] [SessionSummary.tsx](file:///c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/components/review/SessionSummary.tsx)
- Cập nhật logic `setInterval` để đảm bảo `stepTime` không bao giờ nhỏ hơn 10ms (phòng ngừa lag trình duyệt).

### 3. State Integrity
#### [MODIFY] [useReviewSession.ts](file:///c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/hooks/useReviewSession.ts)
- Chuyển `setCurrentIndex` sang dạng functional update `prev => prev + 1` để đảm bảo an toàn tuyệt đối khi người dùng thao tác cực nhanh.

## Verification Plan

### Automated Verification
- Kiểm tra tính duy nhất của các lựa chọn trong `RecognitionChallenge`.
- Unit test nhẹ cho hàm `shuffleArray` trong console.

### Manual Verification
- Mở Review Arena, sử dụng phím **Backspace** để sửa lỗi khi sắp xếp từ.
- Kiểm tra các lựa chọn trong trắc nghiệm xem có bị trùng lặp không.
- Hoàn thành session và xem bộ đếm XP chạy có mượt không.
