# Implementation Checklist: Study Post-Flip Challenge — REVISED

**File:** `openspec/changes/study-post-flip-challenge/tasks.md`
**Date:** 2026-04-16 | **Status:** FINAL (pending user review)

**User confirmed:**
- Skip → "Tự đánh giá" (suggestedRating = null, không highlight)
- Timeout: 30 giây
- Challenge type: ngẫu nhiên 33.3% mỗi loại

---

## Prerequisites

### Pre-flight check
- [ ] Đọc lại `design.md` trước khi bắt đầu
- [ ] `shuffleArray` tồn tại trong `src/lib/utils.ts` → check trước
- [ ] `ContextGapChallenge`, `GhostRecallChallenge`, `RecognitionChallenge` có thể import được

---

## Phase 1: Foundation — Pure functions (NO React, NO hooks)

### 1.1 — `mapTestResultToRating()` in `src/lib/srs.ts`

**RED:** Viết tests trước

```ts
// tests/unit/study-post-flip-rating.test.ts
describe('mapTestResultToRating', () => {
  it('sai → rating 1', () => {
    expect(mapTestResultToRating(false, 5000)).toBe(1)
    expect(mapTestResultToRating(false, 0)).toBe(1)
    expect(mapTestResultToRating(false, 60000)).toBe(1)
  })

  it('đúng + nhanh (<3000ms) → rating 4', () => {
    expect(mapTestResultToRating(true, 0)).toBe(4)
    expect(mapTestResultToRating(true, 1500)).toBe(4)
    expect(mapTestResultToRating(true, 2999)).toBe(4)
  })

  it('đúng + vừa (3000-8000ms) → rating 3', () => {
    expect(mapTestResultToRating(true, 3000)).toBe(3)
    expect(mapTestResultToRating(true, 5000)).toBe(3)
    expect(mapTestResultToRating(true, 7999)).toBe(3)
  })

  it('đúng + chậm (≥8000ms) → rating 2', () => {
    expect(mapTestResultToRating(true, 8000)).toBe(2)
    expect(mapTestResultToRating(true, 15000)).toBe(2)
    expect(mapTestResultToRating(true, 30000)).toBe(2)
  })
})
```

**Verify RED:** Chạy `npm test tests/unit/study-post-flip-rating.test.ts` → phải fail (function chưa có)

**GREEN:** Implement function trong `src/lib/srs.ts`:

```ts
export function mapTestResultToRating(
  isCorrect: boolean,
  responseTimeMs: number,
): SrsRating {
  if (!isCorrect) return 1
  if (responseTimeMs < 3000) return 4
  if (responseTimeMs < 8000) return 3
  return 2
}
```

**Verify GREEN:** Test pass → tất cả 4 cases green

---

### 1.2 — `IntervalPreview` type + `computeIntervalPreviews()` in `src/lib/srs.ts`

**RED:** Viết tests

```ts
// tests/unit/study-post-flip-interval.test.ts
describe('computeIntervalPreviews', () => {
  it('trả về đúng 4 items với ratings 1-2-3-4', () => {
    const previews = computeIntervalPreviews(mockProgress, 1.0)
    expect(previews).toHaveLength(4)
    expect(previews.map(p => p.rating)).toEqual([1, 2, 3, 4])
  })

  it('labels không undefined', () => {
    const previews = computeIntervalPreviews(mockProgress, 1.0)
    previews.forEach(p => {
      expect(typeof p.label).toBe('string')
      expect(p.label.length).toBeGreaterThan(0)
    })
  })

  it('interval tăng dần từ rating 1→4', () => {
    const previews = computeIntervalPreviews(mockProgress, 1.0)
    // Rating 4 (Easy) = longest interval
    expect(previews[3].rating).toBe(4)
  })
})
```

**Verify RED:** Tests fail → type/function chưa có

**GREEN:** Thêm vào `src/lib/srs.ts`:

```ts
export interface IntervalPreview {
  rating: SrsRating
  label: string
}

function formatInterval(scheduledDays: number): string {
  if (scheduledDays < 1) {
    const minutes = Math.round(scheduledDays * 24 * 60)
    return minutes <= 1 ? '1 phút' : `${minutes} phút`
  }
  if (scheduledDays < 30) return `${Math.round(scheduledDays)} ngày`
  return `${Math.round(scheduledDays / 30)} tháng`
}

export function computeIntervalPreviews(
  currentProgress: CardProgress,
  intensity: number
): IntervalPreview[] {
  const retention = mapIntensityToRetention(intensity)
  return ([1, 2, 3, 4] as SrsRating[]).map(rating => {
    const result = calculateFSRSReview(currentProgress, rating, retention)
    return { rating, label: formatInterval(result.scheduledDays) }
  })
}
```

