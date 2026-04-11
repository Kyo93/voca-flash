# Phase 10: Student → Supabase Sync

> **Mục tiêu:** Thay localStorage bằng Supabase cho student app.
> **Ngày:** 2026-04-11
> **Trạng thái:** ✅ Hoàn tất

---

## Trước Phase 10 (localStorage)

```
User mở app
    ↓
loadCards()      → localStorage ['voca-flash-cards']
loadProgress()   → localStorage ['voca-flash-progress']
loadStreak()     → localStorage ['vocamaster-streak']
    ↓
StudyPage → hiển thị cards
    ↓
Rate card → saveProgress() → localStorage
         → recordStudy()   → localStorage
```

**Hạn chế:**
- Dữ liệu chỉ lưu trên 1 thiết bị
- Không sync được giữa các thiết bị
- Admin không thấy progress của user

---

## Sau Phase 10 (Supabase)

### Study Session Flow

```
User mở /study
    ↓
StudyPage → useFlashcard.initialize(topic?)
    ↓
useFlashcard gọi song song (Promise.all):
    ├── fetchWords(topic?)     → Supabase 'words' table
    │                          (lấy danh sách từ vựng theo topic)
    │
    └── user ? fetchUserProgress(user.id) : []
       → Supabase 'user_progress' table
       → Map<wordId, CardProgress>
    ↓
getDueCards() → lọc cards cần ôn tập hôm nay
    ↓
Hiển thị flashcard
    ↓
User lật thẻ → xem đáp án
    ↓
User chọn: Khó / Vừa / Dễ  (rating 1/2/3)
    ↓
useFlashcard.rate(rating)
    ├── calculateNextReview() → tính next review (SM-2)
    │   (chạy local, KHÔNG cần Supabase)
    │
    ├── update state local (React state)
    │
    └── [Fire-and-forget - non-blocking]:
        ├── upsertUserProgress(user.id, wordId, correct, wrong, mastered)
        │   → Supabase 'user_progress' table
        │   → UPSERT (insert or update)
        │
        └── recordStreak(user.id)
            → Supabase 'user_profiles.streak_days'
            → Tính streak: same day? keep / next day? +1 / missed? reset
```

### Dashboard Flow

```
User mở /dashboard
    ↓
DashboardPage useEffect → user ? loadSupabase() : loadLocal()
    ↓
Promise.all([
  fetchStreakFromSupabase(user.id)
      → user_profiles.streak_days, last_study_date

  fetchUserStats(user.id)
      → user_progress (mastered count, learning count)

  fetchTopicWordCounts()
      → topics + COUNT(words) per topic
])
    ↓
Hiển thị:
  - Daily goal progress bar (learning + mastered vs DAILY_GOAL=10)
  - Streak badge 🔥
  - Word count per topic (library cards)
```

### Library Flow

```
User mở /library
    ↓
LibraryPage useEffect
    ↓
user ? fetchTopicWordCounts() : loadLocalCards/Progress
    ↓
Hiển thị topic grid:
  - Mỗi topic card: total words, % mastered
  - Link → /study?topic=xxx
```

---

## Chi tiết từng function

### `supabase-storage.ts`

```typescript
// Lấy words từ Supabase, map sang Card (định dạng student app)
fetchWords(topicSlug?: string): Promise<Card[]>

// Lấy progress từ Supabase, map sang CardProgress (định dạng SRS)
fetchUserProgress(userId: string): Promise<Map<string, CardProgress>>

// Sau mỗi lần rate card
upsertUserProgress(userId, cardId, correctCount, wrongCount, mastered)
  → Supabase UPSERT vào user_progress
  → UNIQUE(user_id, word_id) nên không trùng

// Tính streak
recordStreak(userId): Promise<number>
  → Đọc user_profiles.streak_days, last_study_date
  → Tính: same day (keep) / next day (+1) / missed (reset to 1)
  → UPDATE user_profiles

// Dashboard stats
fetchUserStats(userId): Promise<{totalWords, mastered, learning, streakDays}>

// Library
fetchTopicWordCounts(): Promise<Record<slug, count>>
  → SELECT topics(slug, words(id))
```

---

## Supabase Schema tương ứng

```sql
-- words: từ vựng (admin quản lý)
words (id, topic_id, word, phonetic, pos, difficulty, definition, example, example_vi)

-- topics: chủ đề (admin quản lý)
topics (id, slug, name, icon, color, sort_order)

-- user_progress: tiến độ học tập MỖI USER (per word)
user_progress (id, user_id, word_id, correct_count, wrong_count, mastered, last_reviewed)
  → RLS: user chỉ thấy/progress của chính mình

-- user_profiles: profile + streak
user_profiles (id, email, streak_days, last_study_date, ...)
  → RLS: user chỉ đọc/update chính mình
```

---

## localStorage fallback

`storage.ts` **vẫn còn** và được dùng khi:

| Trường hợp | Dùng |
|-----------|------|
| User chưa login | `loadLocalCards()` → LibraryPage, streak local |
| Supabase lỗi | `storage.ts` fallback (catch errors) |
| Offline | localStorage (Supabase không hoạt động) |

**Note:** Student app **bắt buộc phải login** mới sync được Supabase. Chưa login vẫn học được (localStorage), nhưng progress không lên dashboard/admin.

---

## Auth flow (完整)

```
1. User vào /login
2. Đăng ký / Đăng nhập → Supabase Auth (email/password)
3. AuthContext fetchProfile(user.id)
4. → user_profiles.auto-created (trigger handle_new_user)
5. → Kiểm tra admin_users → isAdmin = true/false
6. → Redirect: admin? /admin : /dashboard
7. → AuthContext lưu user.id → useFlashcard dùng được user.id
```

---

## So sánh Before / After

| Khía cạnh | Before (localStorage) | After (Supabase) |
|---------|----------------------|-------------------|
| Words source | `loadCards()` localStorage | `fetchWords()` Supabase |
| Progress storage | `saveProgress()` localStorage | `upsertUserProgress()` Supabase |
| Streak | `recordStudy()` localStorage | `recordStreak()` Supabase |
| Multi-device | ❌ | ✅ |
| Admin thấy progress | ❌ | ✅ |
| Offline mode | ✅ (localStorage) | ✅ (fallback localStorage) |
| Requires login | ❌ | ⚠️ (để sync, không bắt buộc để học) |

---

## Còn thiếu / Cần cải thiện

1. **Per-topic mastered count** — Hiện LibraryPage hiển thị `total` words nhưng `mastered` = 0 vì `user_progress` không join được `topic_id`. Cần truy vấn thêm hoặc đổi schema.

2. **total_words in user_profiles** — Trường `total_words` trong schema chưa được update khi user học.

3. **longest_streak** — Chưa có column riêng, hiện dùng `streak_days` làm longest.

---

_Cập nhật: 2026-04-11_
