# Design: Clean Code Unification

## Context & Technical Approach
Dự án Voca-flash hiện đang gặp vấn đề về "Fat Pages" (trang quá lớn), lồng ghép quá nhiều logic nghiệp vụ vào tầng UI và thiếu sự đồng nhất trong xử lý SRS/Audio. 

**Kế hoạch này áp dụng 2 chiến lược TRIZ chính:**
1. **Segmentation (Phân đoạn)**: Chia nhỏ các tệp tin > 300 dòng thành các module chuyên biệt.
2. **Taking Out (Trích xuất)**: Đẩy hằng số, logic tính toán và quản lý trạng thái ra khỏi Component UI.

Chúng ta sẽ sử dụng kiến trúc **Atomic-lite**: Giữ các sub-components trong thư mục `src/components/`, đảm bảo tính tái sử dụng cao và dễ dàng kiểm thử Unit Test.

## Proposed Changes

### 1. Shared Foundations (Lõi dùng chung)
#### `src/components/common/AudioButton.tsx`
- **Thay đổi**: Trích xuất logic phát âm từ `StudyPage`.
- **Lý do**: Triệt tiêu sự lặp lại code (DRY) và cho phép các trang khác (Library, Mastery) sử dụng chung một cơ chế xử lý âm thanh đồng nhất.

#### `src/lib/srs.ts`
- **Thay đổi**: Thêm hàm hằng `getSrsLevelConfig`.
- **Lý do**: Đồng bộ hóa nhãn cấp độ (Fresh, Mastered...) trên toàn hệ thống từ một nguồn sự thật duy nhất.

### 2. Study Session Refactoring (Cấu trúc lại bài học)
#### `src/pages/StudyPage.tsx`
- **Thay đổi**: Giảm từ 633 dòng xuống <250 dòng.
- **Cách làm**: Chuyển giao diện mặt trước/sau thẻ sang các file riêng tại `src/components/study/`. Trích xuất logic Timer sang Custom Hook.

#### `src/hooks/useStudySessionMode.ts` [NEW]
- **Thay đổi**: Quản lý trạng thái Quiz, Timer và các bẫy lỗi (Guard Clauses).
- **Lý do**: Tách biệt hoàn toàn Logic (Model/Controller) khỏi View.

### 3. Roadmap & Mastery Cleanup
#### `src/components/roadmap/TopicCard.tsx` [NEW]
- **Thay đổi**: Hợp nhất logic của 3 loại card vào một component có prop `variant`.
- **Lý do**: Dễ dàng bảo trì giao diện roadmap khi có thay đổi thiết kế Tactile Scholar.

## Verification
- **Automated**: Chạy `npm run test:gate` sau mỗi giai đoạn. Kỳ vọng pass 100% (197/197 tests).
- **Manual**: Sử dụng trình duyệt để xác nhận:
    - Bài học ổn định, không reset khi chuyển tab.
    - Giao diện Roadmap hiển thị đúng các biến thể Card.
    - Nút phát âm hoạt động đúng ở mọi trang.
