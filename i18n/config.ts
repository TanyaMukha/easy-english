import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import ukTranslations from './locales/uk.json';
import enTranslations from './locales/en.json';

const LANGUAGE_STORAGE_KEY = 'app-language';

// Language resources
const resources = {
  uk: {
    translation: ukTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

// Get device language
const getDeviceLanguage = (): string => {
  const deviceLocales = getLocales();
  const deviceLanguage = deviceLocales[0]?.languageCode || 'uk';
  
  // Support only uk and en, default to uk for Ukrainian users
  return ['uk', 'en'].includes(deviceLanguage) ? deviceLanguage : 'uk';
};

// Custom language detector
const languageDetector = {
  type: 'languageDetector' as const,
  
  async: true,
  
  detect: async (callback: (language: string) => void) => {
    try {
      // Try to get saved language from AsyncStorage
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      
      if (savedLanguage) {
        callback(savedLanguage);
      } else {
        // Use device language as fallback
        const deviceLanguage = getDeviceLanguage();
        callback(deviceLanguage);
      }
    } catch (error) {
      console.warn('Error detecting language:', error);
      callback('uk'); // Fallback to Ukrainian
    }
  },
  
  init: () => {},
  
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.warn('Error saving language:', error);
    }
  },
};

// Initialize i18n
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    fallbackLng: 'uk',
    
    // Debug mode (disable in production)
    debug: __DEV__,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
    
    // Default namespace
    defaultNS: 'translation',
    
    // Key separator
    keySeparator: '.',
    
    // Namespace separator
    nsSeparator: ':',
  });

export default i18n;

// Helper function to change language
export const changeLanguage = async (language: string): Promise<void> => {
  try {
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error changing language:', error);
    throw error;
  }
};

// Helper function to get current language
export const getCurrentLanguage = (): string => {
  return i18n.language || 'uk';
};

// Helper function to get available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'uk', name: 'Українська', nativeName: 'Українська' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ];
};