/**
 * Design Tokens — The Tactile Scholar (Halo Modern)
 * Centralized source of truth for UI metrics and effects.
 */

export const DESIGN_TOKENS = {
  COLORS: {
    PRIMARY: '#E67E22',        // Terracotta
    PRIMARY_DARK: '#944A00',
    SECONDARY: '#546435',      // Sage Green
    SECONDARY_CONTAINER: '#D7EAAE',
    SURFACE: '#FFF8F5',        // Warm Cream
    CARD: '#FFFFFF',           // Pure White elevation
    TEXT_PRIMARY: '#1D1B1A',   // Soft Scholar Ink
    TEXT_SECONDARY: '#564337', // Tonal Variant
    BORDER_GHOST: '#DCC1B126', // 15% Ghost Border
  },
  RADIUS: {
    '4XL': 'rounded-[32px]',   // 32px - Major containers (Editorial standard)
    '3XL': 'rounded-3xl',      // 24px - Large cards
    '2XL': 'rounded-2xl',      // 16px - Small cards
    'XL': 'rounded-xl',        // 12px - Buttons
    'LG': 'rounded-lg',        // 8px - Inputs
  },

  SHADOW: {
    'SM': 'shadow-sm',
    'MD': 'shadow-md',
    'LG': 'shadow-lg',
    'XL': 'shadow-xl',
    '2XL': 'shadow-2xl',
  },

  GLASS: {
    'SURFACE': 'bg-white/80 backdrop-blur-md border border-white/20',
    'DRAWER': 'bg-surface-container-low/90 backdrop-blur-xl border-l border-white/10',
  },

  Z_INDEX: {
    'FLOATING_ACTION': 'z-100',
    'DRAWER': 'z-500',
    'MODAL': 'z-1000',
    'TOAST': 'z-2000',
  }
} as const;

export const LAYOUT_TOKENS = {
  MAX_WIDTH: 1280,
  SIDEBAR_WIDTH: 256,
  SIDEBAR_COLLAPSED_WIDTH: 72,
  RIGHTBAR_WIDTH: 280,
  RIGHTBAR_COLLAPSED_WIDTH: 72,
};
