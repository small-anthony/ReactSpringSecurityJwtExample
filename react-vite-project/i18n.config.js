import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enMain from "./locales/en/main.json";
import frMain from "./locales/fr/main.json";
import enAuth from "./locales/en/auth.json";
import frAuth from "./locales/fr/auth.json";

const resources = {
    en: {
        main: enMain,
        auth: enAuth,
    },
    fr: {
        main: frMain,
        auth: frAuth,
    },
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