# Design: Study Post-Flip Challenge — REVISED

**File:** `openspec/changes/study-post-flip-challenge/design.md`
**Date:** 2026-04-16 | **Status:** FINAL (pending user review)

---

## 1. Mục tiêu

Sau khi flip card trong Study session, user làm 1 bài test nhỏ (1 trong 3 loại ngẫu nhiên) → hệ thống gợi ý rating có căn cứ từ kết quả test → user vẫn có thể override hoặc bỏ qua.

**Review session giữ nguyên** — KHÔNG thay đổi Arena flow.

---

## 2. State Machine

```
StudyPage phases:
  FLIPPED      → Card back hiện, chưa có challenge
  CHALLENGING  → Challenge đang chạy, timer đang đếm
  RATING       → Challenge xong, SRSButtons hiện với gợi ý
  (skip)       → Challenge bị bỏ qua, SRSButtons hiện không có gợi ý

Transitions:
  FLIPPED → CHALLENGING: auto (useEffect khi isFlipped=true + prepScreen=false)
  CHALLENGING → RATING: onSubmit(isCorrect) từ challenge
  CHALLENGING → RATING (skip): skip button → setSuggestedRating(null)
  RATING → FLIPPED: onRate(rating) → next card
```

---

## 3. State Management (in StudyPage.tsx)

```ts
// Phase state
type StudyPhase = 'FLIPPED' | 'CHALLENGING' | 'RATING'

const [phase, setPhase] = useState<StudyPhase>('FLIPPED')

// Challenge timing
const challengeStartTimeRef = useRef<number>(0)

// Timeout cleanup
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

// Rating suggestion (null = user skip, no suggestion shown)
const [suggestedRating, setSuggestedRating] = useState<SrsRating | null>(null)
const [intervalPreviews, setIntervalPreviews] = useState<IntervalPreview[]>([])

// Reset khi card change
useEffect(() => {
  // Cleanup timeout
  if (timeoutRef.current) clearTimeout(timeoutRef.current)
  // Reset tất cả phase state
  setPhase('FLIPPED')
  setSuggestedRating(null)
  setIntervalPreviews([])
}, [currentCard?.id])
```

**Decision:** KHÔNG dùng state cho `challengeType`. Pick random type khi cần → dùng ngay → không cần lưu lâu dài.

---

## 4. Rating Mapping — `mapTestResultToRating()`

**File:** `src/lib/srs.ts`

```ts
export type StudyChallengeType = 'cloze' | 'listen' | 'recognition'

export interface IntervalPreview {
  rating: SrsRating
  label: string
}

/**
 * Map challenge result → FSRS rating (sau khi flip card).
 * Threshold: <3s=Easy, <8s=Good, ≥8s=Hard, sai=Again
 */
export function mapTestResultToRating(
  isCorrect: boolean,
  responseTimeMs: number,
): SrsRating {
  if (!isCorrect) return 1 // Again
  if (responseTimeMs < 3000) return 4 // Easy
  if (responseTimeMs < 8000) return 3 // Good
  return 2 // Hard
}
```

**Thresholds (30s timeout tự động → sai → rating 1):**

| Kết quả | Response time | FSRS Rating | Label |
|---------|--------------|-------------|-------|
| Sai (timeout 30s hoặc user skip) | — | 1 | Quên |
| Đúng + nhanh | < 3s | 4 | Dễ |
| Đúng + vừa | 3–8s | 3 | Vừa |
| Đúng + chậm | ≥ 8s | 2 | Khó |

---

## 5. Interval Preview — `computeIntervalPreviews()`

**File:** `src/lib/srs.ts`

