export const LNG_STORAGE_KEY = 'voca-flash-lng'

/**
 * Returns the preferred language from localStorage or default
 */
export function getInitialLanguage(): string {
  return localStorage.getItem(LNG_STORAGE_KEY) || 'vi'
}
