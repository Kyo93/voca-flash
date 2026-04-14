# Implementation Checklist

## Phase 1: Context Foundation

- [ ] **1.1** Tạo `src/contexts/RoadmapContext.tsx` — provider với selectedRoadmap, setSelectedRoadmap, roadmaps, loading
- [ ] **1.2** Gắn `<RoadmapProvider>` vào `AdminLayout.tsx` wrap `<Outlet />`
- [ ] **1.3** Verify: TypeScript compile, kiểm tra context hoạt động ở 1 page đơn giản

## Phase 2: AdminSidebar Roadmap Selector

- [ ] **2.1** Thêm dropdown roadmap selector vào `AdminSidebar.tsx` (dùng `useRoadmapContext`)
- [ ] **2.2** Style dropdown: pill-style hiển thị tên roadmap + icon chevron
- [ ] **2.3** Verify: đổi dropdown → context update, kiểm tra `selectedRoadmap` thay đổi

## Phase 3: TopicsPage theo Roadmap Context

- [ ] **3.1** Import `useRoadmapContext` trong `TopicsPage.tsx`
- [ ] **3.2** Filter topics: `topics.filter(t => t.roadmap_id === selectedRoadmap?.id)`
- [ ] **3.3** Tạo topic mới → auto gán `roadmap_id = selectedRoadmap.id` (TopicFormModal)
- [ ] **3.4** Thêm cột Lộ trình hiển thị roadmap.name trong bảng topics
- [ ] **3.5** Verify: đổi roadmap → danh sách topics thay đổi

## Phase 4: WordsPage hiển thị Roadmap

- [ ] **4.1** Import `useRoadmapContext` trong `WordsPage.tsx`
- [ ] **4.2** Cột Chủ đề: thêm chip nhỏ hiển thị roadmap.name
- [ ] **4.3** Filter dropdown topic → chỉ show topics thuộc `selectedRoadmap`
- [ ] **4.4** Verify: cột chủ đề hiển thị đúng topic + roadmap, filter hoạt động

## Phase 5: ImportWordsModal theo Roadmap

- [ ] **5.1** ImportWordsModal nhận prop `roadmapContext?: Roadmap`
- [ ] **5.2** Khi import → topics trong preview chỉ show topics thuộc roadmap hiện tại
- [ ] **5.3** Auto-create topic → gán đúng `roadmap_id`
- [ ] **5.4** Verify: import trong roadmap cụ thể → topic được gán đúng

## Phase 6: TopicFormModal — Roadmap Pre-fill

- [ ] **6.1** TopicFormModal nhận prop `roadmapId?: string`
- [ ] **6.2** Khi tạo mới (không có topic) → `roadmap_id` = prop value (context default)
- [ ] **6.3** Ẩn Roadmap dropdown trong form (context selector đã ở sidebar)
- [ ] **6.4** Verify: tạo topic từ context → đúng roadmap_id

## Verification

- [ ] **V1** TypeScript compile: `npx tsc --noEmit` → 0 lỗi
- [ ] **V2** Dev server: chạy bình thường, không crash
- [ ] **V3** E2E: Chọn roadmap A → thấy topics A → tạo topic mới → thuộc roadmap A
- [ ] **V4** E2E: Chọn roadmap B (khác) → danh sách topics thay đổi, không thấy topics của A
- [ ] **V5** E2E: Import words → chọn topic của roadmap B → từ được gán đúng