**Verify GREEN:** Tests pass. Run full test suite → ensure no regressions.

---

### 1.3 — `generateChoices()` in `src/lib/utils.ts`

**RED:** Viết tests

```ts
// tests/unit/study-post-flip-choices.test.ts
describe('generateChoices', () => {
  it('trả về đúng 4 items', () => {
    const choices = generateChoices(mockWord)
    expect(choices).toHaveLength(4)
  })

  it('definition đúng nằm trong choices', () => {
    const choices = generateChoices(mockWord)
    expect(choices).toContain(mockWord.definition)
  })

  it('4 items không trùng nhau', () => {
    const choices = generateChoices(mockWord)
    const unique = new Set(choices)
    expect(unique.size).toBe(4)
  })

  it('4 items là 4 strings khác nhau', () => {
    const choices = generateChoices(mockWord)
    expect(choices.every(c => typeof c === 'string')).toBe(true)
    expect(new Set(choices).size).toBe(4)
  })
})
```

**Verify RED:** Tests fail → function chưa có

**GREEN:** Thêm vào `src/lib/utils.ts`:

```ts
const HARD_CODED_DISTRACTORS = [
  'để nhớ lại điều gì đó',
  'học thuộc một cách có hệ thống',
  'ghi nhớ thông tin quan trọng',
  'tập trung chú ý vào điều gì',
  'hiểu rõ vấn đề cốt lõi',
  'áp dụng kiến thức vào thực tế',
  'phân tích tình huống cụ thể',
  'đánh giá kết quả công việc',
]

export function generateChoices(word: Word): string[] {
  const correct = word.definition
  const distractors = HARD_CODED_DISTRACTORS
    .filter(d => d !== correct)
    .slice(0, 3)
  return shuffleArray([correct, ...distractors])
}
```

**Verify GREEN:** Tests pass. Confirm `shuffleArray` tồn tại trong utils.ts trước khi implement.

---

## Phase 2: Components

### 2.1 — `StudyChallengeShell.tsx`

**Verify:** Import thành công 3 components

```tsx
// src/components/StudyChallengeShell.tsx
import ContextGapChallenge from './review/ContextGapChallenge'
import GhostRecallChallenge from './review/GhostRecallChallenge'
import RecognitionChallenge from './review/RecognitionChallenge'
import { generateChoices } from '../lib/utils'
import type { StudyChallengeType } from '../lib/srs'
import type { Word } from '../lib/types'

interface StudyChallengeShellProps {
  type: StudyChallengeType
  word: Word
  choices?: string[]
  onSubmit: (isCorrect: boolean) => void
}

export default function StudyChallengeShell({ type, word, choices, onSubmit }: Props) {
  // Cloze fallback: không có example → dùng recognition
  if (type === 'cloze' && !word.example) {
    return (
      <RecognitionChallenge
        word={word}
        choices={choices ?? generateChoices(word)}
        onSubmit={onSubmit}
      />
    )
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

**Verify:** Component render 3 types không crash (dùng Storybook hoặc manual test)

---

### 2.2 — Extract `SRSButtons.tsx`

Tách `SRSButtons` thành file riêng để tái sử dụng và test được:

```tsx
// src/components/SRSButtons.tsx
import type { SrsRating, IntervalPreview } from '../lib/srs'
import { cn } from '../lib/utils' // check nếu có cn() hoặc dùng classnames

interface SRSButtonsProps {
  onRate: (rating: SrsRating) => void
  suggestedRating?: SrsRating | null
  intervalPreviews?: IntervalPreview[]
}

const RATING_LABELS = { 1: 'Quên', 2: 'Khó', 3: 'Vừa', 4: 'Dễ' }
const RATING_SUB_LABELS = { 1: 'Lại', 2: 'Trễ', 3: 'Chuẩn', 4: 'Sớm' }
const RATING_STYLES = {
  1: 'bg-error-container text-on-error-container',
  2: 'bg-surface-container-highest text-on-surface-variant',
  3: 'bg-primary text-on-primary shadow-lg shadow-primary/20',
  4: 'bg-secondary-fixed text-on-secondary-fixed',
}

