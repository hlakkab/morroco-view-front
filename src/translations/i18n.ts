import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18n-js';
import { I18nManager } from 'react-native';

// Import translations
import en from './en';
import fr from './fr';

// Available languages
export const translations = {
  en,
  fr,
};

// Set the supported languages
i18n.translations = translations;

// Set the default locale to English
i18n.defaultLocale = 'en';

// Set the fallback locale
i18n.fallbacks = true;

// Language codes to display names
export const languageNames = {
  en: 'English',
  fr: 'Français',
};

// Storage key for language preference
const LANGUAGE_KEY = '@language';

// Save the selected language
export const saveLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error('Failed to save language preference', error);
  }
};

// Load the saved language
export const loadLanguage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch (error) {
    console.error('Failed to load language preference', error);
    return null;
  }
};

// Initialize i18n with saved language or device locale
export const initializeI18n = async () => {
  // Load saved language preference
  const savedLanguage = await loadLanguage();
  
  // Use saved language or device locale if available, or fallback to English
  const locale = savedLanguage || i18n.defaultLocale;
  
  // Set the locale
  i18n.locale = locale;
  
  // For RTL languages like Arabic (not used yet but included for future)
  I18nManager.allowRTL(locale === 'ar');
  I18nManager.forceRTL(locale === 'ar');
};

export default i18n; 