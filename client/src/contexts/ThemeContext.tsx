import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'Light Mode' | 'Dark Mode' | 'Auto';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  changeTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('Dark Mode');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark');

  // Apply theme to document and update CSS variables
  const applyTheme = (themeMode: Theme) => {
    const root = document.documentElement;
    let resolvedTheme: 'light' | 'dark';
    
    if (themeMode === 'Auto') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolvedTheme = themeMode === 'Dark Mode' ? 'dark' : 'light';
    }

    // Update CSS classes
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Update CSS custom properties for immediate effect
    if (resolvedTheme === 'dark') {
      root.style.setProperty('--background', '0 0% 3.9%');
      root.style.setProperty('--foreground', '0 0% 98%');
      root.style.setProperty('--card', '0 0% 3.9%');
      root.style.setProperty('--card-foreground', '0 0% 98%');
      root.style.setProperty('--popover', '0 0% 3.9%');
      root.style.setProperty('--popover-foreground', '0 0% 98%');
      root.style.setProperty('--primary', '39 100% 50%');
      root.style.setProperty('--primary-foreground', '0 0% 9%');
      root.style.setProperty('--secondary', '0 0% 14.9%');
      root.style.setProperty('--secondary-foreground', '0 0% 98%');
      root.style.setProperty('--muted', '0 0% 14.9%');
      root.style.setProperty('--muted-foreground', '0 0% 63.9%');
      root.style.setProperty('--accent', '0 0% 14.9%');
      root.style.setProperty('--accent-foreground', '0 0% 98%');
      root.style.setProperty('--destructive', '0 62.8% 30.6%');
      root.style.setProperty('--destructive-foreground', '0 0% 98%');
      root.style.setProperty('--border', '0 0% 14.9%');
      root.style.setProperty('--input', '0 0% 14.9%');
      root.style.setProperty('--ring', '39 100% 50%');
    } else {
      root.style.setProperty('--background', '0 0% 100%');
      root.style.setProperty('--foreground', '0 0% 3.9%');
      root.style.setProperty('--card', '0 0% 100%');
      root.style.setProperty('--card-foreground', '0 0% 3.9%');
      root.style.setProperty('--popover', '0 0% 100%');
      root.style.setProperty('--popover-foreground', '0 0% 3.9%');
      root.style.setProperty('--primary', '39 100% 50%');
      root.style.setProperty('--primary-foreground', '0 0% 98%');
      root.style.setProperty('--secondary', '0 0% 96.1%');
      root.style.setProperty('--secondary-foreground', '0 0% 9%');
      root.style.setProperty('--muted', '0 0% 96.1%');
      root.style.setProperty('--muted-foreground', '0 0% 45.1%');
      root.style.setProperty('--accent', '0 0% 96.1%');
      root.style.setProperty('--accent-foreground', '0 0% 9%');
      root.style.setProperty('--destructive', '0 84.2% 60.2%');
      root.style.setProperty('--destructive-foreground', '0 0% 98%');
      root.style.setProperty('--border', '0 0% 89.8%');
      root.style.setProperty('--input', '0 0% 89.8%');
      root.style.setProperty('--ring', '39 100% 50%');
    }

    setActualTheme(resolvedTheme);
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['Light Mode', 'Dark Mode', 'Auto'].includes(savedTheme)) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
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

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, changeTheme }}>
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