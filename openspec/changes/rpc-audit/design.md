# Design: RPC Audit — VocaFlash

## Context & Technical Approach

### Source of Truth
- **Cloud (Supabase):** 22 migrations applied — đây là production truth
- **Local (`supabase/migrations/`):** 16 files `.sql` — KHÔNG reflect đầy đủ cloud
- **Frontend (`src/`):** Gọi RPC qua `supabase.rpc()` — types từ `src/lib/types.ts`

### Root Cause Analysis

```
Cloud ≠ Local hoàn toàn:
  - Local: 16 migration files (001–016)
  - Cloud: 22 migrations (khác tên hoàn toàn, e.g. "fsrs_persistence_fix")
  - Local không biết cloud có gì
  - Cloud orphan RPCs không được track ở local

Type mismatch:
  - get_topic_completion_stats: cloud returns BIGINT, TypeScript expects number
  - get_user_vocabulary_v2: total_count is BIGINT, parseInt() works but fragile

Orphan RPCs (cloud only, không dùng):
  - get_initial_app_data_v2 (v2 song song với v1)
  - get_progress_page_data_v2
  - get_user_memory_health
  - get_user_memory_health_v2
  - get_today_boundary_v2
  - add_admin (stored function nhưng dùng SQL INSERT, không RPC)

Dead code:
  - src/lib/streak.ts — duplicate của src/lib/storage/auth.ts recordStreak
```

### Schema Architecture (Cloud Truth)

```
Tables:
  roadmaps (9 cols, image_url ✅)
  topics (11 cols, description, image_url ✅)
  words (13 cols, pos CHECK, image_url, image_position ✅)
  word_choices ✅
  topic_words ✅ (junction N:N)
  user_profiles (16 cols, daily_target, srs_intensity, theme_mode, last_study_date ✅)
  user_srs_records (18 cols, full FSRS fields ✅)
  user_resume_pointers ✅
  admin_users ✅

Functions (RPCs):
  get_initial_app_data     ← ĐANG DÙNG (016 version)
  get_progress_page_data   ← ĐANG DÙNG (015 version)
  get_library_page_data    ← ĐANG DÙNG
  get_mastery_stats        ← ĐANG DÙNG
  get_user_vocabulary_v2   ← ĐANG DÙNG
  get_topic_completion_stats ← ĐANG DÙNG
  get_today_boundary       ← Internal helper
  reset_topic_progress     ← ĐANG DÙNG
  is_admin / is_authenticated ← RLS helpers

Triggers:
  on_auth_user_created → handle_new_user ✅
  trg_*_updated_at (auto-set updated_at) ✅

RLS: 9 tables × 2-3 policies ✅
```

---

## Proposed Changes

### 1. Drop Orphan RPCs (Cloud)

**Tại sao:** 6 RPC `_v2`/`_v3`/`add_admin` không được frontend gọi — tồn tại trên cloud nhưng không track ở local.

**Action:**
```sql
DROP FUNCTION IF EXISTS get_initial_app_data_v2(uuid);
DROP FUNCTION IF EXISTS get_progress_page_data_v2(uuid);
DROP FUNCTION IF EXISTS get_user_memory_health(uuid);
DROP FUNCTION IF EXISTS get_user_memory_health_v2(uuid);
DROP FUNCTION IF EXISTS get_today_boundary_v2();
```

### 2. Sync Local Migrations → Cloud Truth (READ-ONLY)

**Tại sao:** Local là nguồn reference duy nhất để reproduce hoặc debug.

⚠️ **CRITICAL:** File `017_sync_cloud_local.sql` chỉ dùng để **TRACK locally** — KHÔNG BAO GIỜ apply lên Supabase cloud. Lý do: `CREATE OR REPLACE` có thể revert RPCs đã được modify trực tiếp trên Supabase Dashboard.

**Action:** Tạo `supabase/migrations/017_sync_cloud_local.sql` — chứa tất cả RPC definitions (version mới nhất từ cloud) + comment "DO NOT APPLY".

### 3. Fix TypeScript Types

**Tại sao:** `BIGINT` → `number` là implicit coercion, dễ break khi TypeScript strict mode tăng.

**Files cần sửa:**
- `src/lib/storage/mastery.ts` line 40: `parseInt(result[0].total_count)` → explicit cast
- `src/lib/types.ts` `LibraryPageData`: `total_words` và `mastered_count` nên là `number` (đúng rồi)
- `src/lib/types.ts` `MasteryWord`: `image_position` optional (đúng rồi)
- `src/lib/storage/roadmap.ts` line 125: `row.total_words`, `row.learned_count`, `row.percent_complete` — cloud trả `bigint` → cần explicit cast

### 4. Audit Streak Modules (NOT deduplicate)

**Tại sao:** `streak.ts` (anonymous/offline) ≠ `storage/auth.ts` (logged-in/Supabase) — phục vụ 2 use cases khác nhau.

**ĐÂY KHÔNG PHẢI DUPLICATE.** Hai file cùng tồn tại vì:
- `streak.ts` → localStorage cho anonymous users
- `storage/auth.ts` → Supabase cho logged-in users

**Action:**
- Giữ nguyên cả 2 files
- Thêm JSDoc comment rõ ràng ở header mỗi file
- KHÔNG xóa `streak.ts`

### 5. Verify All RPC Signatures Match

**Tại sao:** Migrations REPLACE lẫn nhau có thể gây logic cũ ghi đè logic mới.

**Verification checklist:**
- `get_initial_app_data` returns: `profile`, `stats`, `health`, `active_roadmap`, `global_review_count` ✅ (016 verified)
- `get_progress_page_data` returns: `memory_health`, `roadmap_progress`, `overall_stats` ✅
- `get_mastery_stats` returns: `total, mastered, due, weak, orphaned, learning` ✅
- `get_topic_completion_stats` params: `p_user_id UUID, p_topic_ids UUID[]` ✅

---

## Verification

| Step | Verification Method |
|---|---|
| Drop orphan RPCs | `list_functions` → confirm 6 orphan gone |
| Sync migrations | Apply `017_sync_cloud_local.sql` → no errors |
| TypeScript types | `npm run build` → 0 TypeScript errors |
| Streak deduplication | Grep `streak.ts` imports → 0 references |
| RPC signatures | Manual test: gọi từ Supabase dashboard |
| Full flow | Login → Dashboard → Library → Progress → Review → Admin |

## Out of Scope

- ❌ Không migrate FSRS (đã có plan riêng: `fsrs-upgrade`)
- ❌ Không thay đổi RLS policies
- ❌ Không tạo bảng mới (schema đã hoàn chỉnh)
- ❌ Không refactor frontend logic
