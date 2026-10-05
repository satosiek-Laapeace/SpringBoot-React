import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

const getStoredLanguage = () => {
  try {
    const savedLanguage = localStorage.getItem('craftfarm_lang');
    return savedLanguage === 'km' || savedLanguage === 'en' ? savedLanguage : 'en';
  } catch {
    return 'en';
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getStoredLanguage);

  useEffect(() => {
    const normalizedLanguage = language === 'km' ? 'km' : 'en';
    document.documentElement.setAttribute('lang', normalizedLanguage);
    try {
      localStorage.setItem('craftfarm_lang', normalizedLanguage);
    } catch {
      // Ignore storage failures in restricted browser contexts.
    }
  }, [language]);

  const toggleLanguage = (lang) => {
    const nextLang = lang || (language === 'en' ? 'km' : 'en');
    setLanguage(nextLang === 'km' ? 'km' : 'en');
  };

  const t = (key) => {
    const activeLanguage = language === 'km' ? 'km' : 'en';
    const langDict = translations[activeLanguage] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
