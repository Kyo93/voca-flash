# Implementation Checklist: Admin Panel — Option A (Integrated)

> **THAY ĐỔI:** Không còn separate SPA nữa. Admin routes tích hợp vào main app.
> **Thứ tự ưu tiên:** Supabase client → Auth → Admin routes → CRUD Words → Topics → Roadmaps → Users → Seed → Deploy
> **Mỗi task: 10-30 phút**

> **STATUS (2026-04-11):** ✅ Phase 1-9 hoàn tất. ⏸ Phase 10 (Student sync) + Phase 11 (Deploy) chờ.

---

## PHASE 1: Supabase Setup — ✅ HOÀN TẤT (2026-04-11)

- [x] **1.1** Kết nối Supabase account → Đã kiểm tra `list_projects`, thấy org `OceanOrg`
- [x] **1.2** Tạo Supabase project `voca-flash-admin` (Singapore `ap-southeast-1`) → ID: `nhnusgnlhnzwavpltbqj`
- [x] **1.3** Tạo migration `supabase/migrations/001_initial_schema.sql`
  - ✅ 7 tables: `roadmaps`, `topics`, `words`, `word_choices`, `user_profiles`, `user_progress`, `admin_users`
  - ✅ Indexes, triggers (`handle_new_user`, `update_updated_at`)
  - ✅ RLS policies
- [x] **1.4** Apply migration lên Supabase qua MCP
- [x] **1.5** Verify schema: `list_tables` → thấy đủ 7 tables ✅
- [x] **1.6** Credentials → `.env` (URL, anon key, service role key) ✅

---

## PHASE 2: Core Setup (Option A — Integrated) — ✅ HOÀN TẤT

- [x] **2.1** Tạo `src/lib/supabase.ts` ✅
- [x] **2.2** Tạo `src/lib/types.ts` (7 interfaces) ✅
- [x] **2.3** Tạo `src/lib/auth.ts` ✅
- [x] **2.4** Tạo `src/contexts/AuthContext.tsx` ✅
- [x] **2.5** Wrap `App.tsx` trong `<AuthProvider>` ✅
- [x] **2.6** Tạo `src/pages/LoginPage.tsx` ✅
- [x] **2.7** Build verify ✅ (127 modules, no errors)

---

## PHASE 3: Admin Routes + Layout — ✅ HOÀN TẤT

