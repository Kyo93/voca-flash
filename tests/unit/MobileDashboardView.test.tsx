// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import MobileDashboardView from '../../src/components/dashboard/MobileDashboardView'
import type { CharacterCollectionView } from '../../src/lib/characters'
import type { Topic, UserProfile, InitialAppData } from '../../src/lib/types'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => {
      const labels: Record<string, string> = {
        'home.mobile.todayLabel': 'Today focus',
        'home.mobile.reviewTitle': 'Review due now',
        'home.mobile.reviewDesc': `${values?.count ?? 0} words need active recall`,
        'home.mobile.reviewDueToday': `${values?.count ?? 0} words due today`,
        'home.mobile.reviewCta': 'Review now',
        'home.mobile.reviewShortCta': 'Review',
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
        'home.mobile.greetingName': `Hi ${values?.name ?? ''}`,
        'home.readyToday': 'Ready today',
        'home.wordsDue': `${values?.count ?? 0} words due`,
        'home.reviewNow': 'Review now',
        'home.mobile.retentionExcellent': 'Excellent',
        'home.mobile.retentionGood': 'Good',
        'home.mobile.retentionNeedsWork': 'Needs work',
        'home.mobile.forecastToday': 'Today',
        'home.mobile.forecastTomorrow': 'Tomorrow',
        'home.mobile.forecastPlus': `+${values?.count ?? 0}`,
        'home.mobile.quickStudy': 'Study for 5 minutes',
        'home.mobile.quickStudyCta': '5 min',
        'home.mobile.nextStep': 'Next',
        'home.mobile.nextStepHint': 'One short session keeps the rhythm.',
        'home.activeRecall': 'Active recall',
        'home.tracking': 'Tracking',
        'home.suggestion': 'Suggestion',
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

const collection = {
  totalXp: 120,
  spentXp: 0,
  availableXp: 120,
  selectedCharacter: {
    id: 'seedling_scholar',
    costXp: 0,
    rarity: 'starter',
    nameKey: 'characters.items.seedling_scholar.name',
    descriptionKey: 'characters.items.seedling_scholar.description',
    poseLabelKey: 'characters.items.seedling_scholar.pose',
    icon: 'school',
    swatchClass: 'from-secondary-container to-secondary',
    evolutionStages: [],
  },
  items: [
    {
      character: {
        id: 'seedling_scholar',
        costXp: 0,
        rarity: 'starter',
        nameKey: 'characters.items.seedling_scholar.name',
        descriptionKey: 'characters.items.seedling_scholar.description',
        poseLabelKey: 'characters.items.seedling_scholar.pose',
        icon: 'school',
        swatchClass: 'from-secondary-container to-secondary',
        evolutionStages: [],
      },
      currentStage: 1,
      currentStageDefinition: {
        stage: 1,
        costXp: 0,
        nameKey: 'characters.items.seedling_scholar.stages.1.name',
        descriptionKey: 'characters.items.seedling_scholar.stages.1.description',
        poseLabelKey: 'characters.items.seedling_scholar.stages.1.pose',
        icon: 'school',
        swatchClass: 'from-secondary-container to-secondary',
      },
      nextStageDefinition: null,
      unlocked: true,
      affordable: false,
      selected: true,
      canEvolve: false,
      maxed: false,
      remainingXpForEvolution: 0,
    },
  ],
} as CharacterCollectionView

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
        collection={collection}
        {...overrides}
      />
    </MemoryRouter>,
  )
}

describe('MobileDashboardView', () => {
  it('prioritizes due review as the Today hero action', () => {
    const { container } = renderMobileDashboard()

    const hero = container.querySelector('[data-mobile-today-hero="review"]')
    const cta = screen.getByRole('link', { name: 'Review' })

    expect(hero).toBeTruthy()
    expect(cta.getAttribute('href')).toBe('/review')
    expect(screen.getByText('7 words due today')).toBeTruthy()
    expect(screen.queryByText('7 words need active recall')).toBeNull()
    expect(screen.getByText('6 new words today')).toBeTruthy()
    expect(container.querySelector('[data-mobile-daily-progress="60"]')).toBeTruthy()
    expect(container.querySelector('[data-mobile-forecast-timeline="true"]')).toBeTruthy()
    expect(container.querySelector('[data-mobile-motivation-strip="true"]')).toBeTruthy()
    expect(screen.getByText('Hi Ocean')).toBeTruthy()
    expect(screen.queryByText('Scholar note')).toBeNull()
    expect(screen.getByText('“Small steps compound.”')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Study for 5 minutes' }).getAttribute('href')).toBe('/study?topic=academic-basics&topicId=topic-1&roadmapId=roadmap-1')
    expect(screen.getByTestId('mobile-mascot')).toBeTruthy()
    expect(screen.getByText(/Excellent/)).toBeTruthy()
    expect(screen.getByText('Today')).toBeTruthy()
    expect(screen.getByText('Tomorrow')).toBeTruthy()
    expect(container.querySelector('[data-mobile-next-step="true"]')).toBeTruthy()
    expect(screen.getByText('Next')).toBeTruthy()
    expect(screen.getByText('5 min')).toBeTruthy()
  })

  it('falls back to the resume topic when nothing is due', () => {
    const { container } = renderMobileDashboard({ reviewCount: 0 })

    const hero = container.querySelector('[data-mobile-today-hero="learn"]')
    const cta = screen.getByRole('link', { name: 'Study next' })

    expect(hero).toBeTruthy()
    expect(screen.getAllByText('Academic Basics').length).toBeGreaterThan(0)
    expect(cta.getAttribute('href')).toBe('/study?topic=academic-basics&topicId=topic-1&roadmapId=roadmap-1')
  })

  it('does not promote a fresh fallback topic as the next step', () => {
    renderMobileDashboard({
      reviewCount: 0,
      isResume: false,
    })

    expect(screen.getByText('Start your roadmap')).toBeTruthy()
    expect(screen.getAllByRole('link', { name: 'Browse library' }).at(-1)?.getAttribute('href')).toBe('/library')
  })

  it('sends new learners to the library when no topic is available', () => {
    const { container } = renderMobileDashboard({
      reviewCount: 0,
      primaryTopic: null,
      isResume: false,
    })

    const hero = container.querySelector('[data-mobile-today-hero="start"]')
    const cta = screen.getAllByRole('link', { name: 'Browse library' })[0]

    expect(hero).toBeTruthy()
    expect(cta.getAttribute('href')).toBe('/library')
  })
})
