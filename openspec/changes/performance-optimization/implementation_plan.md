# Implementation Plan: Mastery Performance Optimization (Phương án A)

## Mục tiêu
Tối ưu hóa trang Mastery (Kho từ vựng) để xử lý mượt mà hàng nghìn bản ghi bằng cách chuyển logic từ Client sang Server.

---

## 🛠️ Các thay đổi kỹ thuật

### 1. Database (Supabase RPCs)
- **Tạo `get_mastery_stats`:** RPC mới để tính toán các con số thống kê (Đã thuộc, Đến hạn, Từ yếu) ngay trên Database thông qua một lần gọi. Điều này thay thế việc tải toàn bộ danh sách để đếm phía Client.
- **Cập nhật `get_user_vocabulary`:** Thêm các tham số `p_limit` và `p_offset` để hỗ trợ phân trang (Pagination).

### 2. Storage Layer (`supabase-storage.ts`)
- **`fetchMasteryStats`:** Hàm mới gọi RPC thống kê.
- **Cập nhật `fetchUserVocabulary`:** Hỗ trợ truyền tham số phân trang xuống Database.

### 3. UI Component (`MasteryPage.tsx`)
- **Infinite Scroll:** Sử dụng `IntersectionObserver` để tự động tải thêm 50 từ khi người dùng cuộn xuống dưới cùng.
- **Debounced Search:** Chỉ gọi API tìm kiếm sau khi người dùng ngừng gõ 500ms để giảm tải (Search phía Server).
- **Server-side Statistics:** Cập nhật các thẻ thông báo dựa trên dữ liệu từ `get_mastery_stats`.

---

## 📈 Hiệu quả mong đợi
- **Tốc độ tải trang đầu tiên:** Giảm từ ~2s xuống <500ms (chỉ tải 50 từ đầu thay vì 1000+).
- **Mức độ chiếm dụng bộ nhớ:** Giảm đáng kể vì không cần giữ hàng nghìn Object từ vựng trong RAM.
- **Trải nghiệm người dùng:** Cuộn trang mượt mà không bị giật (Lag).

---

## ⏳ Lộ trình thực hiện
1. **Bước 1:** Cài đặt RPC `get_mastery_stats` và cập nhật SQL cho `get_user_vocabulary`.
2. **Bước 2:** Refactor `supabase-storage.ts` để hỗ trợ tham số mới.
3. **Bước 3:** Cập nhật `MasteryPage.tsx` triển khai Infinite Scroll và UI mới.
