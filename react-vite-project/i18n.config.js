import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enResources from "./locales/en/index.js";
import frResources from "./locales/fr/index.js";

const resources = {
    en: enResources,
    fr: frResources,
};

i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources,
        debug: true,
        supportedLngs: ['en', 'fr'],
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false,
        }
    });

export default i18n;