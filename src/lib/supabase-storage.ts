/**
 * supabase-storage.ts (Barrel File)
 * Modular storage for easier maintenance and better performance.
 */

export * from './storage/auth'
export * from './storage/mastery'
export * from './storage/roadmap'
export * from './storage/session'

// Re-export common types if they are defined here (though they should be in lib/types.ts)
export type { InitialAppData, ProgressPageData, LibraryPageData } from './storage/roadmap'
export type { UserStats, DashboardSummary } from './storage/auth'
export type { MasteryStats } from './storage/mastery'
