import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/i18n/messages/en.json';
import hi from '@/i18n/messages/hi.json';
import es from '@/i18n/messages/es.json';
import fr from '@/i18n/messages/fr.json';
import de from '@/i18n/messages/de.json';
import zh from '@/i18n/messages/zh.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            hi: { translation: hi },
            es: { translation: es },
            fr: { translation: fr },
            de: { translation: de },
            zh: { translation: zh },
        },
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