```ts
function formatInterval(scheduledDays: number): string {
  if (scheduledDays < 1) {
    const minutes = Math.round(scheduledDays * 24 * 60)
    return minutes <= 1 ? '1 phút' : `${minutes} phút`
  }
  if (scheduledDays < 30) {
    return `${Math.round(scheduledDays)} ngày`
  }
  return `${Math.round(scheduledDays / 30)} tháng`
}

export function computeIntervalPreviews(
  currentProgress: CardProgress,
  intensity: number
): IntervalPreview[] {
  const retention = mapIntensityToRetention(intensity)
  return ([1, 2, 3, 4] as SrsRating[]).map(rating => {
    const result = calculateFSRSReview(currentProgress, rating, retention)
    return {
      rating,
      label: formatInterval(result.scheduledDays),
    }
  })
}
```

---

## 6. Challenge Shell — `StudyChallengeShell.tsx`

**File:** `src/components/StudyChallengeShell.tsx`

```tsx
interface StudyChallengeShellProps {
  type: StudyChallengeType
  word: Word
  choices?: string[]
  onSubmit: (isCorrect: boolean) => void
}

export default function StudyChallengeShell({ type, word, choices, onSubmit }: Props) {
  // Auto-fallback: cloze cần example, không có → dùng recognition
  if (type === 'cloze' && !word.example) {
    return <RecognitionChallenge word={word} choices={choices ?? generateChoices(word)} onSubmit={onSubmit} />
  }

  switch (type) {
    case 'cloze':
      return <ContextGapChallenge word={word} onSubmit={onSubmit} />
    case 'listen':
      return <GhostRecallChallenge word={word} onSubmit={onSubmit} />
    case 'recognition':
      return <RecognitionChallenge word={word} choices={choices ?? generateChoices(word)} onSubmit={onSubmit} />
  }
}
```

**User xác nhận:**
- Timeout: 30 giây
- Challenge type distribution: ngẫu nhiên (33.3% mỗi loại)
- GhostRecall giữ nguyên auto-play TTS

---

## 7. SRSButtons Enhanced

**File:** `src/components/SRSButtons.tsx` (tách riêng từ StudyPage.tsx)

```tsx
interface SRSButtonsProps {
  onRate: (rating: SrsRating) => void
  suggestedRating?: SrsRating | null  // null = skip, no suggestion shown
  intervalPreviews?: IntervalPreview[]
}

export default function SRSButtons({ onRate, suggestedRating, intervalPreviews }: Props) {
  const isSuggestionMode = suggestedRating !== null

  return (
    <div className="w-full max-w-md grid grid-cols-4 gap-2 px-1">
      {[1, 2, 3, 4].map(rating => {
        const preview = intervalPreviews?.find(p => p.rating === rating)
        const isSuggested = rating === suggestedRating

        return (
          <button
            key={rating}
            onClick={() => onRate(rating as SrsRating)}
            className={cn(
              'group flex flex-col items-center gap-1.5',
              isSuggested && 'ring-2 ring-primary rounded-lg'
            )}
          >
            {/* Button content (Quên/Khó/Vừa/Dễ) */}
            <div className={cn(
              'w-full py-4 font-headline font-bold rounded-lg border text-xs',
              rating === 1 && 'bg-error-container text-on-error-container',
              rating === 2 && 'bg-surface-container-highest text-on-surface-variant',
              rating === 3 && 'bg-primary text-on-primary shadow-lg shadow-primary/20',
              rating === 4 && 'bg-secondary-fixed text-on-secondary-fixed',
              isSuggested && 'border-primary'
            )}>
              {RATING_LABELS[rating]}
            </div>
            <span className="text-outline text-[9px] font-bold uppercase tracking-tighter">
              {RATING_SUB_LABELS[rating]}
            </span>
            {preview && (
              <span className={cn(
                'text-[8px] text-white/30 transition-opacity',
                isSuggested && 'text-primary'
              )}>
                ({preview.label})
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

const RATING_LABELS = { 1: 'Quên', 2: 'Khó', 3: 'Vừa', 4: 'Dễ' }
const RATING_SUB_LABELS = { 1: 'Lại', 2: 'Trễ', 3: 'Chuẩn', 4: 'Sớm' }
```

