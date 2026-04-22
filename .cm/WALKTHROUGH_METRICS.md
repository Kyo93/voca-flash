# Walkthrough - Fixed Dashboard Forecast Data

I have resolved the issue where the "Workload Forecast" component on the Dashboard was not displaying data correctly or showing incorrect labels.

## Changes Made

### 1. Timezone-Aware Backend
Updated the Supabase RPC `get_initial_app_data_v2` to use the `Asia/Ho_Chi_Minh` timezone when generating the 7-day forecast. This ensures that "Today" in the chart aligns with the user's actual calendar day in Vietnam.

### 2. Dynamic UI Labels
Replaced the hardcoded "T2-T6" labels with dynamic ones using `date-fns`. 
- The first bar now always shows **"H.Nay"** (Today).
- Subsequent bars show the correctly calculated day names (e.g., T3, T4, CN) based on the current date and locale.

### 3. Improved UI Visibility
- **Data Bars**: Increased opacity from `white/10` to `white/30` for better contrast against the sage green background.
- **Empty States**: Added a subtle dashed border for days with 0 reviews so the chart doesn't look completely empty even when there's no data.
- **Hover Detail**: Added a tooltip-style count that appears when hovering over a bar.
- **Layout Safety**: Added `h-full` and `min-h-[100px]` to ensure the chart always renders with consistent height.

## Verification Results

### Automated Tests
Ran 3 unit tests in `forecast-chart.test.tsx` covering:
- Correct 15% minimum height fallback.
- Dynamic label generation ("H.Nay").
- High-visibility bars for days with data.

**Result**: All tests passed.

### Build Verification
Ran `npm run build` to ensure no TypeScript or bundling regressions.

**Result**: Build successful.

---

# Walkthrough - Mastery vs. Learned Metrics Separation

I have implemented a clear separation between "Learned" (words seen) and "Mastered" (words remembered long-term) metrics on the Roadmap Topics page to provide more accurate progress tracking.

## Changes Made

### 1. Granular Stats Backend
- **Supabase RPC**: Updated `get_topic_completion_stats` to return both `learned_count` and `mastered_count`.
- **Logic**: 
  - `Learned`: Any word that exists in the user's SRS records for that topic.
  - `Mastered`: Words where the `mastered` flag is explicitly set to `true`.
  - `Percent`: Now accurately represents **Mastery %** (Mastered / Total).

### 2. Frontend State & UI Update
- **Hook Update**: Updated `useRoadmapTopics` and `fetchRoadmapStats` to handle the new 3-tier metric structure (Total, Learned, Mastered).
- **Roadmap Topics Page**: 
  - Redesigned the "Mastery Progress Board" to show three distinct columns.
  - Added new icons and translated labels for each metric.
  - Corrected the progress bar to reflect true mastery.

### 3. Translation & Type Safety
- **i18n**: Added `learnedWords` and `masteredWords` to `vi.json`.
- **TypeScript**: Updated `TopicCard` and hook interfaces to include `mastered` counts, ensuring full type safety across the roadmap feature.

## Verification Results

### Automated Tests
- Updated `roadmap-page-metrics.test.tsx` to verify that all three metrics (Total, Learned, Mastered) are rendered correctly with their respective mock values.
- **Result**: Tests passed.

### Manual Verification
- Verified that the "8 words" previously labeled as "Mastered" are now correctly labeled as "Learned", and a new "Mastered" metric (0) is shown correctly.
