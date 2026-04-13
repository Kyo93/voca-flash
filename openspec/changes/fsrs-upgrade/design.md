# Design: FSRS Hard Migration

> **Mục tiêu:** Chuyển đổi toàn diện sang FSRS, xóa sạch code SM-2 cũ để hệ thống gọn nhẹ và dễ bảo trì.

---

## Context & Technical Approach

### Tại sao chọn Hard Migration?
- **Sạch sẽ (Clean Code):** Không cần duy trì logic dual-mode phức tạp. Cả 2 hooks (`useFlashcard`, `useReviewSession`) sẽ dùng chung 1 logic FSRS duy nhất.
- **Thống nhất (Consistency):** Tránh việc `mastered` status bị lệch giữa 2 thuật toán.
- **Dữ liệu nhỏ:** Hiện tại chỉ có 21 records, việc chạy migration SQL hàng loạt (Batch) là phương án an toàn nhất.

### Architecture (REFINED)

```
┌──────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   src/lib/srs.ts │────▶│  ts-fsrs@5   │────▶│ Supabase (MỚI)  │
│  (FSRS ONLY)     │     │  Scheduler   │     │ fsrs_* columns  │
└──────────────────┘     └──────────────┘     └─────────────────┘
         │                       │                    │
         ▼                       ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                       CardProgress                          │
│  { stability, difficulty, state, reps, lapses, due, ... }   │
└─────────────────────────────────────────────────────────────┘
```

### Key Decisions (REFINED)

| Decision | Reason |
|----------|--------|
| **Remove SM-2 Logic** | Loại bỏ hoàn toàn function `calculateNextReview` cũ. |
| **SQL Batch Migration** | Chuyển đổi 21 records cũ qua SQL UPDATE ngay lập tức. |
| **State-Aware Mastered** | `mastered = (stability >= 21 AND state != 3)`. |
| **4-Button Rating** | Cập nhật UI sang Again (1), Hard (2), Good (3), Easy (4). |
| **Standardized Dates** | Ép kiểu Strict Date Flow (ISO -> Date -> ISO) để tránh lỗi Timezone. |

---

## ts-fsrs v5.3.2 Integration

### Core Setup
```typescript
const scheduler = fsrs({ 
  enable_short_term: false, // Dùng cho vocabulary app (interval 1+ ngày)
  request_retention: 0.9    // Mặc định (sẽ map từ profile settings)
})
```

### Mapping Rating values
- ** Rating 1 (Again):** Quên hoàn toàn.
- ** Rating 2 (Hard):** Nhớ mang máng, mất nhiều công.
- ** Rating 3 (Good):** Nhớ tốt, phản xạ ổn.
- ** Rating 4 (Easy):** Nhớ rất rõ, không cần ôn sớm.

---

## Proposed Changes

### 1. Database & RPCs
- **Migration 011:** Thực hiện batch update và nâng cấp RPCs aggregations.
- **RPC `get_progress_page_data`:** Cập nhật logic lọc `learned` và `mastered`.

### 2. Multi-Page UI Update
- **StudyPage:** 4 nút rating với text gợi ý thời gian review.
- **MasteryPage:** Thanh strength hiển thị theo stability (ví dụ: stability 30 ngày = 100%).
- **SettingsPage:** Slider hoặc Dropdown chỉnh `request_retention` (ẩn mapping từ `srs_intensity`).
- **Admin UsersPage:** Hiển thị chi tiết thông số FSRS để dễ debug.

### 3. Hooks Correction
- **Wrong Detection:** Thống nhất `isCorrect = (rating !== 1)`.
- **Free Study:** Dùng `scheduler.forget()` thay vì reset manual fields.

---

## Verification
- Chạy 81 tests hiện có sau khi đã update imports.
- Kiểm tra SQL: `SELECT COUNT(*) FROM user_srs_records WHERE fsrs_stability > 0`.
- Kiểm tra Dashboard: Memory Health phải được tính từ các cột FSRS.
