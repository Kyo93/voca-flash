# Implementation Checklist

## Task 1: AdminSidebar — Remove Roadmap Dropdown & "Chủ đề" nav item
- [ ] 1.1 Mở `src/components/admin/AdminSidebar.tsx`
- [ ] 1.2 Xóa `import { useState, useRef, useEffect }` (dòng 5) — không còn cần
- [ ] 1.3 Xóa `const [open, setOpen] = useState(false)` (dòng 21)
- [ ] 1.4 Xóa `const selectorRef = useRef<HTMLDivElement>(null)` (dòng 22)
- [ ] 1.5 Xóa `useEffect` click-outside handler (dòng 24–32)
- [ ] 1.6 Xóa khối `<div className="px-3 mb-4 relative" ref={selectorRef}>` đến `</div>` (dòng 57–109)
- [ ] 1.7 Xóa `{ path: '/admin/topics', label: 'Chủ đề', icon: 'folder' }` khỏi `navItems` (dòng 10)
- [ ] 1.8 Xóa `useRoadmapContext` khỏi import (dòng 4) — kiểm tra nếu `selectedRoadmap`, `setSelectedRoadmap`, `roadmaps` không còn được dùng
- [ ] 1.9 Verify: dev server chạy, sidebar hiển thị đúng, không có lỗi TypeScript/console

## Task 2: TopicsPage — Remove Roadmap Badge
- [ ] 2.1 Mở `src/pages/admin/TopicsPage.tsx`
- [ ] 2.2 Xóa khối `<div className="shrink-0">` trong `SortableItem` (dòng 76–85)
- [ ] 2.3 Verify: mỗi row topic chỉ còn: drag handle, icon, color dot, info, action buttons

## Task 3: Final Verification
- [ ] 3.1 Chạy `npm run dev`, mở `/admin/roadmaps` — sidebar sạch, không dropdown
- [ ] 3.2 Mở `/admin/topics` (truy cập trực tiếp URL) — danh sách hiển thị không badge
- [ ] 3.3 Mở `/admin/words`, `/admin/users` — không bị ảnh hưởng
- [ ] 3.4 Sidebar collapse/expand toggle hoạt động đúng
