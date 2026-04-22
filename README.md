# VocaFlash — The Tactile Scholar

VocaFlash là một nền tảng học từ vựng tiếng Anh cao cấp, được thiết kế để tối ưu hóa khả năng ghi nhớ thông qua thuật toán Spaced Repetition (SRS) hiện đại và trải nghiệm người dùng tinh tế.

## 🌟 Tính năng nổi bật

-   **Hệ thống FSRS v5**: Thuật toán ghi nhớ tiên tiến nhất hiện nay, tự động điều chỉnh lịch học dựa trên khả năng tiếp thu của từng cá nhân.
-   **Review Arena**: 5 loại thử thách đa dạng (Recognition, Listening, Construction...) giúp xây dựng khả năng phản xạ từ vựng linh hoạt.
-   **Thiết kế Halo Modern**: Giao diện tập trung vào sự tối giản, sử dụng các token thiết kế "Tactile Scholar" mang lại cảm giác dễ chịu và chuyên nghiệp.
-   **Đồng bộ Cloud**: Toàn bộ dữ liệu tiến trình, streak và ghi chú được lưu trữ an toàn trên Supabase.
-   **Hỗ trợ đa phương tiện**: Hình ảnh minh họa chất lượng cao và âm thanh (TTS) chuẩn bản xứ.

## 🛠 Tech Stack

-   **Frontend**: React 19, Vite, React Router v7.
-   **Styling**: Tailwind CSS v4.
-   **Database/Auth**: Supabase.
-   **Animation**: Framer Motion.
-   **Internationalization**: i18next (Tiếng Việt & Tiếng Anh).

## 🚀 Bắt đầu nhanh

### Yêu cầu hệ thống
-   Node.js 18+
-   npm hoặc pnpm

### Cài đặt
1.  Clone repository:
    ```bash
    git clone https://github.com/Kyo93/voca-flash.git
    cd voca-flash
    ```
2.  Cài đặt dependencies:
    ```bash
    npm install
    ```
3.  Cấu hình biến môi trường:
    Tạo file `.env` và thêm:
    ```env
    VITE_SUPABASE_URL=your_url
    VITE_SUPABASE_ANON_KEY=your_key
    ```
4.  Chạy ứng dụng:
    ```bash
    npm run dev
    ```

## 📖 Tài liệu hướng dẫn
-   [Kiến trúc hệ thống (ARCHITECTURE.md)](ARCHITECTURE.md)
-   [Hệ thống thiết kế (DESIGN.md)](DESIGN.md)
-   [Quy tắc phát triển (AGENTS.md)](AGENTS.md)

---
*VocaFlash — Nâng tầm trải nghiệm học tập của bạn.*
