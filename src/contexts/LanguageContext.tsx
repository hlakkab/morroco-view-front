import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n, { initializeI18n, saveLanguage } from '../translations/i18n';

// Create a context for language
interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  initialized: boolean;
}

const initialContext: LanguageContextType = {
  currentLanguage: 'en',
  setLanguage: () => {},
  initialized: false,
};

const LanguageContext = createContext<LanguageContextType>(initialContext);

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.locale || 'en');
  const [initialized, setInitialized] = useState(false);

  // Initialize i18n with saved language preferences
  useEffect(() => {
    const init = async () => {
      await initializeI18n();
      setCurrentLanguage(i18n.locale);
      setInitialized(true);
    };
    
    init();
  }, []);

  // Function to change the language
  const setLanguage = (language: string) => {
    i18n.locale = language;
    saveLanguage(language);
    setCurrentLanguage(language);
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        currentLanguage,
        setLanguage,
        initialized
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext; 