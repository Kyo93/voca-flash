# Implementation Plan - Fixing Dashboard Forecast Data

Fixing the "Workload Forecast" component on the Dashboard which currently shows empty/flat data and incorrect hardcoded day labels.

## User Review Required

> [!IMPORTANT]
> The day labels will now be dynamic based on the user's current date (e.g., "Hôm nay", "T3", "T4"...).
> I will also update the Supabase RPC `get_initial_app_data_v2` to use Vietnam timezone (`Asia/Ho_Chi_Minh`) for forecast generation to ensure data consistency.

## Proposed Changes

### Database Layer (Supabase)

#### [MODIFY] `supabase/migrations/028_get_initial_app_data_v2.sql`
- Update the forecast query to use `(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE` instead of `CURRENT_DATE`.
- Ensure the 7-day series aligns with Vietnam's calendar day.

---

### Component Layer (Frontend)

#### [MODIFY] [ForecastMiniChart.tsx](file:///c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/components/dashboard/ForecastMiniChart.tsx)
- Use `date-fns` to generate dynamic day labels (e.g., "Today", "Mon", "Tue").
- Increase bar visibility by changing `bg-white/10` to `bg-white/25`.
- Add `h-full` to the bar container to ensure percentage-based heights work reliably.
- Add a subtle border or dashed line when a day has zero reviews to indicate the slot is active but empty.

## Verification Plan

### Automated Tests
- Run `vitest tests/unit/forecast-chart.test.tsx` (updated with dynamic label checks).
- Run `npm run build` to ensure no type errors.

### Manual Verification
- Check the Dashboard to see if "Workload Forecast" now shows non-zero bars (if words are scheduled) and correct day labels.
- Verify that hovering over the card still works and highlights the bars.
