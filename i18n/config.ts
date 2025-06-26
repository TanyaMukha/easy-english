import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files (correct paths for your structure)
import en from './locales/en.json';
import uk from './locales/uk.json';

// Language detector for AsyncStorage
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Try to get saved language from AsyncStorage
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
      
      // Fallback to device language
      const deviceLanguage = Localization.locale;
      const supportedLanguages = ['en', 'uk'];
      const detectedLanguage = deviceLanguage.split('-')[0];
      
      if (supportedLanguages.includes(detectedLanguage)) {
        callback(detectedLanguage);
      } else {
        // Default to Ukrainian for Ukrainian users, English for others
        callback('uk');
      }
    } catch (error) {
      console.error('Error detecting language:', error);
      callback('uk'); // Default fallback
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('user-language', lng);
    } catch (error) {
      console.error('Error caching language:', error);
    }
  },
};

// Initialize i18n
i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    // Fallback language
    fallbackLng: 'uk',
    
    // Debug mode (set to false in production)
    debug: __DEV__,
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Translation resources
    resources: {
      en: {
        translation: en,
      },
      uk: {
        translation: uk,
      },
    },
    
    // React options
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
    
    // Compatibility options
    compatibilityJSON: 'v3',
    
    // Namespace configuration
    ns: ['translation'],
    defaultNS: 'translation',
    
    // Load languages synchronously
    initImmediate: false,
  });

export default i18n;

// Helper function to change language
export const changeLanguage = async (language: string) => {
  try {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem('user-language', language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Helper function to get current language
export const getCurrentLanguage = (): string => {
  return i18n.language || 'uk';
};

// Helper function to get available languages
export const getAvailableLanguages = (): string[] => {
  return ['en', 'uk'];
};