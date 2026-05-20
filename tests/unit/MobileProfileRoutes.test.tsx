// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import AchievementsPage from '../../src/pages/AchievementsPage'
import CharactersPage from '../../src/pages/CharactersPage'
import ProgressPage from '../../src/pages/ProgressPage'
import SettingsPage from '../../src/pages/SettingsPage'
import { useAnalytics } from '../../src/hooks/useAnalytics'
import { useCharacterCollection } from '../../src/hooks/useCharacterCollection'
import { useMediaQuery } from '../../src/hooks/useMediaQuery'
import { useRewardProgress } from '../../src/hooks/useRewardProgress'
import { useSettingsForm } from '../../src/hooks/useSettingsForm'
import { CHARACTER_CATALOG } from '../../src/lib/characters'
import { toRewardProgressView } from '../../src/lib/rewards'
import type { AnalyticsData } from '../../src/hooks/useAnalytics'
import type { CharacterCollectionView } from '../../src/lib/characters'

vi.mock('../../src/hooks/useAnalytics')
vi.mock('../../src/hooks/useCharacterCollection')
vi.mock('../../src/hooks/useMediaQuery')
vi.mock('../../src/hooks/useRewardProgress')
vi.mock('../../src/hooks/useSettingsForm')

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'ocean@example.com' },
    initialData: {
      global_review_count: 8,
      health: { new_today: 4 },
    },
  }),
}))

vi.mock('../../src/components/characters/CharacterAvatar', () => ({
  default: () => <div data-testid="character-avatar">Character</div>,
  preloadCharacterModelAvatar: vi.fn(),
}))

vi.mock('../../src/components/characters/CharacterExpandedViewer', () => ({
  default: () => <div data-testid="expanded-character" />,
}))

vi.mock('../../src/components/settings/DangerZoneSection', () => ({
  default: () => <div data-testid="desktop-danger-zone" />,
}))

