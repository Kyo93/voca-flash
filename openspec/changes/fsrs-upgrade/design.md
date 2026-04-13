# Design: Nâng cấp SRS lên FSRS

> **Cập nhật:** 2026-04-13
> **Library:** `ts-fsrs@5.3.2` ✅ (đã install)

---

## Context & Technical Approach

### Tại sao cần FSRS?

- **SM-2 hiện tại:** Interval tăng theo cấp số nhân (`interval * ease`), dễ tạo review backlog
- **FSRS:** Tối ưu interval dựa trên stability thực tế → giảm 20-30% review count
- **Target:** 90% retention với minimum review effort

### Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   srs.ts    │────▶│  ts-fsrs@5   │────▶│ Supabase (NEW)  │
│  (SM-2 legacy)     │  Scheduler   │     │ fsrs_* columns  │
└─────────────┘     └──────────────┘     └─────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│                    CardProgress                           │
│  { SM-2: ease, interval, repetitions }                │
│  { FSRS: stability, difficulty, fsrsState, reps }      │
└─────────────────────────────────────────────────────────┘
```

### Key Decisions

| Decision | Reason |
|----------|--------|
| `enable_short_term: false` | Skip learning steps → vocabulary app hoạt động như mong đợi (New → interval 1+ ngày) |
| Keep SM-2 fields in DB | Backward compatibility, dữ liệu cũ không bị break |
| Lazy migration | Chuyển SM-2 → FSRS khi user học từ cũ lần đầu |
| Singleton scheduler | Tránh tạo instance mới mỗi review |

---

## ts-fsrs v5.3.2 — API Reference

### Card interface

```typescript
interface Card {
  due: Date
  stability: number      // Recall stability (days)
  difficulty: number     // 0-1 (0=easy, 1=hard)
  scheduled_days: number
  reps: number          // ⚠️ KHÔNG phải repetitions!
  lapses: number
  state: State          // New=0, Learning=1, Review=2, Relearning=3
  last_review?: Date
}
```

### Rating / State

```typescript
Rating.Again = 1, Rating.Hard = 2, Rating.Good = 3, Rating.Easy = 4
State.New = 0, State.Learning = 1, State.Review = 2, State.Relearning = 3
```

### Core Methods

```typescript
import { fsrs, createEmptyCard, Rating, State } from 'ts-fsrs'

const scheduler = fsrs({ enable_short_term: false })

// Preview all 4 outcomes
const preview = scheduler.repeat(card, new Date())
preview[Rating.Good].card  // Good outcome

// Calculate single outcome
const { card: newCard } = scheduler.next(card, new Date(), Rating.Good)

// Reset (forget)
const { card: resetCard } = scheduler.forget(card, new Date())
```

---

## Proposed Changes

### `supabase/migrations/009_fsrs_fields.sql`

Thêm 6 columns mới vào `user_srs_records`:

```sql
fsrs_stability: FLOAT       -- Recall stability
fsrs_difficulty: FLOAT      -- Intrinsic difficulty
fsrs_state: INTEGER        -- 0=New, 1=Learning, 2=Review, 3=Relearning
fsrs_scheduled_days: INTEGER
fsrs_reps: INTEGER         -- ⚠️ reps, không phải repetitions!
fsrs_lapses: INTEGER
```

> ⚠️ `elapsed_days` **không lưu** (deprecated in v5)

### `src/lib/srs.ts`

**Thêm exports:**
- `createFsrsCard()` — Tạo card mới
- `calculateFSRSReview()` — Tính review với FSRS
- `progressToFsrsCard()` — Convert CardProgress → Card
- `fsrsCardToProgress()` — Convert Card → CardProgress
- `isFsrsMigrated()` — Kiểm tra đã migrate chưa
- `isMastered()` — Unified mastered check
- `getFsrsScheduler()` — Singleton scheduler

**Giữ nguyên:**
- `calculateNextReview()` — SM-2 legacy
- `createInitialProgress()` — SM-2 legacy
- `getDueCards()` — SM-2 legacy

### `src/lib/types.ts`

Thêm FSRS fields vào `SrsRecord` và `MasteryWord`.

### `src/lib/supabase-storage.ts`

- `fetchSrsStates()` — Đọc cả SM-2 + FSRS fields
- `upsertSrsRecord()` — Ghi cả SM-2 + FSRS fields
- `fetchReviewWords()` — Order by `next_review_at`

### `src/hooks/useFlashcard.ts`

- Dùng FSRS thay SM-2 khi `isFsrsMigrated()`
- Unified `isMastered()` thay vì `repetitions >= 5`

### `src/hooks/useReviewSession.ts`

- `selectQuadrant` dùng `stability` thay vì `repetitions`
- Unified `isMastered()`

### `src/hooks/useFreeStudySession.ts`

- Dùng `resetFsrsCard()` thay vì reset manual

---

## Verification

### Automated Tests (✅ Đã tạo)

| File | Tests | Status |
|------|-------|--------|
| `tests/srs-sm2.test.ts` | 24 | ✅ |
| `tests/srs-migration.test.ts` | 20 | ✅ |
| `tests/srs-fsrs.test.ts` | 25 | ✅ |
| **Tổng** | **81** | ✅ |

### Manual Verification Checklist

- [ ] DB migration chạy thành công
- [ ] Cards mới học → `fsrs_state > 0`
- [ ] Cards đã học → `fsrs_stability > 0`
- [ ] `isMastered()` trả về đúng
- [ ] Dữ liệu cũ (SM-2) không bị break
- [ ] Review session hoạt động đúng

### Database Verification

```sql
-- Check columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_srs_records'
AND column_name LIKE 'fsrs_%';

-- Check sample data
SELECT word_id, fsrs_stability, fsrs_difficulty, fsrs_state, fsrs_reps
FROM user_srs_records
WHERE user_id = 'your-user-id'
LIMIT 10;
```
