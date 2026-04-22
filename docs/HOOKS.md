# VocaFlash Hook Architecture

Tài liệu này hướng dẫn cách sử dụng và xây dựng Custom Hooks trong VocaFlash để đảm bảo nguyên tắc **Logic Isolation** (Cách ly Logic).

## Nguyên tắc cốt lõi
1. **Lean Components**: Các Component (Page/UI) chỉ nên chứa logic hiển thị và gọi hàm từ Hook.
2. **Logic Isolation**: Toàn bộ data fetching, filtering, sorting, và complex state management phải nằm trong Hook.
3. **Reusability**: Hook phải dễ dàng tái sử dụng giữa các Page khác nhau (ví dụ: `useMasteryWords`).

## Danh sách Hooks chính

### `useMasteryWords.ts`
- **Mục đích**: Quản lý danh sách từ vựng cá nhân, bộ lọc (all/due/mastered) và tìm kiếm.
- **Dùng tại**: `MasteryPage.tsx`.

### `useRoadmapTopics.ts`
- **Mục đích**: Lấy dữ liệu lộ trình học (Roadmap), tính toán tiến độ (Progress) và sắp xếp Topic theo thứ tự ưu tiên (Featured/Up Next).
- **Dùng tại**: `RoadmapTopicsPage.tsx`.

### `useFlashcard.ts`
- **Mục đích**: Quản lý trạng thái học thẻ (Front/Back), tính toán FSRS và cập nhật tiến độ.
- **Dùng tại**: `StudyPage.tsx`.

## Quy trình bóc tách Logic (Refactoring Pattern)

Khi một Page vượt quá 200 dòng code, hãy thực hiện:
1. Xác định state và `useEffect` fetch dữ liệu.
2. Tạo file hook mới trong `src/hooks/`.
3. Di chuyển logic fetch và `useMemo` tính toán vào hook.
4. Trả về các biến cần thiết (data, loading, handlers).
5. Cập nhật Page để sử dụng hook mới.

## Best Practices
- Luôn xử lý `loading` và `error` bên trong hook.
- Sử dụng `useMemo` cho các phép tính toán tốn kém (như sorting mảng lớn).
- Tránh truyền quá nhiều props vào hook; ưu tiên lấy từ `Context` (như `AuthContext`).
