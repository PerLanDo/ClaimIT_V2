import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// MSU-IIT Color Palette
export const MSUColors = {
  // Primary Colors
  gorse: '#fef15a',
  pohutukawa: '#930215',
  anzac: '#e2b048',
  rawSienna: '#ce813a',
  energyYellow: '#f7d853',
  tuscany: '#ba542e',
  laserLemon: '#fffe5e',
  roofTerracotta: '#a51d21',
  candyCorn: '#fbe556',

  // Extended palette for UI elements
  primary: '#930215', // pohutukawa - main brand color
  secondary: '#e2b048', // anzac - accent color
  accent: '#fef15a', // gorse - highlight color
  warning: '#f7d853', // energy yellow
  success: '#ce813a', // raw sienna
  error: '#a51d21', // roof terracotta

  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  lightGray: '#f8f9fa',
  gray: '#6c757d',
  darkGray: '#343a40',
};

export interface Theme {
  colors: {
    // Brand colors
    primary: string;
    secondary: string;
    accent: string;

    // Background colors
    background: string;
    surface: string;
    card: string;

    // Text colors
    text: string;
    textSecondary: string;
    textOnPrimary: string;

    // UI elements
    border: string;
    placeholder: string;
    success: string;
    warning: string;
    error: string;

    // MSU-IIT specific colors
    msuPrimary: string;
    msuSecondary: string;
    msuAccent: string;
  };
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    primary: MSUColors.pohutukawa,
    secondary: MSUColors.anzac,
    accent: MSUColors.gorse,

    background: '#ffffff',
    surface: '#f8f9fa',
    card: '#ffffff',

    text: '#212529',
    textSecondary: '#6c757d',
    textOnPrimary: '#ffffff',

    border: '#dee2e6',
    placeholder: '#adb5bd',
    success: MSUColors.rawSienna,
    warning: MSUColors.energyYellow,
    error: MSUColors.roofTerracotta,

    msuPrimary: MSUColors.pohutukawa,
    msuSecondary: MSUColors.anzac,
    msuAccent: MSUColors.gorse,
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    primary: MSUColors.pohutukawa,
    secondary: MSUColors.anzac,
    accent: MSUColors.gorse,

    background: '#1a1a1a',
    surface: '#2d2d2d',
    card: '#363636',

    text: '#ffffff',
    textSecondary: '#adb5bd',
    textOnPrimary: '#ffffff',

    border: '#495057',
    placeholder: '#6c757d',
    success: MSUColors.rawSienna,
    warning: MSUColors.energyYellow,
    error: MSUColors.roofTerracotta,

    msuPrimary: MSUColors.pohutukawa,
    msuSecondary: MSUColors.anzac,
    msuAccent: MSUColors.gorse,
  },
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

const THEME_STORAGE_KEY = 'app_theme_mode';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDark(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (darkMode: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(darkMode));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    saveThemePreference(newTheme);
  };

  const setTheme = (darkMode: boolean) => {
    setIsDark(darkMode);
    saveThemePreference(darkMode);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
