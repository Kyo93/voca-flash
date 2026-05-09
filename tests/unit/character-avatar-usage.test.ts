import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

describe('character avatar usage', () => {
  it('Dashboard anchors the animated mascot to the centered content block', () => {
    const dashboard = fs.readFileSync(path.join(root, 'src/pages/DashboardPage.tsx'), 'utf8')
    const dock = fs.readFileSync(path.join(root, 'src/components/dashboard/DashboardMascotDock.tsx'), 'utf8')
    const showcase = fs.readFileSync(
      path.join(root, 'src/components/dashboard/CharacterShowcaseCard.tsx'),
      'utf8'
    )

    expect(dashboard).toContain('relative flex-1 px-10 py-8')
    expect(dashboard).toContain('<DashboardMascotDock collection={collection} />')
    expect(dashboard).not.toContain('useSidebar')
    expect(dock).toContain('absolute')
    expect(dock).toContain('2xl:flex')
    expect(dock).toContain('-left-56')
    expect(dock).toContain('data-dashboard-mascot-dock="true"')
    expect(dock).not.toContain('sidebarWidth')
    expect(dock).toContain('onClick={handleClick}')
    expect(dock).toContain('size="xl"')
    expect(dock).toContain('animated')
    expect(showcase).not.toContain('CharacterAvatar')
  })

  it('Characters grid keeps avatar previews static unless a reaction is active', () => {
    const source = fs.readFileSync(path.join(root, 'src/pages/CharactersPage.tsx'), 'utf8')

    expect(source).toContain('animated={reactionCharacterId === character.id}')
    expect(source).toContain('animationState={reactionCharacterId === character.id ? \'evolve\' : \'idle\'}')
    expect(source).toContain('onReactionEnd={() =>')
  })

  it('Characters page preloads the 3D renderer only after expanded-view intent', () => {
    const source = fs.readFileSync(path.join(root, 'src/pages/CharactersPage.tsx'), 'utf8')

    expect(source).toContain('preloadCharacterModelAvatar')
    expect(source).toContain('onPointerEnter={handleExpandedViewerIntent}')
    expect(source).toContain('onFocus={handleExpandedViewerIntent}')
    expect(source).toContain('handleOpenExpandedViewer(character.id)')
    expect(source).not.toContain('requestIdleCallback')
    expect(source).not.toContain('setTimeout(preloadCharacterModelAvatar')
  })

  it('Characters page triggers evolve reaction only after evolution succeeds', () => {
    const source = fs.readFileSync(path.join(root, 'src/pages/CharactersPage.tsx'), 'utf8')

    expect(source).toContain('const evolved = await evolveCharacter(character.id)')
    expect(source).toContain('if (evolved) setReactionCharacterId(character.id)')
  })

  it('Study page wires correct, wrong, and celebrate mascot reactions', () => {
    const source = fs.readFileSync(path.join(root, 'src/pages/StudyPage.tsx'), 'utf8')

    expect(source).toContain('const [mascotReaction, setMascotReaction]')
    expect(source).toContain("setMascotReaction(isCorrect ? 'correct' : 'wrong')")
    expect(source).toContain('animationState="celebrate"')
    expect(source).toContain('animationState={mascotReaction}')
  })

  it('Review page wires answer reactions through ArenaShell and SessionSummary', () => {
    const reviewPage = fs.readFileSync(path.join(root, 'src/pages/ReviewPage.tsx'), 'utf8')
    const arenaShell = fs.readFileSync(path.join(root, 'src/components/review/ArenaShell.tsx'), 'utf8')
    const sessionSummary = fs.readFileSync(path.join(root, 'src/components/review/SessionSummary.tsx'), 'utf8')

    expect(reviewPage).toContain('const [mascotReaction, setMascotReaction]')
    expect(reviewPage).toContain("setMascotReaction(isCorrect && !isSkipped ? 'correct' : 'wrong')")
    expect(reviewPage).toContain('mascot={')
    expect(arenaShell).toContain('mascot?: ReactNode')
    expect(sessionSummary).toContain('mascot?: ReactNode')
  })
})
