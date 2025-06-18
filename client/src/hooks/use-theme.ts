import { useState, useEffect } from 'react';

export type Theme = 'Light Mode' | 'Dark Mode' | 'Auto';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('Dark Mode');

  // Apply theme to document
  const applyTheme = (themeMode: Theme) => {
    const root = document.documentElement;
    
    if (themeMode === 'Auto') {
      // Follow system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else if (themeMode === 'Dark Mode') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to system preference if no saved theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'Dark Mode' : 'Light Mode';
      setTheme(defaultTheme);
      applyTheme(defaultTheme);
    }
  }, []);

  // Listen for system theme changes when in Auto mode
  useEffect(() => {
    if (theme !== 'Auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme('Auto');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  return {
    theme,
    changeTheme,
    applyTheme
  };
}