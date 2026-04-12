# Design: Domain Naming Refactor — Ubiquitous Language

## Context

Hai bug liên tiếp (repetitions reset cross-session, `prog.mastered` undefined) đều xuất phát từ **tên đối tượng không phản ánh đúng chức năng**:

1. `correct_count` — Tên gợi ý "tổng số lần đúng" nhưng thực tế lưu **chuỗi đúng liên tiếp** (SM-2 repetitions)
2. `UserProgress` — Dùng cho cả SRS metrics (flashcard engine) LẪN Admin stats, gây nhầm lẫn
3. `user_learning_state` — Tên gợi ý "trạng thái học tập" nhưng chỉ là **con trỏ Resume** (roadmap → last topic)
4. `fetchUserProgress()` — Đọc tên không biết đây là SRS data hay completion stats

## Technical Approach

**Pure rename** — Không thay đổi logic, schema structure, hay data. Chỉ rename để tên = chức năng.

PostgreSQL `ALTER TABLE ... RENAME` là metadata-only operation (không lock, không copy data). An toàn cho production.

### Domain Language Map (Sau refactor)

```
┌─────────────────────────────────────────────────────────────────┐
│                    VOCAFLASH DOMAIN MODEL                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [SRS Engine Layer]          ← Thuật toán SM-2                 │
│    Card              — 1 thẻ flashcard (in-memory)             │
│    CardProgress      — SM-2 state cho 1 card (in-memory)       │
│    SrsRecord         — SM-2 state persisted vào DB             │
│    user_srs_records  — Bảng DB lưu SRS metrics                 │
│                                                                 │
│  [Resume Layer]              ← Tính năng "Học tiếp"            │
│    ResumePointer     — Con trỏ roadmap→topic đang học dở       │
│    user_resume_pointers — Bảng DB lưu resume state             │
│                                                                 │
│  [Completion Layer]          ← Dashboard & UI progress bars    │
│    fetchDashboardStats()     — Tổng hợp stats cho Dashboard    │
│    fetchTopicCompletionMap() — % hoàn thành per-topic          │
│    fetchRoadmapStats()       — % hoàn thành per-roadmap        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Proposed Changes

### Database (1 migration file)

| Operation | SQL |
|-----------|-----|
| Rename table | `ALTER TABLE user_progress RENAME TO user_srs_records` |
| Rename column | `ALTER TABLE user_srs_records RENAME COLUMN correct_count TO repetitions` |
| Rename column | `ALTER TABLE user_srs_records RENAME COLUMN wrong_count TO lapse_count` |
| Rename table | `ALTER TABLE user_learning_state RENAME TO user_resume_pointers` |

### TypeScript Interfaces (`types.ts`)

| Cũ | Mới | Fields đổi tên |
|----|-----|----------------|
| `UserProgress` | `SrsRecord` | `correct_count` → `repetitions`, `wrong_count` → `lapse_count` |
| `UserLearningState` | `ResumePointer` | (giữ nguyên fields) |

### Functions (`supabase-storage.ts`)

| Cũ | Mới |
|----|-----|
| `SupabaseCardProgress` interface | **Xóa** (dùng `SrsRecord`) |
| `fetchUserProgress()` | `fetchSrsStates()` |
| `upsertUserProgress()` | `upsertSrsRecord()` |
| `fetchUserStats()` | `fetchDashboardStats()` |
| `fetchUserLearningStates()` | `fetchResumePointers()` |
| `upsertLearningState()` | `saveResumePointer()` |
| `fetchTopicProgressMap()` | `fetchTopicCompletionMap()` |

### Functions (`admin-queries.ts`)

| Cũ | Mới |
|----|-----|
| `getUserProgress()` | `getUserSrsRecords()` |

### Consumer Pages (4 files)

| File | Thay đổi |
|------|----------|
| `DashboardPage.tsx` | Import `fetchDashboardStats` |
| `LibraryPage.tsx` | Import `fetchResumePointers`, type `ResumePointer` |
| `RoadmapTopicsPage.tsx` | Import `fetchTopicCompletionMap`, `fetchResumePointers` |
| `UsersPage.tsx` | Import `getUserSrsRecords`, type `SrsRecord`, rename component + state |

### Files KHÔNG đổi

| File | Lý do |
|------|-------|
| `srs.ts` | Tên đã chuẩn (`Card`, `CardProgress`, `calculateNextReview`) |
| `StudyPrepScreen.tsx` | Không import từ storage, chỉ nhận props |
| `StudyPage.tsx` | Không import trực tiếp từ storage |

## Verification

1. **Build check**: `npm run build` — 0 errors
2. **Grep check**: Không còn reference nào đến tên cũ trong `src/`
3. **Runtime smoke test**: Dashboard → Library → Study → Admin Users → tất cả hoạt động bình thường
