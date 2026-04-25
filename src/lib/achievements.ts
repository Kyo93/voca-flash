import { REWARD_BADGES, type RewardProgressView } from './rewards'

export type AchievementCategory = 'xp' | 'streak' | 'mastery' | 'time'

export interface AchievementView {
  id: string
  category: AchievementCategory
  icon: string
  titleKey: string
  descriptionKey: string
  unitKey: string
  current: number
  target: number
  progress: number
  unlocked: boolean
  rank: number
}

export interface AchievementInput {
  rewardProgress?: RewardProgressView | null
  streak: number
  totalMastered: number
  totalTimeMs: number
}

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = ['xp', 'streak', 'mastery', 'time']

export const ACHIEVEMENT_CATEGORY_TITLE_KEYS: Record<AchievementCategory, string> = {
  xp: 'achievements.categories.xp',
  streak: 'achievements.categories.streak',
  mastery: 'achievements.categories.mastery',
  time: 'achievements.categories.time',
}

const MS_PER_HOUR = 60 * 60 * 1000

function normalizeMetric(value: number | null | undefined): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value as number)) : 0
}

function createProgress(current: number, target: number): number {
  if (target <= 0) return 100
  return Math.min(100, Math.round((current / target) * 100))
}

function createAchievement({
  id,
  category,
  icon,
  titleKey,
  descriptionKey,
  unitKey,
  current,
  target,
  rank,
}: Omit<AchievementView, 'progress' | 'unlocked'>): AchievementView {
  const normalizedCurrent = normalizeMetric(current)
  const normalizedTarget = Math.max(1, normalizeMetric(target))

  return {
    id,
    category,
    icon,
    titleKey,
    descriptionKey,
    unitKey,
    current: normalizedCurrent,
    target: normalizedTarget,
    progress: createProgress(normalizedCurrent, normalizedTarget),
    unlocked: normalizedCurrent >= normalizedTarget,
    rank,
  }
}

export function buildAchievements({
  rewardProgress,
  streak,
  totalMastered,
  totalTimeMs,
}: AchievementInput): AchievementView[] {
  const totalXp = normalizeMetric(rewardProgress?.totalXp)
  const streakDays = normalizeMetric(streak)
  const masteredWords = normalizeMetric(totalMastered)
  const studyHours = Math.floor(normalizeMetric(totalTimeMs) / MS_PER_HOUR)

  return [
    ...REWARD_BADGES.map((badge, index) => createAchievement({
      id: badge.id,
      category: 'xp',
      icon: badge.icon,
      titleKey: badge.titleKey,
      descriptionKey: badge.descriptionKey,
      unitKey: 'achievements.progress.xp',
      current: totalXp,
      target: badge.minXp,
      rank: 100 + index,
    })),
    createAchievement({
      id: 'steady_learner',
      category: 'streak',
      icon: 'local_fire_department',
      titleKey: 'progress.badges.steady_learner.label',
      descriptionKey: 'progress.badges.steady_learner.desc',
      unitKey: 'achievements.progress.days',
      current: streakDays,
      target: 7,
      rank: 200,
    }),
    createAchievement({
      id: 'fire_starter',
      category: 'streak',
      icon: 'whatshot',
      titleKey: 'progress.badges.fire_starter.label',
      descriptionKey: 'progress.badges.fire_starter.desc',
      unitKey: 'achievements.progress.days',
      current: streakDays,
      target: 30,
      rank: 201,
    }),
    createAchievement({
      id: 'persistent_scholar',
      category: 'streak',
      icon: 'emoji_events',
      titleKey: 'progress.badges_v2.persistent.label',
      descriptionKey: 'progress.badges_v2.persistent.desc',
      unitKey: 'achievements.progress.days',
      current: streakDays,
      target: 100,
      rank: 202,
    }),
    createAchievement({
      id: 'first_step',
      category: 'mastery',
      icon: 'flag',
      titleKey: 'progress.badges.first_step.label',
      descriptionKey: 'progress.badges.first_step.desc',
      unitKey: 'achievements.progress.words',
      current: masteredWords,
      target: 1,
      rank: 300,
    }),
    createAchievement({
      id: 'lexical_legend',
      category: 'mastery',
      icon: 'workspace_premium',
      titleKey: 'progress.badges.lexical_legend.label',
      descriptionKey: 'progress.badges.lexical_legend.desc',
      unitKey: 'achievements.progress.words',
      current: masteredWords,
      target: 1000,
      rank: 301,
    }),
    createAchievement({
      id: 'vocab_master',
      category: 'mastery',
      icon: 'military_tech',
      titleKey: 'progress.badges_v2.vocab_master.label',
      descriptionKey: 'progress.badges_v2.vocab_master.desc',
      unitKey: 'achievements.progress.words',
      current: masteredWords,
      target: 4000,
      rank: 302,
    }),
    createAchievement({
      id: 'marathon_scholar',
      category: 'time',
      icon: 'timer',
      titleKey: 'progress.badges.marathon_scholar.label',
      descriptionKey: 'progress.badges.marathon_scholar.desc',
      unitKey: 'achievements.progress.hours',
      current: studyHours,
      target: 10,
      rank: 400,
    }),
  ]
}

export function getAchievementCounts(achievements: AchievementView[]) {
  const unlocked = achievements.filter(achievement => achievement.unlocked).length

  return {
    unlocked,
    total: achievements.length,
  }
}

export function getRecentAchievements(
  achievements: AchievementView[],
  limit = 3
): AchievementView[] {
  const safeLimit = Math.max(0, Math.floor(limit))
  if (safeLimit === 0) return []

  const unlocked = achievements
    .filter(achievement => achievement.unlocked)
    .sort((a, b) => b.rank - a.rank)

  const locked = achievements
    .filter(achievement => !achievement.unlocked)
    .sort((a, b) => b.progress - a.progress || a.rank - b.rank)

  return [...unlocked, ...locked].slice(0, safeLimit)
}
