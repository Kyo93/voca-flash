/**
 * Bug: "Từ đã học hôm nay" hiển thị khác nhau giữa Dashboard và Progress page.
 *
 * Root cause:
 *   - Dashboard reads `initialData.health.new_today` — count of NEW SRS records
 *     since 4am Asia/Ho_Chi_Minh boundary (correct semantic).
 *   - Progress page used `getWordsToday(review_activity)` — count of REVIEW
 *     ACTIONS bucketed by UTC date (wrong: counts re-reviews of old words,
 *     and uses UTC instead of VN day boundary).
 *
 * Fix: Progress page must use the same source-of-truth as Dashboard
 * (`initialData.health.new_today`) for the "+N hôm nay" badge.
 */
import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { BrowserRouter } from 'react-router-dom'
import ProgressPage from '../../src/pages/ProgressPage'
import i18n from '../../src/i18n'
import { useAnalytics } from '../../src/hooks/useAnalytics'
import { useAuth } from '../../src/contexts/AuthContext'

vi.mock('../../src/hooks/useAnalytics')
vi.mock('../../src/contexts/AuthContext')

const baseAnalytics = {
  retention_rate: 0.85,
  // review_activity has 10 actions today (UTC) — old behaviour would show "+10"
  review_activity: [
    { date: new Date().toISOString().split('T')[0], reviews: 10, duration_ms: 5000 },
  ],
  weak_words: [],
  total_time_ms: 0,
  mastered_count: 0,
  mastery_distribution: { new: 9, learning: 0, review: 0, relearning: 0 },
  workload_forecast: [],
  heatmap_data: [],
  streak_days: 3,
  topic_stats: [],
  learning_velocity: { avg_new_per_day: 0, avg_reviews_per_day: 0 },
}

describe('Progress page "hôm nay" badge — consistent with Dashboard', () => {
  test('shows new_today from health (NOT review_activity count)', () => {
    vi.mocked(useAnalytics).mockReturnValue({
      data: baseAnalytics as any,
      isLoading: false,
      error: null,
    })
    // Dashboard health.new_today = 0 (no new SRS records today, post-4am VN)
    vi.mocked(useAuth).mockReturnValue({
      initialData: {
        global_review_count: 0,
        health: { new_today: 0 },
      } as any,
    } as any)

    render(
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <ProgressPage />
        </BrowserRouter>
      </I18nextProvider>
    )

    // The "+10 hôm nay" badge must NOT appear (review_activity should not drive it)
    expect(screen.queryByText(/\+10\s*hôm nay/i)).toBeNull()
  })

  test('shows "+N hôm nay" badge using health.new_today when > 0', () => {
    vi.mocked(useAnalytics).mockReturnValue({
      data: baseAnalytics as any,
      isLoading: false,
      error: null,
    })
    vi.mocked(useAuth).mockReturnValue({
      initialData: {
        global_review_count: 0,
        health: { new_today: 7 },
      } as any,
    } as any)

    render(
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <ProgressPage />
        </BrowserRouter>
      </I18nextProvider>
    )

    expect(screen.getByText(/\+7\s*hôm nay/i)).toBeDefined()
  })
})