**Props contract:**
- `suggestedRating = null` → KHÔNG hiện gợi ý, vẫn hiện interval preview nếu có
- `suggestedRating = 2` → highlight nút Khó, hiện interval preview

---

## 8. StudyPage Integration

```tsx
// Challenge type selection (inline, không state)
const pickRandomChallengeType = (): StudyChallengeType => {
  const types: StudyChallengeType[] = ['cloze', 'listen', 'recognition']
  return types[Math.floor(Math.random() * types.length)]
}

// Auto-start challenge when card is flipped
useEffect(() => {
  if (isFlipped && !isPrepScreen && phase === 'FLIPPED') {
    const type = pickRandomChallengeType()
    challengeStartTimeRef.current = Date.now()
    setPhase('CHALLENGING')

    // Set timeout 30s
    timeoutRef.current = setTimeout(() => {
      handleChallengeSubmit(false, type)
    }, 30_000)
  }
}, [isFlipped, isPrepScreen])

// Handle challenge submission
const handleChallengeSubmit = (isCorrect: boolean, type: StudyChallengeType) => {
  // Cleanup timeout
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }

  const responseTime = Date.now() - challengeStartTimeRef.current
  const suggested = mapTestResultToRating(isCorrect, responseTime)
  const previews = computeIntervalPreviews(currentProgress ?? createInitialProgress(''), profile?.srs_intensity ?? 1.0)

  setSuggestedRating(suggested)
  setIntervalPreviews(previews)
  setPhase('RATING')
}

// Skip challenge
const handleSkipChallenge = () => {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }
  setSuggestedRating(null)
  setIntervalPreviews([])
  setPhase('RATING')
}

// Handle rate (wrap để reset phase)
const handleRate = (rating: SrsRating) => {
  // Reset phase state
  setPhase('FLIPPED')
  setSuggestedRating(null)
  setIntervalPreviews([])

  // Rate → useFlashcard → next card
  // Use setTimeout(0) để đảm bảo phase reset trước khi card thay đổi
  setTimeout(() => rate(rating), 0)
}
```

---

## 9. Edge Cases

| Case | Handling |
|------|----------|
| `currentCard` null | KHÔNG render challenge, KHÔNG start timeout |
| Card không có example | Cloze auto-fallback sang Recognition |
| Supabase offline | Challenge vẫn chạy (local state), upsertSrsRecord fail → silent |
| TTS fail (GhostRecall) | Auto-play fail → button "Play" vẫn hiện, user click lại |
| No distractor choices | Recognition hiện 1 correct + 3 hardcoded |
| User rapid-click rate | Phase reset → prevents double-submit |

---

## 10. Files Changed

```
src/lib/srs.ts
  + mapTestResultToRating(isCorrect, responseTimeMs): SrsRating
  + computeIntervalPreviews(currentProgress, intensity): IntervalPreview[]
  + formatInterval(scheduledDays): string
  + IntervalPreview interface
  + StudyChallengeType type

src/lib/utils.ts
  + generateChoices(word: Word): string[] (1 correct + 3 hardcoded)

src/components/StudyChallengeShell.tsx (NEW)
  + StudyChallengeShell component (switch + fallback logic)

src/components/SRSButtons.tsx (NEW — extracted từ StudyPage)
  + SRSButtons enhanced với suggestion + interval preview

src/pages/StudyPage.tsx
  + Phase state + timeout ref
  + handleChallengeSubmit, handleSkipChallenge, handleRate
  + useEffect auto-start challenge
  + useEffect reset on card change
  + Render StudyChallengeShell + SRSButtons

tests/unit/study-post-flip.test.ts (NEW)
  + mapTestResultToRating: 6 cases
  + computeIntervalPreviews: 4 items check
  + generateChoices: 4 items, 1 correct, no duplicates
```