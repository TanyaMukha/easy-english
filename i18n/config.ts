// i18n/config.ts - Fixed configuration with proper web support
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Import language resources
import en from './locales/en.json';
import uk from './locales/uk.json';

const LANGUAGE_STORAGE_KEY = '@easy_english_language';

/**
 * Web-compatible storage wrapper with proper error handling
 */
const webCompatibleStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        // Check if localStorage is available
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        console.warn('localStorage not available in current environment');
        return null;
      } catch (error) {
        console.warn('localStorage access failed:', error);
        return null;
      }
    }
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        // Check if localStorage is available
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
          return;
        }
        console.warn('localStorage not available for saving');
        return;
      } catch (error) {
        console.warn('localStorage save failed:', error);
        return;
      }
    }
    return AsyncStorage.setItem(key, value);
  }
};

/**
 * Language detection with proper async handling
 */
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  
  detect: async (callback: (lng: string) => void) => {
    try {
      // Try to get saved language preference
      const savedLanguage = await webCompatibleStorage.getItem(LANGUAGE_STORAGE_KEY);
      
      if (savedLanguage) {
        console.log('Using saved language:', savedLanguage);
        callback(savedLanguage);
        return;
      }

      // Fallback to system language detection
      let systemLanguage = 'uk'; // Default fallback
      
      if (Platform.OS === 'web') {
        // Web platform - check navigator language
        if (typeof navigator !== 'undefined' && navigator.language) {
          const browserLang = navigator.language.toLowerCase();
          systemLanguage = browserLang.startsWith('uk') || 
                          browserLang.startsWith('ru') ? 'uk' : 'en';
        }
      } else {
        // Native platform - you might want to use expo-localization here
        systemLanguage = 'uk';
      }

      console.log('Using system language:', systemLanguage);
      callback(systemLanguage);
      
    } catch (error) {
      console.error('Error detecting language:', error);
      callback('uk'); // Safe fallback
    }
  },

  init: () => {
    // Language detector initialization
    console.log('Language detector initialized');
  },

  cacheUserLanguage: async (language: string) => {
    try {
      await webCompatibleStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      console.log('Language cached:', language);
    } catch (error) {
      console.error('Error caching language:', error);
    }
  }
};

/**
 * Initialize i18n with proper configuration
 */
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    debug: __DEV__, // Only show debug logs in development
    
    fallbackLng: 'uk',
    
    resources: {
      en: { translation: en },
      uk: { translation: uk }
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false, // Important for React Native compatibility
    },

    // Key and namespace configuration
    keySeparator: '.',
    nsSeparator: ':',
    
    // Reduce console spam in production
    saveMissing: false,
    updateMissing: false,
    
    // Performance optimizations
    load: 'languageOnly', // Don't load region-specific variants
    preload: ['uk', 'en'], // Preload supported languages
  });

export default i18n;