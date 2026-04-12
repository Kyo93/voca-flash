# Design: Review Arena — The Quantum Hybrid Flow

## Context & Technical Approach
Mục tiêu là tạo ra một môi trường ôn tập có độ tập trung cao nhất và hiệu quả ghi nhớ lâu dài nhất. Chúng ta sẽ chuyển đổi từ việc chỉ đếm số lượng từ sang sử dụng thuật toán SM-2 đầy đủ.

### Phân tách Chế độ (Pedagogical Split)
- **Study Mode:** Học theo Topic (Contextual).
- **Review Mode:** Ôn tập ngẫu nhiên (Mixed context/Zen Mode).

## Data Flow
1. **Fetch:** Dashboard cung cấp số lượng từ cần ôn tập.
2. **Session Start:** `ReviewPage` lấy danh sách từ có `next_review_at <= now` (hoặc các từ trong learning pool).
3. **Challenge Selection:** Với mỗi từ, hệ thống xác định `repetitions`.
   - `repetitions < 2` (Mới): Hiện Trắc nghiệm / Điền vào chỗ trống.
   - `repetitions >= 2` (Đã quen): Hiện Sắp xếp từ / Ghost Recall.
4. **Update:** Kết quả được đưa qua hàm `calculateNextReview` (SM-2) và UPSERT vào cơ sở dữ liệu.

## UI/UX: The Zen Shell
- Sử dụng CSS Grid tối giản.
- Hiệu ứng `backdrop-blur` cho phần "Gợi ý".
- Keyboard-first: Hỗ trợ các phím tắt (Space: Reveal, 1-4: Choice, Enter: Next).

## Verification
- Kiểm tra tính nhất quán của dữ liệu SRS sau khi hoàn thành 1 session.
- Kiểm tra việc chuyển đổi mượt mà giữa các loại thử thách (Quadrant).
