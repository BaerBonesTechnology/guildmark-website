/**
 * i18n setup — react-i18next + i18next
 *
 * Supported locales: en (default), es, fr
 * Add new locales by:
 *   1. Creating src/i18n/locales/<code>/translation.json
 *   2. Importing + adding to `resources` below
 *   3. Adding to the `supportedLngs` array
 *
 * Install deps first:
 *   pnpm add i18next react-i18next i18next-browser-languagedetector
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import es from './locales/es/translation.json';
import fr from './locales/fr/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
    },
    supportedLngs: ['en', 'es', 'fr'],
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
