// @vitest-environment jsdom

import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useOutletContext } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import MobileAppLayout from '../../src/components/mobile/MobileAppLayout'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      'app.name': 'VocaFlash',
      'mobileNav.label': 'Primary navigation',
      'mobileNav.today': 'Today',
      'mobileNav.learn': 'Learn',
      'mobileNav.review': 'Review',
      'mobileNav.notebook': 'Notebook',
      'mobileNav.profile': 'Profile',
      'nav.progress': 'Progress',
      'nav.achievements': 'Achievements',
      'nav.characters': 'Characters',
      'nav.settings': 'Settings',
      'nav.methodology': 'Methodology',
      'nav.searchPlaceholder': 'Search',
    }[key] ?? key),
  }),
}))

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'ocean@example.com' },
    initialData: { global_review_count: 7 },
    activeRoadmapSlug: 'academic-english',
  }),
}))

vi.mock('../../src/components/PageLoader', () => ({
  default: () => <div>Loading</div>,
}))

function renderMobileShell(initialPath = '/dashboard') {
  function RoadmapProbe() {
    const { searchQuery } = useOutletContext<{ searchQuery: string }>()
    return <div>query:{searchQuery}</div>
  }

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<MobileAppLayout />}>
          <Route path="/dashboard" element={<div>Today content</div>} />
          <Route path="/library" element={<div>Library content</div>} />
          <Route path="/library/:roadmapSlug" element={<RoadmapProbe />} />
          <Route path="/review" element={<div>Review content</div>} />
          <Route path="/mastery" element={<div>Notebook content</div>} />
          <Route path="/progress" element={<div>Progress content</div>} />
          <Route path="/settings" element={<div>Settings content</div>} />
          <Route path="/study" element={<div>Study content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('MobileAppLayout', () => {
  it('renders a five-tab Android shell with a review badge', () => {
    const { container } = renderMobileShell('/dashboard')

    const nav = screen.getByRole('navigation', { name: 'Primary navigation' })
    expect(container.querySelector('[data-mobile-app-shell="true"]')).toBeTruthy()
    expect(container.querySelector('[data-mobile-bottom-nav="true"]')).toBeTruthy()

    expect(within(nav).getByRole('link', { name: 'Today' }).getAttribute('aria-current')).toBe('page')
    expect(within(nav).getByRole('link', { name: 'Learn' }).getAttribute('href')).toBe('/library/academic-english')
    expect(within(nav).getByRole('link', { name: 'Review' })).toBeTruthy()
    expect(within(nav).getByRole('link', { name: 'Notebook' })).toBeTruthy()
    expect(within(nav).getByRole('link', { name: 'Profile' })).toBeTruthy()
    expect(nav.textContent).toContain('7')
  })

  it('groups roadmap routes under the Learn tab', () => {
    renderMobileShell('/library/academic-english')

    expect(screen.getByRole('link', { name: 'Learn' }).getAttribute('aria-current')).toBe('page')
  })

  it('keeps roadmap search available from the mobile header', () => {
    renderMobileShell('/library/academic-english')

    const input = screen.getByPlaceholderText('Search')
    fireEvent.change(input, { target: { value: 'anchor' } })

    expect(screen.getByText('query:anchor')).toBeTruthy()
  })

  it('hides mobile chrome during full-screen study sessions', () => {
    const { container } = renderMobileShell('/study')

    expect(screen.getByText('Study content')).toBeTruthy()
    expect(container.querySelector('[data-mobile-bottom-nav="true"]')).toBeNull()
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })).toBeNull()
  })
})
