# Incident Report: Study Page Navigation Crash (2026-04-12)

| Status | Resolved |
| :--- | :--- |
| **Date** | 2026-04-12 |
| **Severity** | 🚨 Critical (Runtime Crash) |
| **Root Cause** | TTS Signature Mismatch + Lack of NaN validation |

## 1. Symptom
Users on the Dashboard clicking "Bắt đầu học ngay" (Start session) were redirected to `/study` but met with a permanent white screen/crash.

## 2. Root Cause Analysis
The crash was caused by two compounding factors:

1.  **Type Signature Mismatch (AuthContext.tsx):** 
    The `setTtsConfig` function in `lib/tts.ts` expects two separate parameters: `voiceURI` and `rate`. 
    The `AuthContext` was previously updated with a call that passed parameters incorrectly (likely as an object or misaligned order), resulting in `rate` receiving `undefined`.
    
2.  **Lack of Defensive Validation (lib/tts.ts):**
    When `setTtsConfig` received an invalid `rate`, it stored it as `NaN`. 
    The `speak()` function then assigned `utterance.rate = NaN`. 
    In the Web Speech API, Chromium-based browsers (used in Electron/Vite dev) throw a fatal error if `speechSynthesis.speak()` is called with a non-finite rate. This crash is not caught by traditional React Error Boundaries if it happens during component mount logic, unmounting the entire page.

## 3. Corrective Actions

### A. Code Fixes
- **AuthContext.tsx**: Corrected the `setTtsConfig` call to explicitly use `(profile.tts_voice || null, profile.tts_rate ?? 0.85)`.
- **lib/tts.ts**: 
    - Added `isNaN` validation in `setTtsConfig`.
    - Added a safety fallback in `speak()` to default to `0.85` if any calculation results in an invalid number.
    - Simplified the module by removing unused internal tracking state (`currentUtterance`).

### B. Build Stability
- Performed a full project cleanup using `tsc --noEmit`.
- Resolved all remaining TypeScript errors to prevent latent bugs from hidden type mismatches.
- Result: **100% clean build**.

## 4. Prevention for Future
- **Rule**: Never pass data from database `profile` (which may be null/corrupted) directly into Web APIs without local validation/defaults.
- **Protocol**: Always check `isNaN()` when dealing with user-adjustable sliders/rates.
- **Continuity**: This incident is recorded in `.cm/CONTINUITY.md` under Mistakes & Learnings.
