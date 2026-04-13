# Design: Fix New User Onboarding — Profile Auto-Creation & Safe Null Handling

## Context & Root Cause Summary

### Problem
Newly registered users (Supabase Auth creates account) encounter a **silent crash** when navigating to the Progress page:

1. `user_profiles` table has no record for new users → `.single()` throws 406 Not Acceptable
2. `Promise.all` in `ProgressPage.tsx` rejects entirely → spinner hangs indefinitely
3. Auth token lock contention occurs from concurrent session fetches hitting null profile

### Scope

| In Scope | Out of Scope |
|---|---|
| Auto-create `user_profiles` on first login | DB schema changes / new columns |
| Replace `.single()` with `.maybeSingle()` + fallbacks | SRS algorithm changes |
| Isolate `Promise.all` failures in ProgressPage | Other pages (Roadmap, Flashcard) |
| Fix `recordStreak()` for new users | Performance optimization |

---

## Proposed Changes

### 1. `AuthContext.tsx` — Lazy Profile Auto-Creation

**What changes:**
- Add `ensureUserProfile(userId, email)` function after `refreshProfile()`
- Call it inside `loadUserData()` before fetching profile
- If profile fetch returns null → upsert default profile silently
- Profile defaults: `daily_target: 20`, `theme_mode: 'light'`, `streak_days: 0`

**Why this approach:**
- **Prevents the root cause**: profile exists before any other component reads it
- **Idempotent**: safe to call multiple times (checks existence first)
- **Non-blocking**: fire-and-forget upsert after existence check

**Verification:**
```typescript
// In browser console after new signup + login:
const { data } = await supabase.from('user_profiles').select('*').eq('id', '<new-user-id>')
console.assert(data !== null, 'Profile must exist after login')
```

---

### 2. `supabase-storage.ts` — Defensive Query Pattern

**What changes (3 locations):**

#### 2a. `fetchDashboardStats()` — line 328
```typescript
// BEFORE:
.eq('id', userId).single(),

// AFTER:
.eq('id', userId).maybeSingle(),

// AND fallback:
streakDays: (profileRes.data?.streak_days ?? 0) as number,
```
**Why:** `Promise.all` in ProgressPage crashes if `.single()` throws. `.maybeSingle()` returns `null` instead.

#### 2b. `recordStreak()` — line 359
```typescript
// BEFORE:
.single()

// AFTER:
.maybeSingle()

// AND handle null profile case:
if (fetchError || !profile) {
  // User has no profile yet → create one with streak = 1
  await supabase.from('user_profiles').insert({ id: userId, streak_days: 1, last_study_date: today })
  return 1
}
```
**Why:** `recordStreak()` is called when user completes first study session — profile may not exist yet.

#### 2c. `upsertSrsRecord()` — line 145-152
```typescript
// Already uses .maybeSingle() ✓ — no change needed
```

**Verification:**
```typescript
// Test with fresh Supabase auth user (no profile):
const stats = await fetchDashboardStats('<new-user-id>')
console.assert(stats.streakDays === 0, 'New user should have 0 streak')
console.assert(stats.totalWords === 0, 'New user should have 0 words')
```

---

### 3. `ProgressPage.tsx` — Isolated Promise.allSettled

**What changes (line 47-52):**
```typescript
// BEFORE:
const [userStats, summary, allRoadmaps, vocabData] = await Promise.all([...])

// AFTER:
const results = await Promise.allSettled([
  fetchDashboardStats(user.id),
  fetchDashboardSummary(user.id),
  fetchRoadmaps(),
])

const userStats = results[0].status === 'fulfilled' ? results[0].value : null
const summary = results[1].status === 'fulfilled' ? results[1].value : null
const allRoadmaps = results[2].status === 'fulfilled' ? results[2].value : []

// vocabData stays with individual catch
const vocabData = await fetchUserVocabulary(user.id).catch(() => [])
```

**Why this approach:**
- One service failing no longer crashes the entire page
- UI still renders with partial data (safe nulls)
- No behavioral change for existing users

**Verification:**
```typescript
// Manual test: temporarily throw in fetchDashboardStats
// Page should still render Roadmap list and Memory Health
```

---

## Data Flow After Fix

```
Signup/Login
     │
     ▼
AuthContext.loadUserData()
     │
     ├─► ensureUserProfile()  ──► INSERT user_profiles (if not exists)
     │
     ├─► fetch profile         ──► always succeeds (profile now exists)
     │
     └─► refreshActiveRoadmap()
              │
              ▼
ProgressPage.loadData()
     │
     ├─► fetchDashboardStats()  ──► .maybeSingle() → 0 streak (safe)
     ├─► fetchDashboardSummary() ─► safe (already uses .maybeSingle())
     ├─► fetchRoadmaps()        ──► safe
     └─► fetchUserVocabulary()  ──► .catch([]) → empty array (safe)
              │
              ▼
     Page renders: streak=0, words=0, due=0
```

---

## Open Questions / Pre-flight Checks

| Check | Owner | Status |
|---|---|---|
| RLS policy: authenticated users can INSERT into `user_profiles`? | Review Supabase dashboard | ⬜ TODO |
| All `.single()` calls in `supabase-storage.ts` audited? | grep + manual review | ⬜ TODO |
| RLS policy allows UPDATE for `recordStreak`? | Review Supabase dashboard | ⬜ TODO |
