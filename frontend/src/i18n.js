import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en/translation.json';
import taTranslations from './locales/ta/translation.json';

i18n
    // detect user language
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    .init({
        resources: {
            en: { translation: enTranslations },
            ta: { translation: taTranslations }
        },
        fallbackLng: 'en',
        debug: false,

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        }
    });

export default i18n;
