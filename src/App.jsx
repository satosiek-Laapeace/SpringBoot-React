import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { StoreProvider } from './context/StoreContext';
import { AppRoutes } from './routes/AppRoutes';

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <StoreProvider>
            <AppRoutes />
          </StoreProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
