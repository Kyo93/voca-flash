import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import vi from './i18n/vi.json'
import en from './i18n/en.json'
import { getInitialLanguage } from './lib/i18n-utils'

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'vi',
  interpolation: { escapeValue: false },
})

export default i18n
