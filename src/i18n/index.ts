import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enUS from './locales/en-US/common.json'
import ptBR from './locales/pt-BR/common.json'

export const SUPPORTED_LOCALES = ['en-US', 'pt-BR'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const FALLBACK_LOCALE: Locale = 'en-US'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'en-US': { common: enUS },
      'pt-BR': { common: ptBR },
    },
    fallbackLng: FALLBACK_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    // Map regional variants (e.g. `pt`, `en-GB`) onto our two locales.
    load: 'currentOnly',
    nonExplicitSupportedLngs: true,
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'hs-locale',
      caches: ['localStorage'],
    },
  })

export default i18n
