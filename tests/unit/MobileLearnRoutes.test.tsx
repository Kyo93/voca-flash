// @vitest-environment jsdom

import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useOutletContext, useParams } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import LibraryPage from '../../src/pages/LibraryPage'
import RoadmapTopicsPage from '../../src/pages/RoadmapTopicsPage'
import { useLibraryRoadmaps } from '../../src/hooks/useLibraryRoadmaps'
import { useMediaQuery } from '../../src/hooks/useMediaQuery'
import { useRoadmapTopics } from '../../src/hooks/useRoadmapTopics'
import type { Roadmap, Topic } from '../../src/lib/types'

vi.mock('../../src/hooks/useLibraryRoadmaps')
vi.mock('../../src/hooks/useMediaQuery')
vi.mock('../../src/hooks/useRoadmapTopics')

vi.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => {
      const labels: Record<string, string> = {
        'common.back': 'Back',
        'library.card.completed': 'Completed',
        'library.card.defaultDesc': 'A structured learning path.',
        'library.card.resume': 'Resume',
        'library.card.start': 'Start',
        'library.filters.All': 'All',
        'library.filters.Kids': 'Kids',
        'library.filters.Casual': 'Casual',
        'library.filters.Professional': 'Work',
        'library.filters.Academic': 'Academic',
        'library.mobile.availablePaths': `${values?.count ?? 0} paths`,
        'library.mobile.completedHint': 'Path completed',
        'library.mobile.emptyDesc': 'Choose another category.',
        'library.mobile.emptyTitle': 'No paths here yet',
        'library.mobile.masteredLabel': 'mastered',
        'library.mobile.progressLabel': 'Progress',
        'library.mobile.resumeBadge': 'In progress',
        'library.mobile.subtitle': 'Choose a route and keep the next lesson close.',
        'library.mobile.title': 'Learn',
        'roadmap.card.defaultTopicDesc': 'Practice this topic.',
        'roadmap.card.upNext': 'Up next',
        'roadmapDetail.mobile.emptyDesc': 'Try a different search.',
        'roadmapDetail.mobile.emptyTitle': 'No topics found',
        'roadmapDetail.mobile.completedStep': 'Completed',
        'roadmapDetail.mobile.chapterTitle': 'Topics in this path',
        'roadmapDetail.mobile.changePath': 'Change path',
        'roadmapDetail.mobile.closeTopicSearch': 'Close topic search',
        'roadmapDetail.mobile.continueTitle': 'Continue learning',
        'roadmapDetail.mobile.continuePath': 'Continue learning',
        'roadmapDetail.mobile.collapseTopic': 'Collapse topic details',
        'roadmapDetail.mobile.currentStep': 'In progress',
        'roadmapDetail.mobile.expandTopic': 'Expand topic details',
        'roadmapDetail.mobile.focusTitle': 'Next step',
        'roadmapDetail.mobile.learnedLabel': 'learned',
        'roadmapDetail.mobile.lockedStep': 'Not started',
        'roadmapDetail.mobile.masteredLabel': 'mastered',
        'roadmapDetail.mobile.notStartedHint': 'Not started',
        'roadmapDetail.mobile.openTopicSearch': 'Open topic search',
        'roadmapDetail.mobile.pathLabel': 'Learning path',
        'roadmapDetail.mobile.progressTitle': 'Roadmap progress',
        'roadmapDetail.mobile.quickSession': '5 min',
        'roadmapDetail.mobile.remainingWords': `${values?.count ?? 0} left`,
        'roadmapDetail.mobile.startTopic': 'Start topic',
        'roadmapDetail.mobile.summaryHint': `${values?.learned ?? 0}/${values?.total ?? 0} words learned`,
        'roadmapDetail.mobile.timelineTitle': 'Learning checkpoints',
        'roadmapDetail.mobile.topicSearchPlaceholder': 'Search topics...',
        'roadmapDetail.mobile.searchAction': 'Search',
        'roadmapDetail.mobile.topicProgress': 'Topic progress',
        'roadmapDetail.mobile.totalLabel': 'words',
        'topic.action.resume': 'Resume topic',
        'topic.action.start': 'Start topic',
        'topics.wordsCount': `${values?.count ?? 0} words`,
      }
      return labels[key] ?? key
    },
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useOutletContext: vi.fn(),
    useParams: vi.fn(),
  }
})

const academicRoadmap: Roadmap = {
  id: 'roadmap-1',
  name: 'Academic Core',
  slug: 'academic-core',
  description: 'Read papers with less friction.',
  image_url: '/images/hero-3d.png',
  is_active: true,
  created_at: '',
  updated_at: '',
}

const travelRoadmap: Roadmap = {
  id: 'roadmap-2',
  name: 'Travel English',
  slug: 'travel-english',
  description: null,
  image_url: null,
  is_active: true,
  created_at: '',
  updated_at: '',
}

