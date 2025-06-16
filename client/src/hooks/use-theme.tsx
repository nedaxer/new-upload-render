
import { useState, useEffect } from 'react';

export type Theme = 'Light Mode' | 'Dark Mode' | 'Auto';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'Dark Mode';
  });

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'Auto') {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else if (newTheme === 'Dark Mode') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
  };

  // Apply theme on mount and listen for system changes
  useEffect(() => {
    applyTheme(theme);

    // Listen for system theme changes when theme is set to Auto
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'Auto') {
        applyTheme('Auto');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  return {
    theme,
    changeTheme,
    applyTheme
  };
}