vi.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key: string, values?: Record<string, unknown>) => {
      const labels: Record<string, string> = {
        'profileMobile.hubEyebrow': 'Profile',
        'profileMobile.hubTitle': 'Learning cockpit',
        'profileMobile.hubSubtitle': 'Progress, rewards, character, and settings.',
        'profileMobile.quickLinks': 'Quick links',
        'profileMobile.progressOverview': 'Progress overview',
        'profileMobile.learningPulse': 'Learning pulse',
        'profileMobile.reviewNow': 'Review now',
        'profileMobile.wordsTotal': 'Words tracked',
        'profileMobile.badgesUnlocked': `${values?.unlocked ?? 0}/${values?.total ?? 0} badges`,
        'profileMobile.nextBadge': 'Next badge',
        'profileMobile.characterRoster': 'Character roster',
        'profileMobile.activeCharacter': 'Active character',
        'profileMobile.settingsHint': 'Changes stay local until you save.',
        'profileMobile.accountActions': 'Account actions',
        'profileMobile.saveSettings': 'Save settings',
        'profileMobile.noWeakWords': 'No weak words',
        'nav.progress': 'Progress',
        'nav.achievements': 'Achievements',
        'nav.characters': 'Characters',
        'nav.settings': 'Settings',
        'mobileNav.profile': 'Profile',
        'progress.loading': 'Loading',
        'progress.error': 'Progress error',
        'progress.current_level': 'Current level',
        'progress.vocab_learned': 'Vocabulary learned',
        'progress.masteredWords': 'Mastered words',
        'progress.streak_label': 'Streak',
        'progress.retention_metric': 'Retention',
        'progress.words_due': `${values?.count ?? 0} due`,
        'achievements.backToProgress': 'Back to progress',
        'achievements.title': 'Achievements',
        'achievements.subtitle': 'Earn badges',
        'achievements.totalBadges': 'Total badges',
        'achievements.unlockedSummary': `${values?.unlocked ?? 0}/${values?.total ?? 0}`,
        'achievements.currentLevel': 'Current level',
        'achievements.nextFocus': 'Next focus',
        'achievements.allXpUnlocked': 'All unlocked',
        'achievements.keepGoing': 'Keep going',
        'achievements.categories.xp': 'XP',
        'achievements.categories.streak': 'Streak',
        'achievements.categories.mastery': 'Mastery',
        'achievements.categories.time': 'Time',
        'achievements.progress.xp': 'XP',
        'achievements.progress.days': 'days',
        'achievements.progress.words': 'words',
        'achievements.progress.hours': 'hours',
        'rewards.totalXp': `${values?.xp ?? 0} XP`,
        'rewards.progressToNext': `${values?.current ?? 0}/${values?.target ?? 0} XP`,
        'rewards.unlockAt': `${values?.xp ?? 0} XP`,
        'rewards.xpAmount': `${values?.xp ?? 0} XP`,
        'rewards.levels.archivist': 'Archivist',
        'rewards.badges.memory_keeper.title': 'Memory Keeper',
        'progress.badges.steady_learner.label': 'Steady learner',
        'progress.badges.first_step.label': 'First step',
        'progress.badges.marathon_scholar.label': 'Marathon scholar',
        'characters.backToDashboard': 'Back to dashboard',
        'characters.title': 'Characters',
        'characters.subtitle': 'Unlock companions',
        'characters.availableXp': 'Available XP',
        'characters.actions.expandedView': 'Open details',
        'characters.actions.selected': 'Selected',
        'characters.actions.select': 'Select',
        'characters.actions.unlock': 'Unlock',
        'characters.actions.evolve': 'Evolve',
        'characters.actions.maxed': 'Maxed',
        'characters.actions.locked': 'Locked',
        'characters.rarity.starter': 'Starter',
        'characters.stageLabel': `Stage ${values?.current ?? 1}/${values?.total ?? 1}`,
        'characters.cost': 'Cost',
        'characters.evolutionCost': 'Evolution cost',
        'characters.maxStage': 'Max stage',
        'characters.needMoreXp': `${values?.xp ?? 0} XP needed`,
        'characters.items.seedling_scholar.stages.1.name': 'Seedling Scholar',
        'characters.items.seedling_scholar.stages.1.description': 'A focused learner.',
        'settings.title': 'Settings',
        'settings.subtitle': 'Tune your learning setup.',
        'settings.profile': 'Profile',
        'settings.displayName': 'Display name',
        'settings.displayNamePlaceholder': 'Your name',
        'settings.email': 'Email',
        'settings.avatarUrl': 'Avatar URL',
        'settings.avatarPlaceholder': 'https://...',
        'settings.learning': 'Learning',
        'settings.dailyTarget': 'Daily target',
        'settings.retentionLabel': 'Retention target',
        'settings.retention80': '80%',
        'settings.retention90': '90%',
        'settings.retention95': '95%',
        'settings.audio': 'Audio',
        'settings.voice': 'Voice',
        'settings.systemDefault': 'System default',
        'settings.speed': 'Speed',
        'settings.autoPlay': 'Auto play',
        'settings.language': 'Language',
        'settings.save': 'Save',
        'settings.saving': 'Saving',
        'settings.logout': 'Logout',
        'topics.words': 'words',
      }

      return labels[key] ?? key
    },
  }),
}))

const analyticsData: AnalyticsData = {
  retention_rate: 0.88,
  review_activity: [],
  weak_words: [{ id: 'w1', word: 'anchor', meaning: 'steady', fail_count: 2 }],
  total_time_ms: 3600000,
  mastered_count: 42,
  mastery_distribution: { new: 100, learning: 50, review: 40, relearning: 10 },
  workload_forecast: [],
  heatmap_data: [],
  streak_days: 7,
  topic_stats: [],
  learning_velocity: { avg_new_per_day: 5, avg_reviews_per_day: 20 },
}

const rewardProgress = toRewardProgressView({
  userId: 'user-1',
  totalXp: 620,
  studyXp: 420,
  reviewXp: 200,
  spentXp: 0,
  arenaSessions: 4,
  selectedCharacterId: 'seedling_scholar',
  updatedAt: null,
})

