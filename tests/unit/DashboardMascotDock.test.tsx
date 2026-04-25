// @vitest-environment jsdom

import fs from 'node:fs'
import path from 'node:path'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DashboardMascotDock from '../../src/components/dashboard/DashboardMascotDock'
import { buildCharacterCollection, DEFAULT_CHARACTER_ID } from '../../src/lib/characters'
import { createEmptyRewardProgress, toRewardProgressView } from '../../src/lib/rewards'

const dashboardMascotSource = fs.readFileSync(
  path.join(process.cwd(), 'src', 'components', 'dashboard', 'DashboardMascotDock.tsx'),
  'utf-8',
)

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

  it('opts out of static model thumbnails so the Dashboard showcase can stay 3D', () => {
    expect(dashboardMascotSource).toContain('useModelThumbnail={false}')
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

  it('does not open an expanded character viewer on double click', () => {
    render(<DashboardMascotDock collection={createCollection()} />)

    fireEvent.doubleClick(screen.getByRole('button', { name: 'characters.actions.playReaction' }))

    expect(screen.queryByRole('dialog', { name: 'characters.actions.expandedView' })).toBeNull()
    expect(document.querySelector('[data-character-expanded-view="true"]')).toBeNull()
    expect(document.querySelector('[data-dashboard-expanded-view="true"]')).toBeNull()
  })

  it('keeps quick mascot clicks as reactions instead of opening the expanded viewer', () => {
    let now = 1000
    const performanceNow = vi.spyOn(window.performance, 'now').mockImplementation(() => now)
    const { container } = render(<DashboardMascotDock collection={createCollection()} />)

    const mascotButton = screen.getByRole('button', { name: 'characters.actions.playReaction' })
    fireEvent.click(mascotButton)
    now = 1120
    fireEvent.click(mascotButton)

    expect(screen.queryByRole('dialog', { name: 'characters.actions.expandedView' })).toBeNull()
    expect(container.querySelector('video')?.getAttribute('src')).toBe(
      '/character-assets/seedling_scholar/stage-1/celebrate.webm'
    )
    performanceNow.mockRestore()
  })
})
