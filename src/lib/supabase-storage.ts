/**
 * supabase-storage.ts (Barrel File)
 * Modular storage for easier maintenance and better performance.
 */

export * from './storage/auth'
export * from './storage/mastery'
export * from './storage/roadmap'
export * from './storage/session'
export * from './storage/notebook'

// Common Types (Centrally managed in lib/types.ts)
export type { 
  InitialAppData, 
  ProgressPageData, 
  LibraryPageData,
  DashboardSummary,
  MasteryStats 
} from './types'
