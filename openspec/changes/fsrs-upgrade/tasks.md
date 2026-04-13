# Implementation Checklist: FSRS Upgrade

> **Thứ tự thực hiện:** Làm theo phases, không bỏ qua.

---

## Phase 1: Database Migration

> ⚠️ **Chạy TRƯỚC KHI code changes.**

- [ ] 1.1 Mở Supabase Dashboard → SQL Editor
- [ ] 1.2 Copy nội dung từ `supabase/migrations/009_fsrs_fields.sql`
- [ ] 1.3 Paste vào SQL Editor → Run
- [ ] 1.4 Verify: Columns đã được tạo
      ```sql
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'user_srs_records'
      AND column_name LIKE 'fsrs_%';
      ```

---

## Phase 2: Update Types

- [ ] 2.1 Mở `src/lib/types.ts`
- [ ] 2.2 Thêm FSRS fields vào `SrsRecord`:
      ```typescript
      fsrs_stability: number
      fsrs_difficulty: number
      fsrs_state: number
      fsrs_scheduled_days: number
      fsrs_reps: number
      fsrs_lapses: number
      ```
- [ ] 2.3 Thêm FSRS fields vào `MasteryWord`:
      ```typescript
      fsrs_stability: number
      fsrs_difficulty: number
      fsrs_state: number
      fsrs_scheduled_days: number
      ```
- [ ] 2.4 Chạy `npm test` — verify types compile

---

## Phase 3: Update SRS Algorithm

- [ ] 3.1 Mở `src/lib/srs.ts`
- [ ] 3.2 Thêm imports:
      ```typescript
      import { fsrs, createEmptyCard, Rating, State, type Card, type Grade } from 'ts-fsrs'
      ```
- [ ] 3.3 Thêm FSRS fields vào `CardProgress` interface
- [ ] 3.4 Thêm functions:
      - [ ] `createFsrsScheduler()`
      - [ ] `getFsrsScheduler()` — singleton
      - [ ] `createFsrsCard()`
      - [ ] `calculateFSRSReview()`
      - [ ] `resetFsrsCard()`
      - [ ] `fsrsCardToProgress()`
      - [ ] `sm2ToFsrsInput()`
      - [ ] `progressToFsrsCard()`
      - [ ] `isFsrsMigrated()` ← Dùng `fsrsState !== undefined`
      - [ ] `isMastered()` ← Unified check
- [ ] 3.5 Verify: `npm test` pass

---

## Phase 4: Update Storage Layer

- [ ] 4.1 Mở `src/lib/supabase-storage.ts`
- [ ] 4.2 Import thêm: `isFsrsMigrated`, `State`
- [ ] 4.3 Update `fetchSrsStates()`:
      - [ ] Đọc thêm `fsrs_stability`, `fsrs_difficulty`, `fsrs_state`, `fsrs_scheduled_days`, `fsrs_reps`, `fsrs_lapses`
      - [ ] Logic: `p.fsrs_state !== undefined` → migrate flag
- [ ] 4.4 Update `upsertSrsRecord()`:
      - [ ] Thêm optional FSRS fields
      - [ ] Ghi luôn nếu `fsrsState !== undefined`
- [ ] 4.5 Update `fetchReviewWords()`:
      - [ ] Order by `next_review_at` (không phải stability)
      - [ ] Đọc FSRS fields như `fetchSrsStates`
- [ ] 4.6 Chạy `npm test`

---

## Phase 5: Update Hooks

### 5.1 useFlashcard.ts

- [ ] 5.1.1 Thêm imports: `FSRSRating`, `calculateFSRSReview`, `progressToFsrsCard`, `fsrsCardToProgress`, `isFsrsMigrated`, `getFsrsScheduler`
- [ ] 5.1.2 Update `rate()` callback:
      ```typescript
      if (isFsrsMigrated(prevProgress)) {
        const fsrsCard = progressToFsrsCard(prevProgress)
        const newFsrsCard = calculateFSRSReview(fsrsCard, rating as FSRSRating)
        newProgress = fsrsCardToProgress(newFsrsCard, card.id)
      } else {
        // SM-2 fallback
      }
      ```
