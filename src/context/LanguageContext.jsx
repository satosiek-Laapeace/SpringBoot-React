import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('craftfarm_lang') || 'en';
  });

  const toggleLanguage = (lang) => {
    const nextLang = lang || (language === 'en' ? 'km' : 'en');
    setLanguage(nextLang);
    localStorage.setItem('craftfarm_lang', nextLang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
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
