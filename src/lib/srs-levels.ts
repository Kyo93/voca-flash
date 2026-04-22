import { SRS_STABILITY_LEVELS } from './constants'

export interface SrsLevelConfig {
  label: string
  color: string     // Background for bars
  text: string      // Text color
  bg: string        // Badges background
  glow: string      // Glow shadow effect
  icon: string      // Material icon name
}

/**
 * Centralized logic for SRS Levels based on stability (days).
 * Used by MasteryPage, WordDetailPanel, and Library.
 */
export function getSrsLevelConfig(stability: number): SrsLevelConfig {
  if (stability >= SRS_STABILITY_LEVELS.ROOTED) {
    return {
      label: 'Rooted',
      color: 'bg-secondary',
      text: 'text-secondary',
      bg: 'bg-secondary/10',
      glow: 'shadow-[0_0_15px_rgba(130,148,96,0.3)]',
      icon: 'park'
    }
  }
  if (stability >= SRS_STABILITY_LEVELS.MASTERED) {
    return {
      label: 'Mastered',
      color: 'bg-secondary/70',
      text: 'text-secondary/80',
      bg: 'bg-secondary/5',
      glow: '',
      icon: 'verified'
    }
  }
  if (stability >= SRS_STABILITY_LEVELS.LEARNING) {
    return {
      label: 'Learning',
      color: 'bg-primary/50',
      text: 'text-primary/70',
      bg: 'bg-primary/5',
      glow: '',
      icon: 'auto_stories'
    }
  }
  return {
    label: 'Fresh',
    color: 'bg-primary',
    text: 'text-primary',
    bg: 'bg-primary/10',
    glow: '',
    icon: 'target'
  }
}
