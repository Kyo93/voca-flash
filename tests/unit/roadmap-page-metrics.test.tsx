import { render, screen } from '@testing-library/react'
import { expect, test, vi, describe } from 'vitest'
import RoadmapTopicsPage from '../../src/pages/RoadmapTopicsPage'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../src/i18n'
import { useRoadmapTopics } from '../../src/hooks/useRoadmapTopics'
import { useParams, Link, useOutletContext } from 'react-router-dom'

// Mock the hook
vi.mock('../../src/hooks/useRoadmapTopics')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: vi.fn(),
    useOutletContext: vi.fn()
  }
})

const mockRoadmap = {
  id: 'r1',
  slug: 'test-roadmap',
  name: 'Test Roadmap',
  description: 'Test Description'
}

const mockStats = {
  total: 100,
  learned: 20,
  mastered: 5
}

import { MemoryRouter } from 'react-router-dom'

describe('RoadmapTopicsPage Metrics', () => {
  test('renders all 3 metrics: total, learned, and mastered', () => {
    vi.mocked(useParams).mockReturnValue({ roadmapSlug: 'test-roadmap' })
    vi.mocked(useOutletContext).mockReturnValue({ searchQuery: '' })
    vi.mocked(useRoadmapTopics).mockReturnValue({
      roadmap: mockRoadmap as any,
      topics: [],
      stats: mockStats as any,
      loading: false,
      featuredId: null,
      upNextId: null,
      getTopicStats: () => ({ total: 0, learned: 0, percent: 0 })
    })

    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <RoadmapTopicsPage />
        </I18nextProvider>
      </MemoryRouter>
    )

    // Check for "100", "20", and "5"
    expect(screen.getByText('100')).toBeDefined()
    expect(screen.getByText('20')).toBeDefined()
    expect(screen.getByText('5')).toBeDefined()
    
    // Check for labels (simplified)
    // "Tổng số từ" (Total)
    // "Từ đã học" (Learned) - New label I will add/fix
    // "Từ đã thuộc" (Mastered) - New label I will add/fix
  })
})
