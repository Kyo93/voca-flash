# Implementation Plan: FSRS Hard Migration (Clean Upgrade)

## Mục tiêu
Loại bỏ hoàn toàn SM-2, chuyển 100% sang FSRS. Dữ liệu cũ (21 records) sẽ được chuyển đổi ngay lập tức qua SQL script. Codebase sẽ sạch bóng SM-2, tối ưu cho AI trợ giúp sau này.

---

> [!IMPORTANT]
> **Quyết định Chiến thuật:** 
> - **KHÔNG giữ Dual-mode:** Xóa sạch code SM-2.
> - **Migration:** Chạy SQL batch UPDATE cho 21 records hiện có.
> - **UI:** Cập nhật 4 nút FSRS chuẩn.

---

## Phân tích Impact (20 files, 4 RPCs)

### Files bị ảnh hưởng (Bổ sung 6 file UI)

| File | Loại thay đổi | Chi tiết |
|------|---------------|----------|
| `src/lib/types.ts` | **MODIFY** | Sửa `SrsRecord` + `MasteryWord` (FSRS fields) |
| `src/lib/srs.ts` | **REWRITE** | Xóa SM-2, dùng `ts-fsrs`, đổi interface `CardProgress` |
| `src/lib/supabase-storage.ts` | **MODIFY** | Sửa `upsertSrsRecord`, `upsertFreeStudyFail`, nội dung `fetchSrsStates` |
| `src/hooks/useFlashcard.ts` | **MODIFY** | Fix `wrong = rating === 1`, dùng logic FSRS |
| `src/hooks/useReviewSession.ts` | **MODIFY** | Fix quadrant thresholds, dùng logic FSRS |
| `src/hooks/useFreeStudySession.ts` | **MODIFY** | Fix bug `w.topic_name`, dùng `scheduler.forget()` |
| `src/pages/StudyPage.tsx` | **MODIFY** | Thêm nút "Quên" (Rating 1), map 4 nút |
| `src/pages/MasteryPage.tsx` | **MODIFY** | Hiển thị `stability` thay vì `ease_factor` |
| `src/pages/SettingsPage.tsx` | **MODIFY** | Mapping `srs_intensity` sang `request_retention` |
| `src/pages/MethodologyPage.tsx` | **MODIFY** | Cập nhật mô tả thuật toán FSRS |
| `src/pages/admin/UsersPage.tsx` | **MODIFY** | Hiển thị `fsrs_reps` và `fsrs_stability` |
| `src/lib/settings-defaults.ts` | **MODIFY** | Cài đặt mặc định mới |
| `tests/srs-migration.test.ts` | **MODIFY** | Import real code từ `srs.ts` để test |

### SQL Objects (Migration 011)

| Object | Thay đổi |
|--------|----------|
| `user_srs_records` | UPDATE 21 records SM-2 -> FSRS |
| `get_progress_page_data` | **UPDATE** logic mastered: `stability >= 21 AND state != 3` |
| `get_user_vocabulary` | Trả về FSRS fields |
| `get_initial_app_data` | Trả về thông số dựa trên FSRS fields |

---

## Gaps & Fixes (Bổ sung từ rà soát Opus)

### 1. Wrong Detection Bug 🔴
- **Hiện tại:** `rating < 3` -> wrong (SM-2).
- **Fix:** Đổi thành `rating === 1` (Again) trong tất cả hooks.

### 2. Free Study Filter Bug 🔴
- **Hiện tại:** `w.topics?.slug === deckId` -> crash vì `w.topics` không tồn tại.
- **Fix:** Đổi thành `w.topic_name === deckId`.

### 3. CardProgress Interface 🔴
- **Hiện tại:** `{ ease, interval, repetitions }`.
- **Fix:** Đổi sang `{ stability, difficulty, state, reps, lapses, due, lastReview }`.

### 4. Migration Strategy 🔴
- **Quyết định:** Chạy SQL script chuyển đổi 1 lần (Batch Migration).
- **Công thức chuyển đổi sơ bộ:**
  - `stability = interval_days`
  - `difficulty = (5.0 - ease_factor) / 4.0` (chuẩn hóa 0-1)
  - `state = 2 (Review)`
  - `reps = repetitions`
  - `lapses = lapse_count`

---

## Proposed Changes (Thứ tự thực hiện)

### Phase 1: Database Foundation
#### [NEW] `supabase/migrations/011_fsrs_clean_upgrade.sql`
1. Chạy SQL Update chuyển đổi dữ liệu SM-2 sang FSRS cho 21 records.
2. Cập nhật `get_progress_page_data` và các RPCs thống kê.

### Phase 2: Logic & Types
#### [MODIFY] `src/lib/types.ts` & `src/lib/srs.ts`
1. Cấu trúc lại interfaces.
2. Cài đặt `ts-fsrs` và viết lại hàm điều phối scheduler.

### Phase 3: Hooks & Bugs Fixes
#### [MODIFY] `src/hooks/*.ts`
1. Sửa bug wrong detection.
2. Sửa bug filter trong Free Study.
3. Chuyển sang dùng FSRS scheduler.

### Phase 4: UI Updates
#### [MODIFY] `src/pages/*.tsx`
1. Cập nhật StudyPage (4 nút).
2. Cập nhật MasteryPage (Bar strength dựa trên stability).
3. Cập nhật Settings & Admin.

---

## Verification Plan

### Automated Tests
- `npm test tests/srs-fsrs.test.ts`
- `npm test tests/srs-migration.test.ts` (Sửa đổi để import code thực tế)

### Manual Verification
- Kiểm tra Dashboard "Đã thuộc" sau khi chạy Migration SQL.
- Học 1 từ mới -> Check DB fields `fsrs_reps = 1`.
- Sai (Rating 1) -> Check `state` chuyển về Learning/Relearning.
