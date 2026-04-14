# Design: Roadmap-Context Admin Panel

## Context & Why

**User goal:** Admin cần quản lý topics và words trong context của một roadmap cụ thể. Giữa 2 roadmap có thể có topics trùng tên (VD: "Family" trong roadmap 300 từ cơ bản ≠ "Family" trong roadmap nâng cao), nhưng từ vựng là global — cùng definition cho mọi roadmap.

**Schema hiện tại đã hỗ trợ đúng kiến trúc:**
```
roadmaps ───1:N─── topics ───N:N─── topic_words ───N:1─── words
```

**Cần thêm:** Admin panel chuyển sang "Roadmap-first context" — tất cả thao tác trong context roadmap đang chọn.

---

## Proposed Changes

### 1. `src/contexts/RoadmapContext.tsx` — NEW
Context provider cung cấp:
- `selectedRoadmap: Roadmap | null` — roadmap đang được chọn
- `setSelectedRoadmap(r)` — thay đổi roadmap
- `roadmaps: Roadmap[]` — danh sách tất cả roadmap (để dropdown)

Dùng `useState` + `useEffect` load từ `getAllRoadmaps()`. Không cần URL param vì admin context không cần deep-link.

### 2. `src/components/admin/AdminLayout.tsx`
Wrap toàn bộ Outlet với `<RoadmapProvider>` để context available cho mọi page con.

### 3. `src/components/admin/AdminSidebar.tsx`
Thêm roadmap selector (dropdown) ngay dưới logo:
```
[Logo: Admin Panel]
[Vocab: 300 từ cơ bản ▼]  ← roadmap selector
───────────────────────
• Dashboard
• Từ vựng
• Chủ đề
• ...
```

Dropdown hiển thị tất cả roadmap từ context. Khi đổi roadmap → context update → mọi page con tự động refresh theo.

### 4. `src/pages/admin/TopicsPage.tsx`
- Khi tạo topic mới → `roadmap_id = selectedRoadmap.id` (auto-fill, không cần dropdown)
- Danh sách topics mặc định lọc theo `selectedRoadmap.id`
- Cột "Lộ trình" hiển thị roadmap.name

### 5. `src/pages/admin/WordsPage.tsx`
- Cột "Chủ đề" hiển thị `topic.name` + badge nhỏ `roadmap.name` bên cạnh
  - VD: `Family` pill + chip nhỏ `300 từ CB`
- Khi filter topic → dropdown chỉ show topics thuộc `selectedRoadmap`
- Nút Import words → truyền `selectedRoadmap` vào modal

### 6. `src/components/admin/ImportWordsModal.tsx`
- Props thêm: `roadmapContext?: Roadmap | null`
- Khi import → topics dropdown trong preview chỉ show topics thuộc `selectedRoadmap`
- Auto-create topic → gán `roadmap_id = selectedRoadmap.id`

### 7. `src/components/admin/TopicFormModal.tsx`
- Props thêm: `roadmapId?: string` (pre-fill từ context)
- Khi tạo mới (không có topic prop) → `roadmap_id` mặc định = `roadmapId` prop
- Ẩn roadmap dropdown trong form (vì đã có context selector ở sidebar)

---

## Verification

| Bước | Kiểm tra |
|------|---------|
| V1 | Sidebar hiển thị dropdown roadmap, đổi roadmap → UI thay đổi |
| V2 | Topics page chỉ show topics thuộc roadmap đang chọn |
| V3 | Tạo topic mới → topic được gán đúng roadmap_id |
| V4 | Words page cột Chủ đề hiển thị topic.name + roadmap.name |
| V5 | Import modal chỉ show topics thuộc roadmap hiện tại |

---

## What's Out of Scope

- URL params cho roadmap (dùng context, không cần `/admin/roadmaps/xxx/topics`)
- User-facing changes (student app không đổi)
- Migration schema (schema hiện tại đã đúng)
- Multi-roadmap word assignment (MVP: words là global, không gán song song)
