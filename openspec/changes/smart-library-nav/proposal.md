# Proposal: Smart Library Navigation

Tối ưu hóa hành trình người dùng bằng cách tự động điều hướng vào Roadmap đang học khi nhấn vào menu "Thư viện".

## Qualified Problem
Hiện tại, người dùng mỗi khi nhấn vào "Thư viện" đều phải đi qua trang danh sách Roadmap (Explorer). Điều này gây tốn thêm 1-2 click chuột không cần thiết đối với những người đã có Roadmap mục tiêu.

### Root Causes
1. Link "Thư viện" trong Sidebar đang được hardcode cố định về `/library`.
2. Hệ thống chưa tận dụng dữ liệu `user_resume_pointers` để cá nhân hóa điều hướng.

## Proposed Solution: Sidebar Intelligence
Chúng ta sẽ nâng cấp Sidebar để nó biết được người dùng đang học Roadmap nào và thay đổi đích đến của nút "Thư viện" một cách thông minh.

### Option A: Sidebar Dynamic Link (Recommended)
- **Cơ chế**: Thêm `activeRoadmapSlug` vào `AuthContext`.
- **Luồng dữ liệu**:
    1. `AuthContext` khi load profile sẽ lấy thêm slug của Roadmap cuối cùng mà user tương tác từ table `user_resume_pointers` (join với `roadmaps`).
    2. `Sidebar.tsx` sử dụng slug này để tính toán đường dẫn: `/library/${slug}` hoặc `/library`.
- **Ưu điểm**: Phản hồi tức thì, URL hiển thị đúng ngay khi rê chuột vào, không có hiện tượng "nháy" trang (redirect).

### Option B: Library Page Auto-Redirect
- **Cơ chế**: Giữ nguyên link `/library`. Khi user vào trang này, Component sẽ kiểm tra và `navigate` sang trang Topic nếu có enrollment.
- **Nhược điểm**: Gây hiện tượng nhảy trang (flash of content).

## Next Steps for Planning
1. Mở rộng `AuthContextValue` để bao gồm `activeRoadmapSlug`.
2. Cập nhật `loadUserData` trong `AuthContext` để fetch thông tin này.
3. Chỉnh sửa logic render `navItems` trong `Sidebar.tsx`.

## Open Questions
- [@Ocean]: Nếu người dùng chưa từng học bài nào (chưa có resume pointer) nhưng đã "Enroll" (nếu sau này có nút Enroll), chúng ta có muốn tính đó là active không? (Hiện tại hệ thống tính active dựa trên lần truy cập cuối cùng).
