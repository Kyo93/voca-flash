# Design System — The Tactile Scholar (Halo Modern)

Hệ thống thiết kế của VocaFlash tập trung vào sự tập trung cao độ, cảm giác vật lý (tactile) và sự tinh tế hiện đại.

## 1. Bảng màu (Color Palette)

Sử dụng bảng màu mang sắc thái tự nhiên, tạo cảm giác như giấy và mực thật.

- **Primary (Terracotta)**: `#E67E22` - Sự hăng hái, nhiệt huyết trong học tập.
- **Secondary (Sage)**: `#829460` - Sự điềm tĩnh, làm chủ kiến thức.
- **Surface (Heavy Weight Paper)**: `#F7F2E8` - Nền tảng trung tính, dịu mắt.
- **Error (Alert Red)**: `#B3261E` - Sự khẩn cấp và cảnh báo.

## 2. Bo góc (Radius Tokens)

Sử dụng phong cách bo góc "Approachable Roundedness" để làm giảm sự căng thẳng khi học.

- **`radius-4xl`**: `2.5rem` (40px) - Dùng cho các Card lớn, trang Cài đặt, Dashboard sections.
- **`radius-3xl`**: `2rem` (32px) - Dùng cho Flashcards.
- **`radius-2xl`**: `1.5rem` (24px) - Dùng cho Dialogs, Modals.
- **`radius-xl`**: `1.25rem` (20px) - Dùng cho Buttons lớn.
- **`radius-lg`**: `1.125rem` (18px) - Chuẩn cho các input/select fields.

## 3. Typography

- **Headline & Body**: "Be Vietnam Pro" - Tối ưu cho hiển thị tiếng Việt, hiện đại và dễ đọc.
- **Weight Strategy**:
    - **Black (900)**: Chỉ dùng cho các tiêu đề chính hoặc con số quan trọng.
    - **Bold (700)**: Cho các label và hành động chính.
    - **Medium (500)**: Cho nội dung mô tả, văn bản chính.

## 4. Hiệu ứng (Visual Effects)

- **Glassmorphism**: 
    - Nền: `rgba(247, 242, 232, 0.85)`
    - Blur: `backdrop-blur-md`
    - Viền: `1px solid rgba(255, 255, 255, 0.4)`
- **Shadows**: Sử dụng shadow cực mỏng và lan rộng để tạo độ nổi khối tự nhiên (elevation) thay vì đổ bóng đậm.

## 5. Quy tắc Trình bày

- **Spacing**: Sử dụng hệ thống 4px (Gap 1 = 4px, Gap 4 = 16px).
- **Safe Area**: Luôn giữ khoảng cách ít nhất 24px (p-6) cho nội dung bên trong card để tạo sự thoáng đãng.

---

*Tài liệu này là cẩm nang thiết kế cho tất cả các thành phần UI mới trong VocaFlash.*
