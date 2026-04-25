// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DashboardMascotDock from '../../src/components/dashboard/DashboardMascotDock'
import { buildCharacterCollection, DEFAULT_CHARACTER_ID } from '../../src/lib/characters'
import { createEmptyRewardProgress, toRewardProgressView } from '../../src/lib/rewards'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

function createCollection(stage = 1) {
  return buildCharacterCollection({
    rewardProgress: toRewardProgressView({
      ...createEmptyRewardProgress('user-1'),
      totalXp: 500,
      spentXp: stage > 1 ? 120 : 0,
    }),
    unlockedCharacterIds: [DEFAULT_CHARACTER_ID],
    unlockedCharacterStates: [
      { characterId: DEFAULT_CHARACTER_ID, currentStage: stage, evolutionSpentXp: stage > 1 ? 120 : 0 },
    ],
    selectedCharacterId: DEFAULT_CHARACTER_ID,
  })
}

describe('DashboardMascotDock', () => {
  it('renders a large interactive mascot button anchored beside Dashboard content', () => {
    const { container } = render(<DashboardMascotDock collection={createCollection()} />)

    const button = screen.getByRole('button', { name: 'characters.actions.playReaction' })
    const dock = container.querySelector('[data-dashboard-mascot-dock="true"]')

    expect(button).toBeTruthy()
    expect(dock?.className).toContain('h-72')
    expect(dock?.className).toContain('w-72')
    expect(container.querySelector('.w-72.h-72')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'characters.actions.expandedView' })).toBeNull()
  })

  it('cycles click reactions and returns to idle when the clip ends', () => {
    let now = 1000
    const performanceNow = vi.spyOn(window.performance, 'now').mockImplementation(() => now)
    const { container } = render(<DashboardMascotDock collection={createCollection()} />)
    const button = screen.getByRole('button', { name: 'characters.actions.playReaction' })

    expect(container.querySelector('video')?.getAttribute('src')).toBe(
      '/character-assets/seedling_scholar/stage-1/idle.webm'
    )

    fireEvent.click(button)
    expect(container.querySelector('video')?.getAttribute('src')).toBe(
      '/character-assets/seedling_scholar/stage-1/correct.webm'
    )

    now = 1400
    fireEvent.click(button)
    expect(container.querySelector('video')?.getAttribute('src')).toBe(
      '/character-assets/seedling_scholar/stage-1/celebrate.webm'
    )

    const video = container.querySelector('video')
    if (!video) throw new Error('Expected video element')
    fireEvent.ended(video)

    expect(container.querySelector('video')?.getAttribute('src')).toBe(
      '/character-assets/seedling_scholar/stage-1/idle.webm'
    )
    performanceNow.mockRestore()
  })

  it('opens a PBR expanded character viewer on double click', () => {
    render(<DashboardMascotDock collection={createCollection()} />)

    fireEvent.doubleClick(screen.getByRole('button', { name: 'characters.actions.playReaction' }))

    expect(screen.getByRole('dialog', { name: 'characters.actions.expandedView' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'characters.actions.closeExpandedView' })).toBeTruthy()
    expect(document.querySelector('[data-dashboard-expanded-view="true"]')).toBeTruthy()
    expect(document.querySelector('[data-character-material-quality="pbr"]')).toBeTruthy()
  })

  it('renders the expanded viewer as a full-screen character-first portal without a white card', () => {
    render(<DashboardMascotDock collection={createCollection()} />)

    fireEvent.doubleClick(screen.getByRole('button', { name: 'characters.actions.playReaction' }))

    const overlay = document.querySelector('[data-dashboard-expanded-view="true"]')
    const stage = document.querySelector('[data-dashboard-expanded-stage="true"]')

    expect(overlay?.parentElement).toBe(document.body)
    expect(overlay?.className).toContain('fixed inset-0')
    expect(overlay?.className).toContain('z-[1000]')
    expect(overlay?.className).toContain('bg-on-surface')
    expect(stage?.className).not.toContain('bg-surface')
    expect(stage?.className).not.toContain('rounded-3xl')
  })

  it('opens the expanded viewer when two mascot clicks happen quickly', () => {
    let now = 1000
    const performanceNow = vi.spyOn(window.performance, 'now').mockImplementation(() => now)
    render(<DashboardMascotDock collection={createCollection()} />)

    const mascotButton = screen.getByRole('button', { name: 'characters.actions.playReaction' })
    fireEvent.click(mascotButton)
    now = 1120
    fireEvent.click(mascotButton)

    expect(screen.getByRole('dialog', { name: 'characters.actions.expandedView' })).toBeTruthy()
    performanceNow.mockRestore()
  })

  it('closes the expanded character viewer with Escape', () => {
    render(<DashboardMascotDock collection={createCollection()} />)

    fireEvent.doubleClick(screen.getByRole('button', { name: 'characters.actions.playReaction' }))
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByRole('dialog', { name: 'characters.actions.expandedView' })).toBeNull()
  })
})
