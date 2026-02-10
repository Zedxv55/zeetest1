import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('zeelink-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zeelink-theme', theme);
    const root = window.document.documentElement;
    
    // Set data-theme attribute for global CSS variables
    root.setAttribute('data-theme', theme);
    
    // Manage class for Tailwind
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Ensure background color matches via inline style as a fallback/enforcer
    if (theme === 'light') {
      root.style.backgroundColor = '#FAF8F3';
      root.style.color = '#1a1a1a';
    } else {
      root.style.backgroundColor = '#1a1a1a';
      root.style.color = '#ffffff';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};