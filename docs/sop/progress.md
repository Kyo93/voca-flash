---
title: "Progress & Analytics"
description: "Track your learning progress with streaks, forecasts, and memory health in VocaFlash"
keywords: "voca-flash, progress, analytics, streak, retention, memory health, forecast"
robots: "index, follow"
---

# Progress & Analytics

> **Quick Reference**
> - **Who**: Learner
> - **Where**: Sidebar → Progress (chart icon)
> - **Time**: ~2 minutes to review
> - **Prerequisites**: At least a few study sessions completed

The Progress page gives you a bird's-eye view of your learning journey. Use it to understand your retention rate, spot weak areas, and forecast your upcoming workload.

See also: [Mastery Vault](./mastery-vault.md) · [Study Session](./study-session.md)

## Page Sections

### Memory Health Card

Shows your current vocabulary health at a glance:

| Metric | Description |
|--------|-------------|
| **Learning** | Words in active SRS queue (stability < 21 days) |
| **New today** | Words studied for the first time today |
| **Mastered** | Words with stability ≥ 21 days |
| **Mastered today** | Words that reached mastery today |
| **Due** | Words overdue for review right now |
| **Weak** | Words with 1+ lapses (forgotten before) |
| **Orphaned** | Words removed from topics but still tracked |

### Retention Rate

The **retention gauge** shows what percentage of your reviews you answer correctly. Target: 90% (matches the default FSRS retention goal).

| Rate | Interpretation |
|------|---------------|
| ≥ 90% | Optimal — your SRS schedule is working |
| 80–89% | Good — slight over-scheduling |
| < 80% | Too many lapses — reduce daily target or lower SRS intensity |

Source: `src/components/progress/RetentionMetric.tsx`

### Streak & Badges

- **Current streak**: Consecutive days with at least one study session
- **Longest streak**: Your all-time record
- **Badge gallery**: Milestones earned (e.g., "7-day streak", "100 words mastered")

### Activity Heatmap

A GitHub-style heatmap showing study activity over the past 12 months. Each cell = one day; darker = more words studied.

<!-- Screenshot: HabitHeatmap with activity grid -->

### FSRS Distribution (Memory Bins)

A bar chart grouping all your words by memory stability range:
- **Fresh** (< 3 days): Still learning
- **Stable** (3–21 days): Building strength
- **Rooted** (21–90 days): Long-term memory
- **Deep** (> 90 days): Deeply embedded

### Roadmap Progress

Progress bars for each roadmap you've enrolled in, showing:
- Total words in roadmap
- Words mastered
- Completion percentage

### Workload Forecast

A 30-day forecast chart showing how many words will come due for review each day. Use this to plan your study schedule.

:::tip Manage Workload
If the forecast shows a spike in upcoming days, do an extra review session today to distribute the load.
:::

## Step-by-Step Guide

### Step 1: Open Progress Page

1. Click the **Progress** icon in the sidebar (chart icon)
2. The page loads automatically with your latest data

### Step 2: Check Memory Health

1. Look at the **Memory Health** card at the top
2. If **Due** > 20: prioritize [Review Arena](./review-arena.md) before studying new words
3. If **Weak** > 10: consider lowering SRS intensity in [Settings](./settings.md)

### Step 3: Review Your Streaks

1. Check your current streak in the **Streak** section
2. If streak = 0: you missed a day — study anything today to restart

:::info Streak Reset Time
The streak day boundary is at **4:00 AM** local time (`src/lib/constants.ts:59`). Study before 4 AM counts for the previous calendar day.
:::

### Step 4: Plan with the Forecast

1. Scroll to the **Workload Forecast** chart
2. Identify upcoming spikes (days with many words due)
3. Study extra on low-workload days to prevent pile-ups

## Troubleshooting

<details>
<summary>🔴 Streak shows 0 but I studied yesterday</summary>

**Cause:** The streak boundary is at 4 AM, not midnight. If you studied just after 4 AM and then nothing before 4 AM the next day, the streak breaks.

**Solution:** Aim to study at a consistent time well before 4 AM or in the evening.

</details>

<details>
<summary>🔴 Retention rate shows 0%</summary>

**Cause:** No reviews completed yet, or all recent reviews were "Again" ratings.

**Solution:** Complete at least one review session in [Review Arena](./review-arena.md). Ratings are required to calculate retention.

</details>

## Related

- [Review Arena](./review-arena.md) — work on overdue cards
- [Mastery Vault](./mastery-vault.md) — browse weak words
- [Settings — SRS Intensity](./settings.md)
