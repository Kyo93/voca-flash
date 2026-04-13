# RPC Audit — SAFELIST (REV04)
> ⚠️ **CHỈ NHỮNG THỨ TRONG SAFELIST NÀY MỚI ĐƯỢC ĐỤNG ĐẾN**
> Không thêm, không bớt, không thay đổi gì ngoài danh sách này.

---

## ✅ ĐƯỢC PHÉP DROP (Cloud SQL — Phase 1)

### 1. Drop 4 orphan `_v2` RPCs

| Function | Signature để DROP | Lý do |
|---|---|---|
| `get_initial_app_data_v2` | `(p_user_id uuid)` | Frontend gọi `get_initial_app_data` (v1), không gọi v2 |
| `get_progress_page_data_v2` | `(p_user_id uuid)` | Frontend gọi `get_progress_page_data` (v1), không gọi v2 |
| `get_user_memory_health` | `(p_user_id uuid)` | Không được frontend gọi |
| `get_user_memory_health_v2` | `(p_user_id uuid)` | Không được frontend gọi, chỉ là helper cho v2 |

**SQL để chạy:**
```sql
DROP FUNCTION IF EXISTS get_initial_app_data_v2(uuid);
DROP FUNCTION IF EXISTS get_progress_page_data_v2(uuid);
DROP FUNCTION IF EXISTS get_user_memory_health(uuid);
DROP FUNCTION IF EXISTS get_user_memory_health_v2(uuid);
```

### 2. Drop `get_user_vocabulary` v1 (superseded)

| Function | Signature để DROP | Lý do |
|---|---|---|
| `get_user_vocabulary` | `(p_user_id uuid)` | Superseded by `get_user_vocabulary_v2` — frontend dùng v2 |

**SQL để chạy:**
```sql
DROP FUNCTION IF EXISTS get_user_vocabulary(uuid);
```

**⚠️ KHÔNG DROP `get_user_vocabulary_v2`** — đang được frontend dùng.

### 3. ❌ CẤM DROP — GIỮ NGUYÊN

| Function | Lý do CẤM |
|---|---|
| `get_initial_app_data` | ✅ ĐANG DÙNG — Dashboard, AuthContext |
| `get_progress_page_data` | ✅ ĐANG DÙNG — ProgressPage |
| `get_library_page_data` | ✅ ĐANG DÙNG — LibraryPage |
| `get_mastery_stats` | ✅ ĐANG DÙNG — Dashboard stats |
| `get_user_vocabulary_v2` | ✅ ĐANG DÙNG — Mastery page |
| `get_topic_completion_stats` | ✅ ĐANG DÙNG — RoadmapTopicsPage |
| `get_today_boundary` | ✅ ĐANG DÙNG — Helper cho `get_initial_app_data` và `get_progress_page_data` |
| `get_today_boundary_v2` | ⚠️ DEPENDENCY ISSUE — Helper cho `get_user_memory_health_v2`. **DO NOT DROP**. Sau khi drop `get_user_memory_health_v2`, kiểm tra lại nếu `get_today_boundary_v2` không còn dùng → drop sau. |
| `reset_topic_progress` | ✅ ĐANG DÙNG — StudyPrepScreen |
| `is_admin` | ✅ CẦN THIẾT — RLS policies sử dụng |
| `is_authenticated` | ✅ CẦN THIẾT — RLS policies sử dụng |
| `add_admin` | ⚠️ CHƯA RÕ — Có thể dùng từ Supabase Dashboard. **DO NOT DROP** cho đến khi verify kỹ. |

### 4. ❌ CẤM DROP — TABLES VÀ COLUMNS

| Object | Lý do |
|---|---|
| **Tất cả 9 tables** | Chứa production data — TUYỆT ĐỐI KHÔNG DROP |
| **Tất cả RLS policies** | Bảo mật — không chạm |
| **Triggers** (`handle_new_user`, `trg_*_updated_at`) | Cần thiết cho auth và auto-update |

---

## ✅ ĐƯỢC PHÉP SỬA (TypeScript — Phase 3)

### 5. Type Coercion Fix