- [ ] 5.1.3 Update `upsertSrsRecord` call với FSRS fields
- [ ] 5.1.4 Update `initialize()`: dùng `isMastered()` thay vì `repetitions >= 5`
- [ ] 5.1.5 Chạy `npm test`

### 5.2 useReviewSession.ts

- [ ] 5.2.1 Thêm imports
- [ ] 5.2.2 Update `selectQuadrant()`:
      - [ ] Thay `progress.repetitions < 2` → `stability < 7`
      - [ ] Thay `progress.repetitions < 4` → `stability >= 7`
- [ ] 5.2.3 Update `submitAnswer()`: FSRS calculation như useFlashcard
- [ ] 5.2.4 Update `isMastered()` call
- [ ] 5.2.5 Chạy `npm test`

### 5.3 useFreeStudySession.ts

- [ ] 5.3.1 Thêm imports: `resetFsrsCard`, `progressToFsrsCard`, `fsrsCardToProgress`
- [ ] 5.3.2 Update `submitAnswer()` — khi fail:
      ```typescript
      const fsrsCard = progressToFsrsCard(current.progress)
      const resetCard = resetFsrsCard(fsrsCard)
      const resetProgress = fsrsCardToProgress(resetCard, current.word.id)
      // upsert với resetProgress
      ```
- [ ] 5.3.3 **NOTE:** `w.topics?.slug` → `w.topic_name` (MasteryWord bug fix)
- [ ] 5.3.4 Chạy `npm test`

---

## Phase 6: Fix Issues

- [ ] 6.1 Verify `isFsrsMigrated()` dùng `fsrsState !== undefined`
- [ ] 6.2 Verify `isMastered()` unified cho cả 2 hooks
- [ ] 6.3 Verify `upsertSrsRecord` ghi đủ 6 FSRS fields
- [ ] 6.4 Chạy `npm test` — tất cả 81 tests pass

---

## Phase 7: Manual Verification

> ⚠️ **Làm sau khi deploy hoặc test locally**

- [ ] 7.1 Tạo test user hoặc dùng user có dữ liệu cũ
- [ ] 7.2 Học 1 session flashcard mới
- [ ] 7.3 Kiểm tra Supabase:
      ```sql
      SELECT word_id, fsrs_stability, fsrs_difficulty, fsrs_state, fsrs_reps
      FROM user_srs_records
      WHERE user_id = 'test-user-id'
      ORDER BY created_at DESC LIMIT 5;
      ```
- [ ] 7.4 Verify: `fsrs_state > 0` sau khi học
- [ ] 7.5 Verify: `isMastered` trả về `false` cho new cards
- [ ] 7.6 Test review session — cards xuất hiện đúng thứ tự
- [ ] 7.7 Verify: Dữ liệu SM-2 cũ không bị break

---

## Rollback (nếu cần)

```sql
-- Chạy trong Supabase SQL Editor
ALTER TABLE user_srs_records
  DROP COLUMN IF EXISTS fsrs_stability,
  DROP COLUMN IF EXISTS fsrs_difficulty,
  DROP COLUMN IF EXISTS fsrs_state,
  DROP COLUMN IF EXISTS fsrs_scheduled_days,
  DROP COLUMN IF EXISTS fsrs_reps,
  DROP COLUMN IF EXISTS fsrs_lapses;
```

---

## Files to Modify

| File | Priority | Risk |
|------|----------|------|
| `src/lib/srs.ts` | 🔴 High | Medium |
| `src/lib/types.ts` | 🔴 High | Low |
| `src/lib/supabase-storage.ts` | 🔴 High | Medium |
| `src/hooks/useFlashcard.ts` | 🔴 High | Medium |
| `src/hooks/useReviewSession.ts` | 🟡 Medium | Medium |
| `src/hooks/useFreeStudySession.ts` | 🟡 Medium | Low |

---

## Timeline

| Phase | Effort | Done |
|-------|--------|------|
| 1. DB Migration | 15 phút | ⬜ |
| 2. Update Types | 15 phút | ⬜ |
| 3. Update SRS | 1 giờ | ⬜ |
| 4. Update Storage | 1 giờ | ⬜ |
| 5. Update Hooks | 2 giờ | ⬜ |
| 6. Fix Issues | 30 phút | ⬜ |
| 7. Manual Verify | 30 phút | ⬜ |
| **Tổng** | **~6 giờ** | |
