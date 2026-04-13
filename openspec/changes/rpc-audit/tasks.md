# Implementation Checklist: RPC Audit (REV04 — SAFELIST Enforced)
> ⚠️ CHỈ làm những thứ trong SAFELIST.md. KHÔNG thêm bước nào ngoài SAFELIST.

---

## Phase 0: Backup Before Anything (REQUIRED)

- [ ] **0.1** Backup current orphan RPC definitions
  Query trên Supabase → lưu ra `supabase/migrations/_orphan_rpc_backup.sql`
  ```sql
  -- Lấy định nghĩa trước khi drop
  SELECT proname, prosrc
  FROM pg_proc
  WHERE proname IN (
    'get_initial_app_data_v2', 'get_progress_page_data_v2',
    'get_user_memory_health', 'get_user_memory_health_v2',
    'get_user_vocabulary'
  )
  AND pronamespace = 'public'::regnamespace;
  ```

- [ ] **0.2** Verify frontend KHÔNG gọi orphan RPCs
  ```bash
  grep -r "get_initial_app_data_v2\|get_progress_page_data_v2\|get_user_memory_health\|get_user_vocabulary\b" src/ --include="*.ts" --include="*.tsx"
  ```
  Expected: 0 results

## Phase 1: Cloud Cleanup (SUPABASE MCP — Chạy từng dòng)

### ⚠️ CRITICAL ORDER: Drop 4 `_v2` orphan RPCs

- [ ] **1.1** Drop `get_initial_app_data_v2`
  ```sql
  DROP FUNCTION IF EXISTS get_initial_app_data_v2(uuid);
  ```
  ✅ Verify: `SELECT proname WHERE proname='get_initial_app_data_v2'` → 0 rows

- [ ] **1.2** Drop `get_progress_page_data_v2`
  ```sql
  DROP FUNCTION IF EXISTS get_progress_page_data_v2(uuid);
  ```
  ✅ Verify: `SELECT proname WHERE proname='get_progress_page_data_v2'` → 0 rows

- [ ] **1.3** Drop `get_user_memory_health`
  ```sql
  DROP FUNCTION IF EXISTS get_user_memory_health(uuid);
  ```
  ✅ Verify: `SELECT proname WHERE proname='get_user_memory_health'` → 0 rows

- [ ] **1.4** Drop `get_user_memory_health_v2`
  ```sql
  DROP FUNCTION IF EXISTS get_user_memory_health_v2(uuid);
  ```
  ✅ Verify: `SELECT proname WHERE proname='get_user_memory_health_v2'` → 0 rows
  ⚠️ NOTE: `get_user_memory_health_v2` gọi `get_today_boundary_v2()` bên trong.
  Sau khi drop `get_user_memory_health_v2`:
  - [ ] Kiểm tra `get_today_boundary_v2` còn được dùng ở đâu:
    ```sql
    -- Check if get_today_boundary_v2 is still called anywhere
    SELECT prosrc FROM pg_proc WHERE proname = 'get_today_boundary_v2'
    -- prosrc của nó chỉ là "BEGIN RETURN (...)::DATE + INTERVAL '4 hours'; END"
    -- KHÔNG có function nào reference nó trong body
    ```
  - [ ] Nếu `get_today_boundary_v2` không còn được reference → **SKIP** (giữ lại, không drop vội)
  - [ ] Nếu có reference → investigate trước khi drop

### ⚠️ CRITICAL ORDER: Drop orphan v1 vocabulary

- [ ] **1.5** Drop `get_user_vocabulary` (v1)
  ```sql
  DROP FUNCTION IF EXISTS get_user_vocabulary(uuid);
  ```
  ✅ Verify: `SELECT proname WHERE proname='get_user_vocabulary'` → 0 rows
  ✅ Frontend đang dùng `get_user_vocabulary_v2` (confirmed via grep)

### ❌ DO NOT TOUCH

- [ ] ❌ `add_admin` — **SKIP hoàn toàn**. Có thể được dùng từ Supabase Dashboard.
- [ ] ❌ `get_today_boundary` — **CẤM**. Đang được `get_initial_app_data` và `get_progress_page_data` dùng.
- [ ] ❌ `get_today_boundary_v2` — **CHƯA DROP**. Đợi sau Phase 1.4 verify. Không có function nào reference nó ngoài `get_user_memory_health_v2` (đã drop ở 1.4).
  > ⚠️ Rationale: `get_today_boundary_v2` chỉ chứa `BEGIN RETURN (...)`. Không gây hại. Giữ lại an toàn.
- [ ] ❌ Bất kỳ table nào — **CẤM tuyệt đối**
- [ ] ❌ Bất kỳ column nào — **CẤM tuyệt đối**
- [ ] ❌ Bất kỳ RLS policy nào — **CẤM tuyệt đối**
- [ ] ❌ Bất kỳ trigger nào — **CẤM tuyệt đối**

## Phase 2: Local Migration Sync (FILES ONLY — KHÔNG APPLY CLOUD)

