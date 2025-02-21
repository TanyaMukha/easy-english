import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// Импорт переводов
import en from "./translations/en.json";
import uk from "./translations/uk.json";

const LANGUAGES = {
  en: "English",
  uk: "Українська",
} as const;

export type Language = keyof typeof LANGUAGES;

const LANGUAGE_STORAGE_KEY = "user_language";

// Конфигурация i18next
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    uk: { translation: uk },
  },
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false // Важно!
  }
});

// Загрузка сохраненного языка
export const loadSavedLanguage = async () => {
  try {
    const savedLanguage = "en"; //await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage) {
      await i18n.changeLanguage(savedLanguage);
      return savedLanguage as Language;
    }
    // Если язык не сохранен, используем системный
    const deviceLanguage = getLocales()[0]?.languageCode;
    const supportedLanguage =
      deviceLanguage && Object.keys(LANGUAGES).includes(deviceLanguage)
        ? deviceLanguage
        : "en";
    await i18n.changeLanguage(supportedLanguage);
    return supportedLanguage as Language;
  } catch (error) {
    console.error(`Error loading language: ${error}`);
    return "en";
  }
};

// Сохранение выбранного языка
export const saveLanguage = async (language: Language) => {
  try {
    // await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error(`Error saving language: ${error}`);
  }
};

export { i18n, LANGUAGES };

export default i18n;
