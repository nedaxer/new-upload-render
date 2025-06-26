import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'blue' | 'white' | 'black';

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
  blue: {
    background: 'bg-blue-950',
    secondaryBackground: 'bg-blue-900',
    card: 'bg-blue-900 border-blue-800',
    border: 'border-blue-800',
    text: 'text-white'
  },
  white: {
    background: 'bg-white',
    secondaryBackground: 'bg-gray-50',
    card: 'bg-white border-gray-200',
    border: 'border-gray-200',
    text: 'text-gray-900'
  },
  black: {
    background: 'bg-black',
    secondaryBackground: 'bg-gray-900',
    card: 'bg-gray-900 border-gray-700',
    border: 'border-gray-700',
    text: 'text-white'
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('blue');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme && ['blue', 'white', 'black'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
    
    // Update chart theme if chart exists
    if ((window as any).tvWidget) {
      const chartTheme = newTheme === 'white' ? 'Light' : 'Dark';
      (window as any).tvWidget.changeTheme(chartTheme);
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