import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptTranslations from './locales/pt.json';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';
import esTranslations from './locales/es.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            pt: {
                translation: ptTranslations
            },
            en: {
                translation: enTranslations
            },
            fr: {
                translation: frTranslations
            },
            es: {
                translation: esTranslations
            }
        },
        fallbackLng: 'pt',
        debug: false,
        interpolation: {
            escapeValue: false // React already escapes by default
        }
    });

export default i18n;
