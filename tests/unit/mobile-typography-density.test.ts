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
