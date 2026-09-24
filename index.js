import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import si from './si.json';
import ta from './ta.json';

const resources = {
  en: { translation: en },
  si: { translation: si },
  ta: { translation: ta },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    compatibilityJSON: 'v3',
  });

export default i18n;
