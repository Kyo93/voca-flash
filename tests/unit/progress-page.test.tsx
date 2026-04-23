import { render, screen } from '@testing-library/react'
import { expect, test, vi, describe } from 'vitest'
import ProgressPage from '../../src/pages/ProgressPage'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../src/i18n'
import { useAnalytics } from '../../src/hooks/useAnalytics'
import { useAuth } from '../../src/contexts/AuthContext'
import { BrowserRouter } from 'react-router-dom'

// Mock the hooks
vi.mock('../../src/hooks/useAnalytics')
vi.mock('../../src/contexts/AuthContext')

const mockData = {
  retention_rate: 0.85,
  review_activity: [],
  weak_words: [],
  total_time_ms: 3600000,
  mastered_count: 42, // The new field we want to add
  mastery_distribution: {
    new: 100,
    learning: 50,
    review: 40,
    relearning: 10
  },
  workload_forecast: [],
  heatmap_data: [],
  streak_days: 7,
  topic_stats: [],
  learning_velocity: {
    avg_new_per_day: 5,
    avg_reviews_per_day: 20
  }
}

describe('ProgressPage Mastery Indicator', () => {
  test('renders the mastered words count if available', () => {
    vi.mocked(useAnalytics).mockReturnValue({
      data: mockData as any,
      isLoading: false,
      error: null
    })
    vi.mocked(useAuth).mockReturnValue({
      initialData: { global_review_count: 0 } as any
    } as any)

    render(
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <ProgressPage />
        </BrowserRouter>
      </I18nextProvider>
    )

    // Check if "42" and "Nhuần nhuyễn" (or similar) is present
    // Based on vi.json, progress.masteredWords is "Từ đã thuộc"
    expect(screen.getByText('42')).toBeDefined()
    expect(screen.getByText(/Nhuần nhuyễn|Đã thuộc/i)).toBeDefined()
  })

  test('renders words due badge when review count is > 0', () => {
    vi.mocked(useAnalytics).mockReturnValue({
      data: mockData as any,
      isLoading: false,
      error: null
    })
    
    vi.mocked(useAuth).mockReturnValue({
      initialData: { global_review_count: 15 } as any
    } as any)

    render(
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <ProgressPage />
        </BrowserRouter>
      </I18nextProvider>
    )

    // It should render the badge
    expect(screen.getByText(/15 từ đang chờ ôn tập/i)).toBeDefined()
  })
})
