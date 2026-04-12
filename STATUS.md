# VocaFlash — Project Status

> Theo dõi tiến độ theo CM Workflow. Cập nhật mỗi session.

---

## ✅ ĐÃ HOÀN THÀNH

### Phase 1: Bootstrap & Setup
- [x] Bootstrap Vite + React 19 + TypeScript SPA
- [x] Design system: "The Tactile Scholar" (Terracotta + Sage)
- [x] i18n: Vietnamese (primary) + English
- [x] CI/CD: Vitest + jsdom tests (15/15 passing)
- [x] Deploy: Cloudflare Pages ready

### Phase 2: Core Learning Features
- [x] SM-2 SRS Algorithm (`src/lib/srs.ts`)
- [x] Flashcard UI với 3D flip animation
- [x] Topic Selection (Daily, Travel, Business, Technology, Food)
- [x] Progress Tracking với streak system
- [x] TTS Audio (normal + slow playback)
- [x] localStorage persistence (cards, progress, streak)
- [x] Dashboard layout (3-column: sidebar + main + right panel)

### Phase 3: Core Pages
- [x] Landing Page (`/`)
- [x] Dashboard (`/dashboard`)
- [x] Library (`/library`)
- [x] Progress (`/progress`)
- [x] Settings (`/settings`)
- [x] Study Session (`/study`)

### Phase 4: Active Recall (Review Arena)
- [x] Framework: `ChallengeManager` adaptive orchestration
- [x] Challenges: Recognition, Construction, Context Gap, Phonetics, Ghost Recall
- [x] Stability: Robust speech utility (no doubling)
- [x] UI: ConfirmExitModal & Zen aesthetic
- [x] Git: Pushed to production branch (Kyo93)


---

## 🔄 ĐANG THỰC HIỆN

### Phase 4: Admin Panel & Integration
> 📋 **cm-brainstorm-idea** — ✅ Proposal: `openspec/changes/admin-panel/proposal.md`

**User đã xác nhận và hoàn thành:**
1. Admin duy nhất — quản lý user, roadmap, topic, từ vựng (✅ Done)
2. Lưu thông tin cá nhân user (sở thích, tiến độ học) (✅ Done)
3. Tách biệt: Student App (học viên) ≠ Admin Panel (chỉ mình admin) (✅ Done)
4. Logic quản lý từ vựng lấy **từ vựng làm trung tâm** (words → topics → roadmaps) (✅ Done, đã thêm feature Topic Description)
5. Chuyển từ localStorage → **Supabase** (backend + auth) (✅ Done - Phase 10 Sync hoàn tất)
6. AppLayout Centralization: Tối ưu UI thống nhất layout toàn bộ app (Sidebar, Header) (✅ Done)
7.  Review Arena (Active Recall): Trải nghiệm ôn tập chuyên sâu (✅ Done)
8.  Deploy: **Cloudflare Pages** (miễn phí) (🔄 Đang chờ - Phase 12)


**Còn thiếu — chờ deploy:**
- Deploy Frontend public URL và thiết lập auth cho Superadmin.

---

## 📋 SẮP LÀM

> Xem chi tiết: `openspec/changes/admin-panel/tasks.md` (60 tasks, 11 phases)

| Phase | Mô tả | Trạng thái |
|---|---|---|
| 4.1 | Supabase Setup | ✅ |
| 4.2 | Scaffold Admin App | ✅ |
| 4.3 | Auth Guards + Layout | ✅ |
| 4.4 | Words CRUD (TRUNG TÂM) | ✅ |
| 4.5 | Topics CRUD + Drag & Drop (+ Description field) | ✅ |
| 4.6 | Roadmaps CRUD | ✅ |
| 4.7 | Users View | ✅ |
| 4.8 | Admin Dashboard Stats | ✅ |
| 4.9 | Migration: localStorage → Supabase | ✅ |
| 4.10 | Student → Supabase Sync | ✅ |
| 4.11 | Review Arena (Active Recall) | ✅ |
| 4.12 | Deploy Cloudflare Pages | ⬜ |

---

## 📊 TIẾN ĐỘ TỔNG

```
Phase 1 ✅✅✅✅✅✅  Bootstrap & Setup
Phase 2 ✅✅✅✅✅✅  Core Learning
Phase 3 ✅✅✅✅✅✅  Core Pages & AppLayout Refactor
Phase 4 ✅✅✅✅✅🔄  Admin Panel & App/DB Sync
Phase 4.1 ✅✅✅✅✅✅  Supabase Setup
Phase 4.2 ✅✅✅✅✅✅  Scaffold Admin App
Phase 4.3 ✅✅✅✅✅✅  Auth Guards + Layout
Phase 4.4 ✅✅✅✅✅✅  Words CRUD (TRUNG TÂM)
Phase 4.5 ✅✅✅✅✅✅  Topics CRUD + Drag & Drop (w/ Description)
Phase 4.6 ✅✅✅✅✅✅  Roadmaps CRUD
Phase 4.7 ✅✅✅✅✅✅  Users View
Phase 4.8 ✅✅✅✅✅✅  Admin Dashboard Stats
Phase 4.9 ✅✅✅✅✅✅  Migration: localStorage → Supabase
Phase 4.10 ✅✅✅✅✅  Student → Supabase Sync
Phase 4.11 ⬜⬜⬜⬜⬜  Deploy Cloudflare Pages
```

---

## 🗺️ ROADMAP TỔNG (Vision)

```
Now ──────────────────────────────────────────────────── Future
  │                                                            │
  ▼                                                            v
┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐
│ localStorage  │ →  │  Supabase    │ →  │  Multi-tenant SaaS   │
│ Student App   │    │ Student App  │    │  (nhiều người dùng)  │
│ Admin = NULL  │    │ Admin Panel │    │  Billing, Teams...   │
└──────────────┘    └──────────────┘    └──────────────────────┘
     v1.0                  v2.0                    v3.0
```

---

## 📁 Cấu trúc file quan trọng

```
voca-flash/
├── STATUS.md                        ← Theo dõi tiến độ (file này)
├── SPEC.md                          ← Tổng hợp spec của app
├── openspec/
│   └── changes/
│       └── admin-panel/
│           ├── proposal.md          ← ✅ Đã tạo — Problem + Option
│           ├── design.md           ← ⬜ Sẽ tạo — Schema + UI
│           └── tasks.md             ← ⬜ Sẽ tạo — Task breakdown
├── src/
│   ├── lib/                        ← SRS, storage, streak, tts
│   ├── pages/                      ← Dashboard, Library, Study...
│   ├── hooks/                      ← useFlashcard
│   └── i18n/                       ← vi.json, en.json
└── supabase/
    └── migrations/                 ← Database migrations
```

---

_Cập nhật lần cuối: 2026-04-12_

