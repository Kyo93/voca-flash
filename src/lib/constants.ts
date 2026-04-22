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
  DEBOUNCE_DELAY_MS: 400,
  DEFAULT_SORT_BY: 'date',
} as const;

export const FETCH_PAGE_SIZE = 1000;

export const TIME_CONSTANTS = {
  ONE_DAY_MS: 86_400_000,
  TIMEOUT_SHORT_MS: 3000,
} as const;

export const SRS_CONFIG = {
  RETENTION_DEFAULT: 0.9,
} as const;

export const LIBRARY_IMAGES = {
  KIDS: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3KhF9uR-xXVpSv6pn_s5MQArtNHLaeqZGVy3Z1o8xNmBkFmfxNnZp7gcv1PSl2Sui7tp_wq30ZFTD0fn4Di9SXLalR56TsGULlKBzBNhuor8gGRyhtlhT4ykI0TLXLG0GD0g0eVkdsZBmGd9j0E9ljzUy2C8l2Ln4HckEqW1xJWd_XvSuD-F5KC4apFAdrroQ-vDle39KLdRXq_NXToCtNeTGGcJGA8r1R4tSVU_cuNJJ0UGhgNE562HfPPztOnlnKIlBAEWioho',
  PROFESSIONAL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDnvQt2zo_EDPwxAYPXR7-KIeaoANUjFGbYCaJBfj0VR8mgdHvTG8Q7RZ_NsCv9tzjwMaJxM78BI9UGmaBRuTBPUquXV9G8GtSOrItJDlzvSxbhXYwslqJbaDA7Lj9511sLVv84X74_Y3LRLTIMK4l5yVYjSVZDUkqGoHrGRA78m1B0oK7YM5prChBWsL_i7Cfz-IGZQlPU3WZX1S-rbqFyPGwT5OWtKEnTyWUfFbOMl1wW8GKfCLNMc0Lgn3e493I9W9xIsQxCX8',
  ADVANCED: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPJEqmnzoRrR1BbMfXTHBs2ch9r39_lFHhulD2Ftx01n28O2cJxjSatgcsWutM0qM1H0Hv9GLac8Ep714BrXAPLtgH_Fb447ADD_iGk3DCG1LfgAESAM13fKC1GLFvnkyZapG3GI1ZZYU9EZjBDZkS76eueZh8O-zK6VXMBsYtJuHYoWKbiqVdc_gghQUML1vec2ch2u9My0T8_AasOuwYu9uAi1A3G4uXh0GiM2soKvWK_9H-Wwg3DNe-JHgRKm2BopzdAUhVJ1k',
  LIFESTYLE: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiyIjOjwPdwiMBMhbuizstF4hKOR0vrGilIbGfOIQaJc06MHpzex_nm8hiyB0P0VJPWghNJUkY-nCagX_KZKuI7vJF-qBTRgzoc9f01jhrB-gap49brEt6cayhEmJ_PllwUe39FEjmcuV8tsVhgYweGgOSezeAOl5x6T6GWqzXo7E8TCMgcKvAbiKvuh1NIaEg6XRaR2WbvX2GWw7yXptQ3m9xhyRwgZGBvATJmZ-YB8K6BA9U_cBoFMVDi8IYq9drtl7JjAyANag'
} as const;