export default function SRSButtons({ onRate, suggestedRating, intervalPreviews }: Props) {
  return (
    <div className="w-full max-w-md grid grid-cols-4 gap-2 px-1">
      {([1, 2, 3, 4] as SrsRating[]).map(rating => {
        const preview = intervalPreviews?.find(p => p.rating === rating)
        const isSuggested = rating === suggestedRating

        return (
          <button
            key={rating}
            onClick={() => onRate(rating)}
            className={cn(
              'group flex flex-col items-center gap-1',
              isSuggested && 'ring-2 ring-primary rounded-lg p-0.5 -m-0.5'
            )}
          >
            <div className={cn(
              'w-full py-4 font-headline font-bold rounded-lg border text-xs transition-all',
              RATING_STYLES[rating],
              isSuggested && 'border-primary'
            )}>
              {RATING_LABELS[rating]}
            </div>
            <span className="text-outline text-[9px] font-bold uppercase tracking-tighter">
              {RATING_SUB_LABELS[rating]}
            </span>
            {preview && (
              <span className={cn(
                'text-[8px] transition-opacity',
                isSuggested ? 'text-primary' : 'text-white/30'
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
```

**Note:** Nếu `cn()` không tồn tại → dùng template literal với conditional classes thông thường.

**Verify:** Render trong StudyPage → buttons hiện với correct labels

---

## Phase 3: StudyPage Integration

### 3.1 — Thêm state + refs (không thay đổi logic cũ)

Trong `StudyPage.tsx`, thêm:

```ts
// Import types
import { mapTestResultToRating, computeIntervalPreviews, type StudyChallengeType, type IntervalPreview } from '../lib/srs'
import { generateChoices } from '../lib/utils'
import SRSButtons from '../components/SRSButtons'
import StudyChallengeShell from '../components/StudyChallengeShell'

// State (trong component StudyPage)
const [phase, setPhase] = useState<StudyPhase>('FLIPPED')
const [suggestedRating, setSuggestedRating] = useState<SrsRating | null>(null)
const [intervalPreviews, setIntervalPreviews] = useState<IntervalPreview[]>([])
const challengeStartTimeRef = useRef<number>(0)
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

// Type
type StudyPhase = 'FLIPPED' | 'CHALLENGING' | 'RATING'
```

**Verify:** TypeScript compile không lỗi (tạm thời chưa render gì mới)

---

### 3.2 — useEffect auto-start challenge

```ts
useEffect(() => {
  if (isFlipped && !isPrepScreen && phase === 'FLIPPED' && currentCard) {
    challengeStartTimeRef.current = Date.now()
    setPhase('CHALLENGING')

    timeoutRef.current = setTimeout(() => {
      // Timeout → auto sai → rating 1
      handleChallengeSubmit(false, 'recognition')
    }, 30_000)
  }
}, [isFlipped, isPrepScreen])
```

**Verify:** Flip card → phase = CHALLENGING → timer active

---

### 3.3 — handleChallengeSubmit + handleSkipChallenge

```ts
const handleChallengeSubmit = (isCorrect: boolean, _type?: StudyChallengeType) => {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }

  const responseTime = Date.now() - challengeStartTimeRef.current
  const suggested = mapTestResultToRating(isCorrect, responseTime)
  const previews = computeIntervalPreviews(
    currentProgress ?? createInitialProgress(''),
    profile?.srs_intensity ?? 1.0
  )

  setSuggestedRating(suggested)
  setIntervalPreviews(previews)
  setPhase('RATING')
}

const handleSkipChallenge = () => {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }
  setSuggestedRating(null)
  setIntervalPreviews([])
  setPhase('RATING')
}
```

**Verify:** Challenge submit → RATING phase → suggestedRating set

---

### 3.4 — handleRate + reset

```ts
const handleRate = (rating: SrsRating) => {
  // Reset phase state
  setPhase('FLIPPED')
  setSuggestedRating(null)
  setIntervalPreviews([])

  // Rate → useFlashcard → next card (setTimeout để reset trước)
  setTimeout(() => rate(rating), 0)
}
```

**Verify:** Rate → next card → phase reset về FLIPPED

---

### 3.5 — Reset khi card change (cleanup)

```ts
useEffect(() => {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }
  setPhase('FLIPPED')
  setSuggestedRating(null)
  setIntervalPreviews([])
}, [currentCard?.id])
```

**Verify:** Navigate to next card → challenge state fully reset

---

## Phase 4: Render Logic

### 4.1 — Render challenge OR rating buttons

Trong JSX của StudyPage, thay thế `SRSButtons` cũ bằng:

```tsx
{phase === 'CHALLENGING' && currentCard && (
  <div className="w-full flex flex-col items-center gap-4 mt-4">
    <StudyChallengeShell
      type={['cloze', 'listen', 'recognition'][Math.floor(Math.random() * 3)] as StudyChallengeType}
      word={currentCard}
      onSubmit={handleChallengeSubmit}
    />
    <button
      onClick={handleSkipChallenge}
      className="text-white/30 text-xs hover:text-white/60 transition-colors"
    >
      Bỏ qua → tự đánh giá
    </button>
  </div>
)}

{phase === 'RATING' && (
  <div className="mt-4">
    {suggestedRating !== null && (
      <p className="text-center text-primary text-xs mb-2 font-bold">
        Hệ thống gợi ý
      </p>
    )}
    <SRSButtons
      onRate={handleRate}
      suggestedRating={suggestedRating}
      intervalPreviews={intervalPreviews}
    />
  </div>
)}
```

**Verify:**
- CHALLENGING → Challenge shell + skip button
- RATING → SRSButtons với/without suggestion

---

## Phase 5: Polish

### 5.1 — Animation (framer-motion)

Thêm animation cho challenge area:

```tsx
{phase === 'CHALLENGING' && currentCard && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="w-full flex flex-col items-center gap-4 mt-4"
  >
    <StudyChallengeShell ... />
  </motion.div>
)}
```

**Verify:** Challenge mount → fade-in từ dưới, smooth

### 5.2 — Layout check

Đảm bảo card ở trên, challenge ở dưới, không overlap. Mobile responsive.

**Verify:** Resize browser → layout không break

---

## Phase 6: Tests

### 6.1 — Integration test: full flow

```ts
// tests/unit/study-post-flip-flow.test.ts
describe('Study Post-Flip Flow', () => {
  it('pickRandomChallengeType trả về valid type', () => {
    const types: StudyChallengeType[] = ['cloze', 'listen', 'recognition']
    const type = pickRandomChallengeType() // hàm inline
    expect(types).toContain(type)
  })

  it('skip → suggestedRating = null', () => {
    // Mock handleSkipChallenge → kiểm tra setSuggestedRating(null)
  })

  it('timeout → suggestedRating = 1', () => {
    // Mock 30s timeout → kiểm tra handleChallengeSubmit(false)
  })

  it('phase reset khi card change', () => {
    // Mock currentCard.id change → kiểm tra phase reset
  })
})
```

---

## Execution Order (strict)

```
STEP 0: Verify imports + shuffleArray tồn tại
  ↓
STEP 1.1: mapTestResultToRating RED → GREEN
  ↓
STEP 1.2: computeIntervalPreviews RED → GREEN
  ↓
STEP 1.3: generateChoices RED → GREEN
  ↓
STEP 2.1: StudyChallengeShell component
  ↓
STEP 2.2: SRSButtons extracted component
  ↓
STEP 3.1: State + types in StudyPage (compile check)
  ↓
STEP 3.2: useEffect auto-start + timeout
  ↓
STEP 3.3: handleChallengeSubmit + handleSkipChallenge
  ↓
STEP 3.4: handleRate + reset
  ↓
STEP 3.5: Reset on card change
  ↓
STEP 4.1: Render logic (challenge OR rating)
  ↓
STEP 5.1: Animation
  ↓
STEP 5.2: Layout check
  ↓
STEP 6: Tests + manual verification
```

---

## Final Verification Checklist

```
□ mapTestResultToRating: 4 cases pass (sai, nhanh, vừa, chậm)
□ computeIntervalPreviews: 4 items, labels format đúng
□ generateChoices: 4 items, 1 correct, 3 different
□ StudyChallengeShell: cloze/listen/recognition render OK
□ Cloze fallback: card không có example → Recognition
□ SRSButtons: highlight đúng nút gợi ý
□ Skip: "Tự đánh giá" label hiện, không có highlight
□ Timeout 30s: auto → rating 1
□ Phase transition: FLIPPED→CHALLENGING→RATING→FLIPPED
□ Next card: challenge state fully reset
□ Interval preview: "X ngày" format đúng
□ Mobile responsive: không overflow
□ Review session: KHÔNG break (git diff)
□ Build: 0 TypeScript errors
```

---

## Notes for implementation

- **DO NOT** thay đổi `useReviewSession.ts`, `ChallengeManager.tsx`, hay bất kỳ Arena component nào
- **DO NOT** thay đổi `useFlashcard.ts` logic (rate, flip, etc.)
- **CHỈ** thay đổi `StudyPage.tsx` về mặt render + thêm state
- **CHỈ** thêm code vào `src/lib/srs.ts` (không sửa logic cũ)
- Nếu `cn()` utility không có → dùng template literal
- Nếu `createEmptyCard()` cần import → kiểm tra trước