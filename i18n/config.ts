// i18n/config.ts - Fix AsyncStorage for web platform
/**
 * Fixed i18n configuration with proper web support
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Import language resources
import en from './locales/en.json';
import uk from './locales/uk.json';

const LANGUAGE_STORAGE_KEY = '@easy_english_language';

// Web-compatible AsyncStorage wrapper
const webCompatibleStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn('localStorage not available:', error);
        return null;
      }
    }
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
        return;
      } catch (error) {
        console.warn('localStorage not available:', error);
        return;
      }
    }
    return AsyncStorage.setItem(key, value);
  }
};

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Try to get saved language
      const savedLanguage = await webCompatibleStorage.getItem(LANGUAGE_STORAGE_KEY);
      
      if (savedLanguage) {
        console.log('Using saved language:', savedLanguage);
        callback(savedLanguage);
        return;
      }

      // Fallback to system language
      let systemLanguage = 'uk'; // Default fallback
      
      if (Platform.OS === 'web') {
        // Web platform
        if (typeof navigator !== 'undefined') {
          systemLanguage = navigator.language?.startsWith('uk') || 
                          navigator.language?.startsWith('ru') ? 'uk' : 'en';
        }
      } else {
        // Native platform - you might want to use expo-localization here
        systemLanguage = 'uk';
      }

      console.log('Using system language:', systemLanguage);
      callback(systemLanguage);
      
    } catch (error) {
      console.error('Error detecting language:', error);
      callback('uk'); // Fallback
    }
  },

  init: () => {
    // Initialization if needed
  },

  cacheUserLanguage: async (language: string) => {
    try {
      await webCompatibleStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      console.log('Language cached:', language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }
};

// Initialize i18n
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    debug: __DEV__, // Only debug in development
    
    fallbackLng: 'uk',
    
    resources: {
      en: { translation: en },
      uk: { translation: uk }
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false, // Important for React Native
    },

    // Disable key separation if you prefer flat structure
    keySeparator: '.',
    nsSeparator: ':',
  });

export default i18n;