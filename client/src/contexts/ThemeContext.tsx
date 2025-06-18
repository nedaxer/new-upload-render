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

    // Force background color changes for immediate visual feedback
    document.body.style.backgroundColor = resolvedTheme === 'dark' ? '#0a0a0a' : '#ffffff';
    document.body.style.color = resolvedTheme === 'dark' ? '#ffffff' : '#000000';
    
    // Apply theme to all page elements
    const themeClasses = resolvedTheme === 'dark' 
      ? ['bg-gray-900', 'text-white'] 
      : ['bg-white', 'text-black'];
    
    // Update all existing gray-900/black backgrounds
    const darkElements = document.querySelectorAll('.bg-gray-900, .bg-black');
    darkElements.forEach(el => {
      if (resolvedTheme === 'light') {
        el.classList.remove('bg-gray-900', 'bg-black');
        el.classList.add('bg-white');
      }
    });
    
    const lightElements = document.querySelectorAll('.bg-white');
    lightElements.forEach(el => {
      if (resolvedTheme === 'dark') {
        el.classList.remove('bg-white');
        el.classList.add('bg-gray-900');
      }
    });
    
    // Update text colors
    const whiteText = document.querySelectorAll('.text-white');
    whiteText.forEach(el => {
      if (resolvedTheme === 'light') {
        el.classList.remove('text-white');
        el.classList.add('text-black');
      }
    });
    
    const blackText = document.querySelectorAll('.text-black');
    blackText.forEach(el => {
      if (resolvedTheme === 'dark') {
        el.classList.remove('text-black');
        el.classList.add('text-white');
      }
    });

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