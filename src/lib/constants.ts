/**
 * VocaFlash Domain Constants
 * Centralized source of truth for SRS thresholds, Study timers, and UI configurations.
 */

export const SRS_STABILITY_LEVELS = {
  ROOTED: 90,
  MASTERED: 21,
  LEARNING: 3,
} as const;

export const STUDY_SESSION_DEFAULTS = {
  /** Total challenge timeout in milliseconds */
  TIMEOUT_MS: 30000,
  /** Visual timer start value in seconds */
  TIMER_SECONDS: 30,
  /** Response time threshold for 'Easy' rating (ms) */
  RATING_THRESHOLD_EASY_MS: 3000,
  /** Response time threshold for 'Good' rating (ms) */
  RATING_THRESHOLD_GOOD_MS: 8000,
  /** Threshold for showing red warning border (s) */
  WARNING_THRESHOLD_S: 10,
} as const;

export const MASTERY_CONFIG = {
  DEFAULT_PAGE_SIZE: 50,
} as const;
