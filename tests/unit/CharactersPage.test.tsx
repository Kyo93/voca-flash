// @vitest-environment jsdom

import fs from 'node:fs'
import path from 'node:path'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import CharactersPage from '../../src/pages/CharactersPage'
import { buildCharacterCollection, DEFAULT_CHARACTER_ID } from '../../src/lib/characters'
import { createEmptyRewardProgress, toRewardProgressView } from '../../src/lib/rewards'

const expandedViewerSource = fs.readFileSync(
  path.join(process.cwd(), 'src', 'components', 'characters', 'CharacterExpandedViewer.tsx'),
  'utf-8',
)

const collection = buildCharacterCollection({
  rewardProgress: toRewardProgressView({
    ...createEmptyRewardProgress('user-1'),
    totalXp: 500,
    spentXp: 0,
  }),
  unlockedCharacterIds: [DEFAULT_CHARACTER_ID],
  unlockedCharacterStates: [
    { characterId: DEFAULT_CHARACTER_ID, currentStage: 1, evolutionSpentXp: 0 },
  ],
  selectedCharacterId: DEFAULT_CHARACTER_ID,
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => values?.xp ? `${values.xp} XP` : key,
  }),
}))

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}))

vi.mock('../../src/hooks/useCharacterCollection', () => ({
  useCharacterCollection: () => ({
    collection,
    isLoadingCharacters: false,
    isMutatingCharacter: false,
    characterError: null,
    unlockCharacter: vi.fn(),
    selectCharacter: vi.fn(),
    evolveCharacter: vi.fn(),
  }),
}))

describe('CharactersPage expanded viewer', () => {
  it('opens a full-screen PBR character viewer from the collection page', () => {
    render(
      <MemoryRouter>
        <CharactersPage />
      </MemoryRouter>
    )

    fireEvent.doubleClick(screen.getAllByRole('button', { name: 'characters.actions.expandedView' })[0])

    const dialog = screen.getByRole('dialog', { name: 'characters.actions.expandedView' })
    const overlay = document.querySelector('[data-character-expanded-view="true"]')
    const stage = document.querySelector('[data-character-expanded-stage="true"]')

    expect(dialog).toBeTruthy()
    expect(overlay?.parentElement).toBe(document.body)
    expect(overlay?.className).toContain('fixed inset-0')
    expect(overlay?.className).toContain('z-[1000]')
    expect(stage?.className).not.toContain('bg-surface')
    expect(document.querySelector('[data-character-material-quality="pbr"]')).toBeTruthy()
  })

  it('closes the character viewer with Escape', () => {
    render(
      <MemoryRouter>
        <CharactersPage />
      </MemoryRouter>
    )

    fireEvent.doubleClick(screen.getAllByRole('button', { name: 'characters.actions.expandedView' })[0])
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByRole('dialog', { name: 'characters.actions.expandedView' })).toBeNull()
  })

  it('keeps the close button above the full-screen WebGL stage', () => {
    expect(expandedViewerSource).toContain('data-character-expanded-stage="true"')
    expect(expandedViewerSource).toContain('className="relative z-0 flex h-full w-full items-center justify-center"')
    expect(expandedViewerSource).toContain('className="absolute right-6 top-6 z-[1010]')
  })

  it('shows adjustable light controls for model-backed characters in the expanded viewer', () => {
    render(
      <MemoryRouter>
        <CharactersPage />
      </MemoryRouter>
    )

    const arcaneBrawlerIndex = collection.items.findIndex(item => item.character.id === 'arcane_brawler')
    fireEvent.click(screen.getAllByRole('button', { name: 'characters.actions.expandedView' })[arcaneBrawlerIndex])

    const overlay = document.querySelector('[data-character-expanded-view="true"]')
    const exposureSlider = screen.getByRole('slider', { name: 'characters.viewer.exposure' })

    expect(document.querySelector('[data-character-viewer-controls="true"]')).toBeTruthy()
    expect(overlay?.getAttribute('data-character-viewer-exposure')).toBe('0.58')
    expect(overlay?.getAttribute('data-character-viewer-light')).toBe('soft')

    fireEvent.change(exposureSlider, { target: { value: '0.68' } })

    expect(overlay?.getAttribute('data-character-viewer-exposure')).toBe('0.68')

    fireEvent.click(screen.getByRole('button', { name: 'characters.viewer.lightPreset.vivid' }))

    expect(overlay?.getAttribute('data-character-viewer-light')).toBe('vivid')
  })

  it('shows animation controls for GLB characters with embedded animation states', () => {
    render(
      <MemoryRouter>
        <CharactersPage />
      </MemoryRouter>
    )

    const playfulDogIndex = collection.items.findIndex(item => item.character.id === 'playful_dog')
    fireEvent.click(screen.getAllByRole('button', { name: 'characters.actions.expandedView' })[playfulDogIndex])

    const overlay = document.querySelector('[data-character-expanded-view="true"]')

    expect(document.querySelector('[data-character-viewer-animation-controls="true"]')).toBeTruthy()
    expect(overlay?.getAttribute('data-character-viewer-animation')).toBe('idle')

    fireEvent.click(screen.getByRole('button', { name: 'characters.viewer.animation.celebrate' }))

    expect(overlay?.getAttribute('data-character-viewer-animation')).toBe('celebrate')
    expect(screen.getByRole('button', { name: 'characters.viewer.animation.celebrate' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('disables procedural quick reactions when using expanded GLB animation controls', () => {
    expect(expandedViewerSource).toContain('disableProceduralAnimation={hasAnimationControls}')
  })

  it('does not show animation controls for GLB characters without embedded animation states', () => {
    render(
      <MemoryRouter>
        <CharactersPage />
      </MemoryRouter>
    )

    const fallingTreeIndex = collection.items.findIndex(item => item.character.id === 'falling_leaf_tree')
    fireEvent.click(screen.getAllByRole('button', { name: 'characters.actions.expandedView' })[fallingTreeIndex])

    expect(document.querySelector('[data-character-viewer-controls="true"]')).toBeTruthy()
    expect(document.querySelector('[data-character-viewer-animation-controls="true"]')).toBeNull()
    expect(screen.queryByRole('button', { name: 'characters.viewer.animation.celebrate' })).toBeNull()
  })

  it('does not show model light controls for static media characters', () => {
    render(
      <MemoryRouter>
        <CharactersPage />
      </MemoryRouter>
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'characters.actions.expandedView' })[0])

    expect(document.querySelector('[data-character-viewer-controls="true"]')).toBeNull()
    expect(screen.queryByRole('slider', { name: 'characters.viewer.exposure' })).toBeNull()
  })
})
