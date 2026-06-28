import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const mobileSurfaceFiles = [
  'src/components/mobile/MobileAppLayout.tsx',
  'src/components/mobile/MobileAchievementsView.tsx',
  'src/components/mobile/MobileCharactersView.tsx',
  'src/components/mobile/MobileLibraryView.tsx',
  'src/components/mobile/MobileMasteryView.tsx',
  'src/components/mobile/MobileProgressView.tsx',
  'src/components/mobile/MobileRoadmapTopicsView.tsx',
  'src/components/mobile/MobileSettingsView.tsx',
  'src/components/dashboard/MobileDashboardView.tsx',
]

describe('mobile typography density contract', () => {
  it('keeps mobile surfaces away from oversized display text and ultra-heavy weights', () => {
    for (const file of mobileSurfaceFiles) {
      const source = readFileSync(file, 'utf8')

      expect(source, `${file} should not use ultra-heavy font weight on mobile`).not.toContain('font-black')
      expect(source, `${file} should not use text-3xl on compact mobile surfaces`).not.toContain('text-3xl')
      expect(source, `${file} should not use text-2xl on compact mobile surfaces`).not.toContain('text-2xl')
    }
  })

  it('stacks roadmap progress stats so narrow phones do not overflow horizontally', () => {
    const source = readFileSync('src/components/mobile/MobileRoadmapTopicsView.tsx', 'utf8')

    expect(source).toContain('data-mobile-roadmap-progress')
    expect(source).toContain('data-mobile-roadmap-stats')
    expect(source).toContain('roadmapDetail.mobile.progressTitle')
    expect(source).not.toContain('roadmap.mobile.')
    expect(source).not.toContain('flex items-center justify-between gap-4')
    expect(source).not.toContain('min-h-[220px]')
  })

  it('avoids negative horizontal offsets in mobile chrome and hero cards', () => {
    for (const file of [
      'src/components/mobile/MobileAppLayout.tsx',
      'src/components/mobile/MobileAchievementsView.tsx',
      'src/components/mobile/MobileCharactersView.tsx',
      'src/components/mobile/MobileProgressView.tsx',
      'src/components/mobile/MobileSettingsView.tsx',
      'src/components/dashboard/MobileDashboardView.tsx',
    ]) {
      const source = readFileSync(file, 'utf8')

      expect(source, `${file} should not push decorative or badge elements outside the viewport`).not.toContain('-right-')
      expect(source, `${file} should not push decorative or badge elements outside the viewport`).not.toContain('-left-')
    }
  })

  it('keeps mobile tap targets at least 44px on key controls', () => {
    const masterySource = readFileSync('src/components/mobile/MobileMasteryView.tsx', 'utf8')
    const charactersSource = readFileSync('src/components/mobile/MobileCharactersView.tsx', 'utf8')
    const achievementsSource = readFileSync('src/components/mobile/MobileAchievementsView.tsx', 'utf8')

    expect(masterySource).not.toContain('h-5 w-5')
    expect(masterySource).not.toContain('h-10 w-10')
    expect(charactersSource).not.toContain('min-h-10')
    expect(achievementsSource).not.toContain('min-h-10')
  })

  it('keeps Study Prep compact enough for S25 Ultra-class mobile viewports', () => {
    const source = readFileSync('src/components/StudyPrepScreen.tsx', 'utf8')

    expect(source).toContain('data-mobile-study-prep')
    expect(source).toContain('min-h-[100dvh]')
    expect(source).toMatch(/p-4[\s\S]{0,80}sm:p-6/)
    expect(source).toMatch(/p-5[\s\S]{0,80}sm:p-8/)
    expect(source).toMatch(/text-2xl[\s\S]{0,80}sm:text-3xl/)
    expect(source).toMatch(/mb-6[\s\S]{0,80}sm:mb-8/)
    expect(source).toContain('studyPrep.recommendedShort')
    expect(source).toContain('studyPrep.startLearning')
    expect(source).toContain('grid grid-cols-3')
    expect(source).not.toContain('fiber_new')
    expect(source).not.toContain('min-h-[80vh]')
    expect(source).not.toContain('text-3xl font-black')
  })

  it('uses compact mobile spacing for the active Study focus route', () => {
    const source = readFileSync('src/pages/StudyPage.tsx', 'utf8')

    expect(source).toContain('data-mobile-study-session')
    expect(source).toContain('pt-4 sm:pt-8')
    expect(source).toContain('pb-6 sm:pb-12')
    expect(source).toContain('space-y-5 sm:space-y-8')
    expect(source).toContain('pt-2 sm:pt-8')
    expect(source).toContain('h-[min(54dvh,32rem)]')
    expect(source).toContain('sm:h-auto sm:aspect-3/4')
    expect(source).not.toContain('pt-8 min-h-[80vh] px-4 pb-12')
  })

  it('compacts flashcards and study actions on mobile without shrinking tap targets', () => {
    const frontSource = readFileSync('src/components/study/FlashcardFront.tsx', 'utf8')
    const backSource = readFileSync('src/components/study/FlashcardBack.tsx', 'utf8')
    const actionsSource = readFileSync('src/components/study/StudyActions.tsx', 'utf8')
    const srsSource = readFileSync('src/components/SRSButtons.tsx', 'utf8')

    expect(frontSource).toMatch(/p-5[\s\S]{0,80}sm:p-8/)
    expect(frontSource).toMatch(/text-3xl[\s\S]{0,80}sm:text-4xl/)
    expect(frontSource).toMatch(/text-base[\s\S]{0,80}sm:text-lg/)
    expect(backSource).toMatch(/p-6[\s\S]{0,80}sm:p-12/)
    expect(backSource).toMatch(/text-2xl[\s\S]{0,80}sm:text-3xl/)
    expect(backSource).toContain('h-11 w-11')
    expect(actionsSource).toMatch(/mt-4[\s\S]{0,80}sm:mt-8/)
    expect(actionsSource).toMatch(/gap-3[\s\S]{0,80}sm:gap-4/)
    expect(actionsSource).toContain('min-h-12')
    expect(srsSource).toContain('p-2.5 sm:p-4')
  })

  it('compacts study and review challenge bodies for mobile screens', () => {
    const challengingSource = readFileSync('src/components/study/ChallengingScreen.tsx', 'utf8')
    const recognitionSource = readFileSync('src/components/review/RecognitionChallenge.tsx', 'utf8')
    const contextSource = readFileSync('src/components/review/ContextGapChallenge.tsx', 'utf8')
    const ghostSource = readFileSync('src/components/review/GhostRecallChallenge.tsx', 'utf8')

    expect(challengingSource).toContain('p-4 sm:p-6')
    expect(challengingSource).toMatch(/mt-4[\s\S]{0,160}sm:mt-6/)
    expect(recognitionSource).toMatch(/p-4[\s\S]{0,160}sm:p-6/)
    expect(recognitionSource).toMatch(/mb-5[\s\S]{0,160}sm:mb-8/)
    expect(recognitionSource).toMatch(/text-3xl[\s\S]{0,80}sm:text-4xl/)
    expect(contextSource).toMatch(/p-5[\s\S]{0,80}sm:p-8/)
    expect(contextSource).toMatch(/text-xl[\s\S]{0,80}sm:text-2xl/)
    expect(ghostSource).toMatch(/text-3xl[\s\S]{0,80}sm:text-4xl/)
    expect(ghostSource).toContain('min-h-11')
  })

  it('compacts study/review completion and exit screens on mobile', () => {
    const studyCompleteSource = readFileSync('src/components/study/StudyComplete.tsx', 'utf8')
    const sessionSummarySource = readFileSync('src/components/review/SessionSummary.tsx', 'utf8')
    const confirmExitSource = readFileSync('src/components/review/ConfirmExitModal.tsx', 'utf8')

    expect(studyCompleteSource).toContain('data-mobile-study-complete')
    expect(studyCompleteSource).toContain('min-h-[100dvh]')
    expect(studyCompleteSource).toMatch(/h-20 w-20[\s\S]{0,120}sm:h-32 sm:w-32/)
    expect(studyCompleteSource).toMatch(/text-2xl[\s\S]{0,80}sm:text-4xl/)
    expect(studyCompleteSource).toContain('min-h-12')
    expect(studyCompleteSource).not.toContain('min-h-[80vh]')

    expect(sessionSummarySource).toContain('data-mobile-session-summary')
    expect(sessionSummarySource).toContain('max-h-[100dvh] overflow-y-auto')
    expect(sessionSummarySource).toContain('p-4 sm:p-6')
    expect(sessionSummarySource).toMatch(/mb-6[\s\S]{0,80}sm:mb-12/)
    expect(sessionSummarySource).toMatch(/text-3xl[\s\S]{0,80}sm:text-5xl/)
    expect(sessionSummarySource).toMatch(/p-4[\s\S]{0,120}sm:p-8/)

    expect(confirmExitSource).toContain('data-mobile-confirm-exit')
    expect(confirmExitSource).toMatch(/p-4[\s\S]{0,80}sm:p-6/)
    expect(confirmExitSource).toMatch(/p-6[\s\S]{0,80}sm:p-12/)
    expect(confirmExitSource).toMatch(/h-16 w-16[\s\S]{0,120}sm:h-24 sm:w-24/)
    expect(confirmExitSource).toMatch(/text-2xl[\s\S]{0,80}sm:text-3xl/)
    expect(confirmExitSource).toContain('min-h-12')
  })

  it('uses mobile-responsive review arena spacing instead of desktop-only density', () => {
    const arenaSource = readFileSync('src/components/review/ArenaShell.tsx', 'utf8')
    const challengeSource = readFileSync('src/components/review/ChallengeManager.tsx', 'utf8')
    const constructionSource = readFileSync('src/components/review/ConstructionChallenge.tsx', 'utf8')

    expect(arenaSource).toContain('data-mobile-review-shell')
    expect(arenaSource).toContain('px-4 sm:px-8')
    expect(arenaSource).toContain('hidden sm:flex')
    expect(challengeSource).toContain('py-6 sm:py-12')
    expect(constructionSource).toContain('p-6 sm:p-12')
    expect(constructionSource).toContain('mb-8 sm:mb-16')
  })

  it('gives the public landing page a compact mobile-only layout', () => {
    const source = readFileSync('src/pages/LandingPage.tsx', 'utf8')

    expect(source).toContain('data-mobile-landing')
    expect(source).toContain('data-desktop-landing')

    const mobileBranch = source.slice(
      source.indexOf('data-mobile-landing'),
      source.indexOf('data-desktop-landing'),
    )

    expect(mobileBranch).not.toContain('font-black')
    expect(mobileBranch).not.toContain('text-5xl')
    expect(mobileBranch).not.toContain('text-6xl')
    expect(mobileBranch).not.toContain('w-[45%]')
    expect(mobileBranch).not.toContain('w-[55%]')

    expect(mobileBranch).toContain('data-mobile-hero-actions')
    const heroActions = mobileBranch.slice(
      mobileBranch.indexOf('data-mobile-hero-actions'),
      mobileBranch.indexOf('</section>', mobileBranch.indexOf('data-mobile-hero-actions')),
    )

    expect(heroActions).not.toContain('grid-cols-2')
  })
})
