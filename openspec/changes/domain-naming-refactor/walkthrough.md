# Walkthrough: Performance & Architecture Audit (Phase 1-2)

> [!NOTE]
> Tài liệu này đóng vai trò là bản báo cáo cơ sở (baseline) về hiệu suất và cấu trúc trước khi tiến hành các đợt refactor lớn về domain naming.

## 🚀 Hiện trạng Hiệu suất - Vocab Hero

Dưới đây là phân tích về các thành phần kỹ thuật chính và các rủi ro đã được xác định.

### Tổng quan Kích thước
| Thành phần | Kích thước | Ghi chú |
|---|---|---|
| `main.js` | **101 KB** | ⚠️ Quá lớn — monolith file |
| `dictionary-service.js` | **37 KB** | ⚠️ Chứa 500+ từ embed trong code |
| 10x data partitions | **~223 KB** | Toàn bộ load lúc khởi tạo |
| **Tổng bundle** | **~430+ KB JS** | Chưa tính tài nguyên bên ngoài |

## 🔴 Các vấn đề nghiêm trọng

### 1. Cấu trúc Monolith
Toàn bộ logic ứng dụng nằm trong một file duy nhất, khiến trình duyệt phải parse toàn bộ trước khi hiển thị, ảnh hưởng tới TTI (Time to Interactive).

### 2. Quản lý Dữ liệu cồng kềnh
Hệ thống hiện tại tải hơn 1,500 từ vào bộ nhớ ngay lập tức khi khởi tạo, gây áp lực lên các thiết bị cấu hình yếu.

### 3. Tài nguyên Render-blocking
Sử dụng các thư viện icon và font đồ sộ (~550KB) từ CDN mà không có cơ chế lazy-load, làm chậm quá trình First Paint.

## ✅ Kế hoạch Tối ưu (Dựa trên Audit)

1. **Font & Icon Optimization**: Giảm số lượng weight font và triển khai `display=swap`.
2. **Lazy Loading Images**: Thêm thuộc tính `loading="lazy"` cho toàn bộ ảnh flashcard.
3. **Vite Build Optimization**: Cấu hình chia nhỏ chunk (splitting) và nén dữ liệu.
4. **Refactor Modules**: Chia nhỏ `main.js` thành các domain-specific modules (đây là tiền đề cho phase Domain Naming Refactor).

---
**Status**: `Audited` | **Phase**: `Pre-Refactor`
