// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import MobileDashboardView from '../../src/components/dashboard/MobileDashboardView'
import type { Topic, UserProfile, InitialAppData } from '../../src/lib/types'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => {
      const labels: Record<string, string> = {
        'home.mobile.todayLabel': 'Today focus',
        'home.mobile.reviewTitle': 'Review due now',
        'home.mobile.reviewDesc': `${values?.count ?? 0} words need active recall`,
        'home.mobile.reviewCta': 'Review now',
        'home.mobile.continueTitle': 'Continue learning',
        'home.mobile.continueDesc': 'Pick up the topic you started',
        'home.mobile.continueCta': 'Study next',
        'home.mobile.startTitle': 'Start your roadmap',
        'home.mobile.startDesc': 'Choose a path and begin with a small win',
        'home.mobile.startCta': 'Browse library',
        'home.mobile.missionHint': `${values?.count ?? 0} new words today`,
        'home.mobile.memoryHint': 'Memory health',
        'home.mobile.forecastHint': 'Due soon',
        'home.mobile.quoteTitle': 'Scholar note',
        'home.dailyMission': 'Daily mission',
        'home.retention': 'Retention',
        'home.forecast': 'Forecast',
        'common.no_data': 'No data yet',
        'common.days': 'days',
      }
      return labels[key] ?? key
    },
  }),
}))

vi.mock('../../src/components/characters/CharacterReactionAvatar', () => ({
  default: () => <div data-testid="mobile-mascot">Mascot</div>,
}))

const topic: Topic = {
  id: 'topic-1',
  roadmap_id: 'roadmap-1',
  name: 'Academic Basics',
  slug: 'academic-basics',
  description: 'Core academic words',
  image_url: null,
  icon: 'school',
  color: 'primary',
  sort_order: 1,
  created_at: '',
  updated_at: '',
}

const profile = {
  display_name: 'Ocean',
} as UserProfile

const initialData = {
  health: {
    retention_rate: 0.82,
    avg_stability: 4.2,
    new_today: 6,
    due_today: 7,
    mastered_today: 1,
    stability_distribution: { fresh: 1, stable: 2, rooted: 3 },
    forecast: [7, 3, 0, 2, 1],
  },
} as InitialAppData

function renderMobileDashboard(overrides: Partial<React.ComponentProps<typeof MobileDashboardView>> = {}) {
  return render(
    <MemoryRouter>
      <MobileDashboardView
        profile={profile}
        initialData={initialData}
        reviewCount={7}
        newTodayTotal={6}
        dailyGoal={10}
        primaryTopic={topic}
        isResume
        currentQuote="Small steps compound."
        collection={null}
        {...overrides}
      />
    </MemoryRouter>,
  )
}

describe('MobileDashboardView', () => {
  it('prioritizes due review as the Today hero action', () => {
    const { container } = renderMobileDashboard()

    const hero = container.querySelector('[data-mobile-today-hero="review"]')
    const cta = screen.getByRole('link', { name: 'Review now' })

    expect(hero).toBeTruthy()
    expect(cta.getAttribute('href')).toBe('/review')
    expect(screen.getByText('7 words need active recall')).toBeTruthy()
    expect(screen.getByText('6 new words today')).toBeTruthy()
    expect(container.querySelector('[data-mobile-daily-progress="60"]')).toBeTruthy()
  })

  it('falls back to the resume topic when nothing is due', () => {
    const { container } = renderMobileDashboard({ reviewCount: 0 })

    const hero = container.querySelector('[data-mobile-today-hero="learn"]')
    const cta = screen.getByRole('link', { name: 'Study next' })

    expect(hero).toBeTruthy()
    expect(screen.getByText('Academic Basics')).toBeTruthy()
    expect(cta.getAttribute('href')).toBe('/study?topic=academic-basics&topicId=topic-1&roadmapId=roadmap-1')
  })

  it('sends new learners to the library when no topic is available', () => {
    const { container } = renderMobileDashboard({
      reviewCount: 0,
      primaryTopic: null,
      isResume: false,
    })

    const hero = container.querySelector('[data-mobile-today-hero="start"]')
    const cta = screen.getByRole('link', { name: 'Browse library' })

    expect(hero).toBeTruthy()
    expect(cta.getAttribute('href')).toBe('/library')
  })
})