const introTopic: Topic = {
  id: 'topic-1',
  roadmap_id: 'roadmap-1',
  name: 'Research Basics',
  slug: 'research-basics',
  description: 'Read abstracts and methods.',
  image_url: null,
  icon: 'history_edu',
  color: 'primary',
  sort_order: 1,
  created_at: '',
  updated_at: '',
}

const nextTopic: Topic = {
  id: 'topic-2',
  roadmap_id: 'roadmap-1',
  name: 'Argument Flow',
  slug: 'argument-flow',
  description: 'Track claims and evidence.',
  image_url: null,
  icon: 'route',
  color: 'secondary',
  sort_order: 2,
  created_at: '',
  updated_at: '',
}

function arrangeMobile() {
  vi.mocked(useMediaQuery).mockReturnValue(true)
}

describe('mobile Learn routes', () => {
  it('renders Library as a mobile roadmap feed with resume progress', () => {
    arrangeMobile()
    vi.mocked(useLibraryRoadmaps).mockReturnValue({
      roadmaps: [academicRoadmap, travelRoadmap],
      roadmapStats: {
        'roadmap-1': { total: 80, mastered: 24 },
        'roadmap-2': { total: 20, mastered: 20 },
      },
      learningStates: new Map([
        ['roadmap-1', {
          id: 'resume-1',
          user_id: 'user-1',
          roadmap_id: 'roadmap-1',
          last_topic_id: 'topic-1',
          last_accessed_at: '2026-05-20T08:00:00.000Z',
        }],
      ]),
      loading: false,
      activeFilter: 'All',
      setActiveFilter: vi.fn(),
      getCardSpecs: () => ({
        badge: 'Academic',
        badgeClass: 'bg-secondary-fixed text-on-secondary-fixed-variant',
        btnClass: 'bg-secondary text-on-secondary',
        image: '/images/hero-3d.png',
      }),
    })

    const { container } = render(
      <MemoryRouter>
        <LibraryPage />
      </MemoryRouter>,
    )

    expect(container.querySelector('[data-mobile-learn]')).toBeTruthy()
    expect(container.querySelector('[data-mobile-roadmap-card="roadmap-1"]')).toBeTruthy()
    expect(screen.getByText('In progress')).toBeTruthy()
    expect(screen.getByText('30%')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Academic Core/i }).getAttribute('href')).toBe('/library/academic-core')
  })

  it('renders roadmap topics as a mobile learning path with the in-progress topic focused', () => {
    arrangeMobile()
    vi.mocked(useParams).mockReturnValue({ roadmapSlug: 'academic-core' })
    const setSearchQuery = vi.fn()
    vi.mocked(useOutletContext).mockReturnValue({ searchQuery: '', setSearchQuery })
    vi.mocked(useRoadmapTopics).mockReturnValue({
      roadmap: academicRoadmap,
      topics: [introTopic, nextTopic],
      stats: { total: 80, learned: 20, mastered: 8 },
      loading: false,
      featuredId: 'topic-1',
      upNextId: 'topic-2',
      getTopicStats: (topicId: string) => topicId === 'topic-2'
        ? { total: 30, learned: 0, mastered: 0, percent: 0 }
        : { total: 50, learned: 20, mastered: 8, percent: 40 },
    })

    const { container } = render(
      <MemoryRouter>
        <RoadmapTopicsPage />
      </MemoryRouter>,
    )

    const hero = container.querySelector('[data-mobile-topic-hero="topic-1"]')
    const stickyCta = container.querySelector('[data-mobile-roadmap-sticky-cta]')
    const chapterRows = container.querySelectorAll('[data-mobile-topic-chapter-row="true"]')

    expect(container.querySelector('[data-mobile-roadmap-detail]')).toBeTruthy()
    expect(hero).toBeTruthy()
    expect(within(hero as HTMLElement).getByText('Research Basics')).toBeTruthy()
    expect(within(hero as HTMLElement).getByRole('link', { name: /Resume topic/i }).getAttribute('href')).toBe(
      '/study?topic=research-basics&topicId=topic-1&roadmapId=roadmap-1',
    )
    expect(screen.getByText('Topics in this path')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Change/i }).getAttribute('href')).toBe('/library')
    expect(chapterRows).toHaveLength(2)
    expect(stickyCta).toBeFalsy()
    expect(screen.queryByPlaceholderText('Search topics...')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Open topic search' }))
    fireEvent.change(screen.getByPlaceholderText('Search topics...'), { target: { value: 'arg' } })
    expect(setSearchQuery).toHaveBeenCalledWith('arg')

    fireEvent.click(within(chapterRows[1] as HTMLElement).getByRole('button'))

    expect(within(chapterRows[1] as HTMLElement).getByText('Track claims and evidence.')).toBeTruthy()
    expect(within(chapterRows[1] as HTMLElement).getByRole('link', { name: /Start topic/i }).getAttribute('href')).toBe(
      '/study?topic=argument-flow&topicId=topic-2&roadmapId=roadmap-1',
    )
  })
})
