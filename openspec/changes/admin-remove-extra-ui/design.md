# Design: Admin — Remove Extra UI

## Context

Admin panel có 2 phần UI thừa gây cognitive load cho admin:
1. Dropdown "Lộ trình hiện tại" trên sidebar — trùng lặp context khi đã ở trong roadmap
2. Nav item "Chủ đề" — đứng ngang hàng với "Lộ trình", gây nhầm hierarchy
3. Roadmap badge trên mỗi row trong TopicsPage — trùng lặp thông tin context

**Yêu cầu:** Chỉ xóa UI, giữ nguyên `RoadmapContext` và logic.

## Proposed Changes

### `src/components/admin/AdminSidebar.tsx`

**Thay đổi 1 — Xóa dropdown "Lộ trình hiện tại":**
- Xóa khối JSX dòng 57–109 (phần selector + dropdown panel)
- Xóa import `useState, useRef, useEffect` (dòng 5) nếu không còn dùng
- Xóa biến `open`, `selectorRef`, `useEffect` (dòng 21–32) nếu không còn dùng
- Xóa `useRoadmapContext` (dòng 19) nếu không còn dùng
- Giữ nguyên phần còn lại

**Thay đổi 2 — Xóa nav item "Chủ đề":**
- Xóa item `{ path: '/admin/topics', label: 'Chủ đề', icon: 'folder' }` khỏi mảng `navItems` (dòng 10)
- Các page vẫn truy cập được qua URL `/admin/topics` — không ảnh hưởng logic

**Không thay đổi:**
- Logo, user card, collapse toggle, "Quay lại app" link

### `src/pages/admin/TopicsPage.tsx`

**Thay đổi — Xóa roadmap badge trên mỗi row:**
- Xóa khối `<div className="shrink-0">` ở dòng 76–85 trong component `SortableItem`
- Vẫn giữ `roadmapNameMap` trong page component (dùng cho việc filter & logic khác)

## Verification

1. Mở `/admin/topics` — danh sách hiển thị không có roadmap badge bên phải
2. Mở `/admin/roadmaps` — sidebar dropdown đã bị xóa, nav items còn lại đầy đủ
3. Mở `/admin/words` — các page khác không bị ảnh hưởng
4. Sidebar collapse/expand vẫn hoạt động
