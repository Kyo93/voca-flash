# Unified App Layout Refactoring Walkthrough

Chúng ta đã thành công trong việc hợp nhất cấu trúc giao diện (Layout) của ứng dụng **VocabMaster**, tạo ra một trải nghiệm nhất quán và chuyên nghiệp trên tất cả các trang.

## Các thay đổi chính

### 1. Hệ thống Layout trung tâm (`AppLayout.tsx`)
- Tạo khung giao diện sử dụng **CSS Grid** với 3 cột: `Sidebar | Main | RightSidebar (tùy chọn)`.
- Sử dụng `react-router-dom` `Outlet` để lồng ghép các trang con, giúp Sidebar và Header không bị render lại khi chuyển trang.
- Tự động xác định tiêu đề trang dựa trên đường dẫn (Breadcrumb logic).

### 2. Component Header dùng chung (`Header.tsx`)
- Tách biệt thanh điều hướng trên cùng thành một component độc lập.
- Tích hợp ô tìm kiếm toàn cục, thông báo, huy hiệu **Streak** (lấy dữ liệu thực từ Supabase) và Avatar người dùng.
- Hỗ trợ cơ chế Search Context để các trang con (như Roadmap Topics) có thể lọc dữ liệu dựa trên từ khóa nhập vào từ Header.

### 3. Cải tiến Sidebar (`Sidebar.tsx`)
- Cập nhật logic highlight sang `startsWith` để hỗ trợ các đường dẫn con (ví dụ: truy cập vào roadmap cụ thể vẫn highlight mục "Library").
- Cấu trúc lại để hoạt động mượt mà bên trong `AppLayout`.

### 4. Refactor các trang chính
- **DashboardPage**: Gỡ bỏ mã nguồn layout cũ, chuyển Stats và Right Sidebar sang cơ chế Portal để hiển thị đúng vị trí trong Layout chung.
- **LibraryPage**: Tối ưu hóa giao diện, loại bỏ nội dung trùng lặp.
- **RoadmapTopicsPage**: Kết nối thành công với thanh Search toàn cục ở Header để lọc các chủ đề.

## Kết quả Verification

Tôi đã thực hiện kiểm tra tự động trên trình duyệt và xác nhận:
- [x] Chuyển trang mượt mà, Sidebar không bị giật/lag.
- [x] Dữ liệu Steak hiển thị đúng trên tất cả các trang.
- [x] Tính năng tìm kiếm ở trang danh sách chủ đề hoạt động chuẩn xác từ thanh tìm kiếm trên Header.
- [x] Gỡ bỏ hoàn toàn các lỗi cú pháp và lỗi màn hình trắng.
