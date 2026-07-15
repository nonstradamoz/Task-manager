import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { getTheme, AppTheme } from '../theme';

interface ThemeContextValue {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { settings, setThemeMode, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const isDark = useMemo(() => {
    if (settings.themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return settings.themeMode === 'dark';
  }, [settings.themeMode, systemColorScheme]);

  const theme = useMemo(
    () => getTheme(isDark, settings.accentColor),
    [isDark, settings.accentColor]
  );

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