- [ ] **2.1** Tạo `supabase/migrations/017_sync_cloud_local.sql`
  Header:
  ```
  -- ============================================================
  -- 017_sync_cloud_local.sql — LOCAL REFERENCE ONLY
  -- DO NOT APPLY TO SUPABASE CLOUD
  -- Created: 2026-04-13
  -- Purpose: Document current cloud RPC definitions locally
  -- ============================================================
  ```
  Nội dung: `CREATE OR REPLACE` cho tất cả 8 RPCs đang dùng (version mới nhất).

- [ ] **2.2** **KHÔNG BAO GIỜ** chạy `supabase/migrations/017_sync_cloud_local.sql` lên Supabase
  ⚠️ Đây là documentation-only file

## Phase 3: TypeScript Type Fixes

- [ ] **3.1** Fix `bigint` → `number` coercion
  File: `src/lib/storage/roadmap.ts` (~line 125)
  ```typescript
  // Tìm: result[row.topic_id] = { total: row.total_words, ... }
  // Sửa thành:
  result[row.topic_id] = {
    total: Number(row.total_words),
    learned: Number(row.learned_count),
    percent: Number(row.percent_complete)
  }
  ```

- [ ] **3.2** Fix null guard cho `total_count`
  File: `src/lib/storage/mastery.ts` (~line 40)
  ```typescript
  // Tìm: parseInt(result[0].total_count)
  // Sửa thành:
  const total = result.length > 0 && result[0].total_count != null
    ? Number(result[0].total_count)
    : result.length
  ```

- [ ] **3.3** `npm run build` → 0 errors

### ❌ DO NOT TOUCH in Phase 3

- [ ] ❌ `src/lib/types.ts` — types đúng rồi, không sửa
- [ ] ❌ `src/lib/storage/auth.ts` — logic đúng rồi, chỉ thêm JSDoc (Phase 4)

## Phase 4: Documentation & Comments

- [ ] **4.1** Thêm JSDoc vào `src/lib/storage/auth.ts`
  ```typescript
  /**
   * recordStreak — Supabase-backed streak for LOGGED-IN users.
   * NOT a duplicate of streak.ts (which handles anonymous/offline users via localStorage).
   */
  ```

- [ ] **4.2** Thêm JSDoc vào `src/lib/streak.ts`
  ```typescript
  /**
   * streak.ts — Anonymous/Offline streak tracking (localStorage).
   * NOT a duplicate of storage/auth.ts (Supabase-backed for logged-in users).
   */
  ```

## Phase 5: Verification

- [ ] **5.1** Verify orphan RPCs đã drop
  ```sql
  SELECT proname FROM pg_proc WHERE proname IN (
    'get_initial_app_data_v2', 'get_progress_page_data_v2',
    'get_user_memory_health', 'get_user_memory_health_v2',
    'get_user_vocabulary'
  )
  ```
  Expected: 0 rows

- [ ] **5.2** Verify active RPCs vẫn tồn tại
  ```sql
  SELECT proname FROM pg_proc WHERE proname IN (
    'get_initial_app_data', 'get_progress_page_data',
    'get_library_page_data', 'get_mastery_stats',
    'get_user_vocabulary_v2', 'get_topic_completion_stats',
    'get_today_boundary', 'reset_topic_progress',
    'is_admin', 'is_authenticated'
  )
  ```
  Expected: 10 rows

- [ ] **5.3** Smoke test frontend (dev server)
  - [ ] `npm run dev`
  - [ ] Login → Dashboard
  - [ ] Library → Roadmap cards
  - [ ] Progress → memory health
  - [ ] `npm run build` → 0 errors

## Phase 6: Working Memory

- [ ] **6.1** Cập nhật `.cm/CONTINUITY.md`

---

## 📋 QUICK REFERENCE — DROP COMMANDS

```
DROP FUNCTION IF EXISTS get_initial_app_data_v2(uuid);
DROP FUNCTION IF EXISTS get_progress_page_data_v2(uuid);
DROP FUNCTION IF EXISTS get_user_memory_health(uuid);
DROP FUNCTION IF EXISTS get_user_memory_health_v2(uuid);
DROP FUNCTION IF EXISTS get_user_vocabulary(uuid);
```

## 📋 QUICK REFERENCE — SAFELIST (WHAT NOT TO TOUCH)

```
TABLES:     roadmaps, topics, words, word_choices, topic_words,
            user_profiles, user_srs_records, user_resume_pointers, admin_users
COLUMNS:    Tất cả columns trong các tables trên
FUNCTIONS:  get_initial_app_data, get_progress_page_data, get_library_page_data,
            get_mastery_stats, get_user_vocabulary_v2, get_topic_completion_stats,
            get_today_boundary, reset_topic_progress, is_admin, is_authenticated,
            add_admin (SKIP), get_today_boundary_v2 (SKIP)
TRIGGERS:   on_auth_user_created, trg_*_updated_at
RLS:        Tất cả policies
FILES:      src/lib/types.ts, src/lib/streak.ts, src/lib/tts.ts
```
