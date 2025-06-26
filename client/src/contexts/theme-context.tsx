import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'ultramarine';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  getBackgroundClass: () => string;
  getCardClass: () => string;
  getBorderClass: () => string;
  getTextClass: () => string;
  getSecondaryBackgroundClass: () => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeConfig = {
  ultramarine: {
    background: 'bg-blue-800',
    secondaryBackground: 'bg-blue-700',
    card: 'bg-blue-700 border-blue-600',
    border: 'border-blue-600',
    text: 'text-white'
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('ultramarine');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme && savedTheme === 'ultramarine') {
      setThemeState(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
    
    // Update chart theme if chart exists
    if ((window as any).tvWidget) {
      (window as any).tvWidget.changeTheme('Dark');
    }
  };

  const getBackgroundClass = () => themeConfig[theme].background;
  const getCardClass = () => themeConfig[theme].card;
  const getBorderClass = () => themeConfig[theme].border;
  const getTextClass = () => themeConfig[theme].text;
  const getSecondaryBackgroundClass = () => themeConfig[theme].secondaryBackground;

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      getBackgroundClass,
      getCardClass,
      getBorderClass,
      getTextClass,
      getSecondaryBackgroundClass
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}