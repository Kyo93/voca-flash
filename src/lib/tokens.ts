/**
 * Design Tokens — The Tactile Scholar (Halo Modern)
 * Centralized source of truth for UI metrics and effects.
 */

export const DESIGN_TOKENS = {
  RADIUS: {
    '4XL': 'rounded-4xl', // 40px - Major containers
    '3XL': 'rounded-3xl', // 32px - Cards
    '2XL': 'rounded-2xl', // 24px - Modals/Dialogs
    'XL': 'rounded-xl',   // 20px - Buttons
    'LG': 'rounded-lg',   // 18px - Inputs
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
