import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enMain from "./locales/en/main.json";
import frMain from "./locales/fr/main.json";

const resources = {
    en: {
        main: enMain,
    },
    fr: {
        main: frMain,
    },
};

i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources,
        debug: true,
        supportedLngs: ['en', 'fr'],
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        detection: {

        }
    });

export default i18n;