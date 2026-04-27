// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MasteryHeader from '../../src/components/mastery/MasteryHeader'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === 'mastery.subtitle') return `${params?.count ?? 0} saved words`
      if (key === 'mastery.freeStudy') return `Study ${params?.count ?? 0}`
      if (key === 'mastery.notebook.open') return 'Open notebook'
      if (key === 'mastery.table.notebook') return 'Notebook'
      if (key === 'mastery.filters.flashReview') return 'Flash Review'
      if (key === 'mastery.filters.lexicalArchive') return 'Lexical Archive'
      if (key === 'mastery.title') return 'Vocabulary'
      if (key === 'nav.searchPlaceholder') return 'Search lessons or words'
      return key
    },
  }),
}))

function renderHeader(overrides: Partial<React.ComponentProps<typeof MasteryHeader>> = {}) {
  render(
    <MasteryHeader
      totalCount={27}
      loading={false}
      searchQuery=""
      setSearchQuery={() => {}}
      selectedIdsSize={0}
      onStartFreeStudy={() => {}}
      notebookCount={9}
      onOpenNotebook={() => {}}
      {...overrides}
    />,
  )
}

describe('MasteryHeader', () => {
  it('keeps notebook and flash review buttons compact and aligned with search', () => {
    renderHeader()

    const actions = screen.getByTestId('mastery-header-actions')
    const notebookButton = screen.getByRole('button', { name: 'Open notebook' })
    const flashButton = screen.getByRole('button', { name: 'Flash Review' })

    expect(actions.className).toContain('md:items-center')
    expect(actions.className).toContain('gap-3')
    expect(actions.className).not.toContain('translate-x')
    expect(actions.className).not.toContain('translate-y')
    expect(actions.className).not.toContain('w-[648px]')
    expect(actions.className).not.toContain('h-[68px]')

    expect(notebookButton.className).toContain('h-14')
    expect(notebookButton.className).toContain('min-w-[10rem]')
    expect(notebookButton.className).not.toContain('w-[953px]')
    expect(notebookButton.className).not.toContain('w-full')

    expect(flashButton.className).toContain('h-14')
    expect(flashButton.className).toContain('min-w-[10rem]')
    expect(flashButton.className).toContain('whitespace-nowrap')
    expect(flashButton.className).not.toContain('px-10')
  })
})