| File | Dòng | Thay đổi |
|---|---|---|
| `src/lib/storage/roadmap.ts` | ~line 125 | `row.total_words` → `Number(row.total_words)` |
| `src/lib/storage/roadmap.ts` | ~line 125 | `row.learned_count` → `Number(row.learned_count)` |
| `src/lib/storage/roadmap.ts` | ~line 125 | `row.percent_complete` → `Number(row.percent_complete)` |
| `src/lib/storage/mastery.ts` | ~line 40 | Thêm null guard cho `total_count` |

### 6. ❌ CẤM SỬA — TypeScript Files

| File | Lý do |
|---|---|
| `src/lib/types.ts` | ✅ Types đúng rồi — không cần sửa |
| `src/lib/storage/auth.ts` | ✅ Logic đúng rồi — chỉ thêm comment |
| `src/lib/streak.ts` | ✅ ĐANG DÙNG cho anonymous/offline users — KHÔNG XÓA |
| `src/lib/tts.ts` | ✅ Thay thế speech.ts (bị xóa ở 408b4c2) — đúng |

---

## ✅ ĐƯỢC PHÉP THÊM (Phase 2, 4)

### 7. File mới được tạo

| File | Nội dung | Ghi chú |
|---|---|---|
| `supabase/migrations/017_sync_cloud_local.sql` | Documentation only — `CREATE OR REPLACE` RPCs | **DO NOT APPLY TO CLOUD** |
| `supabase/migrations/_backup_rpc_snapshot.json` | JSON backup của current RPC definitions | Backup trước khi drop |
| JSDoc comment in `src/lib/storage/auth.ts` | Thêm comment phân biệt vs streak.ts | Không thay đổi logic |

---

## ❌ TUYỆT ĐỐI CẤM — MỌI THỨ KHÁC

```
❌ Không DROP bất kỳ table nào
❌ Không DROP bất kỳ column nào
❌ Không DROP RLS policy
❌ Không DROP trigger
❌ Không sửa RPC logic (CREATE OR REPLACE chỉ dùng trong 017_local_only.sql)
❌ Không xóa src/lib/streak.ts
❌ Không xóa src/lib/tts.ts
❌ Không sửa src/lib/types.ts
❌ Không DROP get_today_boundary_v2 (chưa verify)
❌ Không DROP add_admin (chưa verify)
❌ Không chạy 017 migration lên Supabase cloud
```

---

## 🔍 VERIFICATION CHECKLIST TRƯỚC MỖI DROP

Trước khi DROP bất kỳ function nào, hỏi:

1. **Frontend gọi không?** → Grep `supabase.rpc('tên_function')` trong `src/`
2. **RLS policy dùng không?** → Kiểm tra `pg_policies.qual`
3. **Helper của function khác?** → Kiểm tra `prosrc` xem có `SELECT tên_function(...)`
4. **Supabase Dashboard có dùng không?** → Hỏi user

---

## 📋 DELETED FILES TRACKED (Git History)

Đã xác nhận — KHÔNG cần khôi phục:

| File | Commit | Lý do Xóa |
|---|---|---|
| `src/lib/storage.ts` | 408b4c2 | Đã thay bằng `supabase-storage.ts` ✅ |
| `src/lib/speech.ts` | 408b4c2 | Đã thay bằng `src/lib/tts.ts` ✅ |
| `openspec/changes/fsrs-upgrade/migration.sql` | 91eceb4 | Nội dung đã merge vào `011_fsrs_hard_migration.sql` ✅ |
| `openspec/changes/fsrs-upgrade/tasks.md` | 91eceb4 | Nội dung đã merge vào `implementation_plan.md` ✅ |
| `src/components/WelcomeReminder.tsx` | 408b4c2 | Không còn cần thiết ✅ |

---

## 📋 ORPHAN RPC SNAPSHOT (Pre-Drop Backup)

```json
{
  "get_initial_app_data_v2": { "args": "p_user_id uuid", "returns": "json" },
  "get_progress_page_data_v2": { "args": "p_user_id uuid", "returns": "json" },
  "get_user_memory_health": { "args": "p_user_id uuid", "returns": "json" },
  "get_user_memory_health_v2": { "args": "p_user_id uuid", "returns": "json" },
  "get_user_vocabulary": { "args": "p_user_id uuid", "returns": "TABLE(...)" }
}
```