const seedling = CHARACTER_CATALOG[0]
const characterCollection: CharacterCollectionView = {
  totalXp: rewardProgress.totalXp,
  spentXp: 0,
  availableXp: rewardProgress.availableXp,
  selectedCharacter: seedling,
  items: [{
    character: seedling,
    currentStage: 1,
    currentStageDefinition: seedling.evolutionStages[0],
    nextStageDefinition: seedling.evolutionStages[1],
    unlocked: true,
    affordable: true,
    selected: true,
    canEvolve: true,
    maxed: false,
    remainingXpForEvolution: 0,
  }],
}

function arrangeMobileProfile() {
  vi.mocked(useMediaQuery).mockReturnValue(true)
  vi.mocked(useAnalytics).mockReturnValue({ data: analyticsData, isLoading: false, error: null })
  vi.mocked(useRewardProgress).mockReturnValue({
    rewardProgress,
    isLoadingRewards: false,
    refreshRewardProgress: vi.fn(),
  })
  vi.mocked(useCharacterCollection).mockReturnValue({
    collection: characterCollection,
    isLoadingCharacters: false,
    isMutatingCharacter: false,
    characterError: null,
    refreshCharacters: vi.fn(),
    unlockCharacter: vi.fn(async () => true),
    selectCharacter: vi.fn(async () => true),
    evolveCharacter: vi.fn(async () => true),
  })
  vi.mocked(useSettingsForm).mockReturnValue({
    user: { id: 'user-1', email: 'ocean@example.com' } as any,
    formData: {
      daily_target: 12,
      srs_intensity: 0.9,
      tts_voice: null,
      tts_rate: 1,
      auto_play_audio: true,
      app_language: 'vi',
      theme_mode: 'light',
      display_name: 'Ocean',
      avatar_url: '',
    },
    saving: false,
    saveMessage: '',
    error: '',
    handleChange: vi.fn(),
    handleSave: vi.fn(),
  })
}

describe('mobile Profile routes', () => {
  it('renders Progress as a compact mobile profile hub', () => {
    arrangeMobileProfile()

    const { container } = render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>,
    )

    expect(container.querySelector('[data-mobile-progress]')).toBeTruthy()
    expect(screen.getByText('Learning cockpit')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Achievements/i }).getAttribute('href')).toBe('/achievements')
    expect(screen.getByRole('link', { name: /Characters/i }).getAttribute('href')).toBe('/characters')
    expect(screen.getByRole('link', { name: /Settings/i }).getAttribute('href')).toBe('/settings')
    expect(screen.getByText('200')).toBeTruthy()
    expect(screen.getByText('42')).toBeTruthy()
  })

  it('renders Achievements as mobile badge cards', () => {
    arrangeMobileProfile()

    const { container } = render(
      <MemoryRouter>
        <AchievementsPage />
      </MemoryRouter>,
    )

    expect(container.querySelector('[data-mobile-achievements]')).toBeTruthy()
    expect(screen.getByText('Achievements')).toBeTruthy()
    expect(screen.getAllByText(/badges/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /Back to progress/i }).getAttribute('href')).toBe('/progress')
  })

  it('renders Characters as a mobile collection surface', () => {
    arrangeMobileProfile()

    const { container } = render(
      <MemoryRouter>
        <CharactersPage />
      </MemoryRouter>,
    )

    expect(container.querySelector('[data-mobile-characters]')).toBeTruthy()
    expect(screen.getByText('Character roster')).toBeTruthy()
    expect(screen.getByText('Seedling Scholar')).toBeTruthy()
    expect(screen.getByTestId('character-avatar')).toBeTruthy()
  })

  it('renders Settings as compact mobile controls with a safe save bar', () => {
    arrangeMobileProfile()

    const { container } = render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    )

    expect(container.querySelector('[data-mobile-settings]')).toBeTruthy()
    expect(container.querySelector('[data-mobile-settings-savebar]')).toBeTruthy()
    expect(screen.getByDisplayValue('Ocean')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Save settings/i })).toBeTruthy()
  })
})