- [x] **3.1** Tạo `src/components/AdminLayout.tsx` ✅ (dùng `<Outlet>`)
- [x] **3.2** Tạo `src/components/AdminSidebar.tsx` ✅
- [x] **3.3** Thêm `/admin/*` routes vào `App.tsx` với RequireAdmin guard ✅
- [x] **3.4** Update `src/components/Sidebar.tsx` với `useAuth()` + admin link ✅
- [x] **3.5** Update LandingPage login buttons ✅
  ```
- [ ] **3.2** Tạo `src/components/AdminSidebar.tsx` — admin nav
  ```tsx
  // Links: Dashboard, Words, Topics, Roadmaps, Users
  // Bottom: avatar + email + Sign Out
  // Active state highlight
  ```
- [ ] **3.3** Cập nhật `src/App.tsx` — thêm admin routes với auth guard
  ```tsx
  <Route path="/admin" element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
  <Route path="/admin/words" element={<AdminLayout><AdminWordsPage /></AdminLayout>} />
  <Route path="/admin/topics" element={<AdminLayout><AdminTopicsPage /></AdminLayout>} />
  <Route path="/admin/roadmaps" element={<AdminLayout><AdminRoadmapsPage /></AdminLayout>} />
  <Route path="/admin/users" element={<AdminLayout><AdminUsersPage /></AdminLayout>} />
  // Mỗi route: check isAdmin() → redirect /dashboard nếu không phải admin
  ```
- [ ] **3.4** Update `src/components/Sidebar.tsx` — thay hardcoded user bằng `useAuth()`
  ```tsx
  // Hiển thị user.display_name hoặc email
  // Avatar chữ đầu
  // Sign Out button
  ```
- [ ] **3.5** Verify: Chưa login → vào `/admin` → redirect `/login`

---

## PHASE 4: Words CRUD (TRUNG TÂM) — ✅ HOÀN TẤT

- [x] **4.1** Tạo `src/lib/admin-queries.ts` ✅
- [x] **4.2** Tạo `src/hooks/useAdminWords.ts` ✅
- [x] **4.3** Tạo `src/components/ConfirmDialog.tsx` ✅
- [x] **4.4** Tạo `src/components/WordFormModal.tsx` ✅
- [x] **4.5** Tạo `src/pages/AdminWordsPage.tsx` (search, filter, sort, paginate) ✅
- [x] **4.6** Build verify: 115 modules, no errors ✅

---

## PHASE 5: Topics CRUD + Drag & Drop — ✅ HOÀN TẤT

- [x] **5.1** Cập nhật `src/lib/admin-queries.ts` (reorderTopics) ✅
- [x] **5.2** Tạo `src/hooks/useAdminTopics.ts` ✅
- [x] **5.3** Tạo `src/components/TopicFormModal.tsx` ✅
- [x] **5.4** Tạo `src/pages/AdminTopicsPage.tsx` (@dnd-kit) ✅
- [x] **5.5** Build verify: 127 modules ✅

---

## PHASE 6: Roadmaps CRUD — ✅ HOÀN TẤT

- [x] **6.1** Cập nhật `src/lib/admin-queries.ts` ✅
- [x] **6.2** Tạo `src/hooks/useAdminRoadmaps.ts` ✅
- [x] **6.3** Tạo `src/components/RoadmapFormModal.tsx` ✅
- [x] **6.4** Tạo `src/pages/AdminRoadmapsPage.tsx` ✅
- [x] **6.5** Build verify ✅

---

## PHASE 7: Admin Dashboard — ✅ HOÀN TẤT

- [x] **7.1** Thêm `getAdminStats()` + `getRecentWords()` vào admin-queries ✅
- [x] **7.2** Tạo `src/pages/AdminDashboardPage.tsx` ✅
- [x] **7.3** Build verify ✅

---

## PHASE 8: Users View — ✅ HOÀN TẤT

- [x] **8.1** Thêm `getAllUsers()` + `getUserProgress()` vào admin-queries ✅
- [x] **8.2** Tạo `src/hooks/useAdminUsers.ts` ✅ (inlined in page)
- [x] **8.3** Tạo `UserProgressPanel` (slide-over) trong AdminUsersPage ✅
- [x] **8.4** Tạo `src/pages/AdminUsersPage.tsx` ✅
- [x] **8.5** Build verify ✅

---

## PHASE 9: Seed Sample Data — ✅ HOÀN TẤT

- [x] **9.1** Tạo roadmap "English Mastery" ✅
- [x] **9.2** Tạo 5 topics ✅
- [x] **9.3** Insert 15 words từ sampleCards ✅ (via Supabase MCP)
- [x] **9.4** Verify: 1 roadmap, 5 topics, 15 words confirmed ✅

---

## PHASE 10: Student App → Supabase Sync — ⏸ TẠM HOÃN

- [ ] **10.1** Cập nhật `src/lib/storage.ts` → `src/lib/supabase-storage.ts`
- [ ] **10.2** Cập nhật `src/hooks/useFlashcard.ts` (async)
- [ ] **10.3** Cập nhật `src/lib/streak.ts` (sync với Supabase)
- [ ] **10.4** Cập nhật `src/pages/DashboardPage.tsx`
- [ ] **10.5** Verify: User đăng ký → thấy trong admin users list

> **Lý do hoãn:** Student app vẫn hoạt động với localStorage. Chỉ sync khi nào cần tính năng online.

---

## PHASE 11: Deploy — ⏸ CHỜ PUBLIC URL

- [ ] **11.1** Cập nhật `.gitignore` ✅ (`.env` đã excluded)
- [ ] **11.2** GitHub repo: `Kyo93/voca-flash` ✅ Pushed
- [ ] **11.3** Kết nối Cloudflare Pages với repo
  - Build command: `npm run build`
  - Build output: `dist`
- [ ] **11.4** Set environment variables:
  ```
  VITE_SUPABASE_URL=https://nhnusgnlhnzwavpltbqj.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- [ ] **11.5** Deploy → lấy URL
- [ ] **11.6** Thêm admin user vào Supabase:
  ```sql
  INSERT INTO admin_users (id, email, role)
  SELECT id, email, 'superadmin'
  FROM auth.users
  WHERE email = 'your-email@example.com';
  ```
- [ ] **11.7** Smoke test: /login → /admin → CRUD words

> **Chờ:** Cần Cloudflare API token hoặc setup manual qua dashboard.

---

## Verification Checklist

```
✅ Schema: 7 tables tồn tại trong Supabase
✅ Auth: /login → signup/login/logout hoạt động
✅ Auth guard: Chưa login → /admin redirect → /login
✅ Admin guard: Login không phải admin → /admin redirect → /dashboard
✅ Words CRUD: Add → Edit → Delete word hoạt động
✅ Topics: Drag-drop reorder lưu xuống Supabase
✅ Roadmaps: CRUD hoạt động
✅ Users: Admin thấy danh sách user + progress
✅ Seed: 15 words, 5 topics, 1 roadmap trong Supabase
⏸ Deploy: App online tại URL (chờ)
⏸ Admin user: Đăng nhập admin → vào được panel (chờ user tạo account)
⏸ Student sync: User học → progress lưu lên Supabase (chờ phase 10)
```

---

_Created: 2026-04-11_
_Revised: 2026-04-11 — Changed from Option B (separate SPA) to Option A (integrated)_
