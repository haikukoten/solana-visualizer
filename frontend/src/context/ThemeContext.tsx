import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { darkTheme, lightTheme } from '../theme';

type Theme = typeof darkTheme; // Use darkTheme structure as the base type
type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check localStorage for saved preference, default to dark
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    return savedMode || 'dark';
  });

  useEffect(() => {
    // Update localStorage when mode changes
    localStorage.setItem('themeMode', mode);
    // Optional: Apply a class to body or root element if needed for global CSS
    // document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 