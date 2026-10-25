import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import {
  lightTheme,
  darkTheme,
  type ThemeColors,
  spacing,
  radii,
  shadows,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  typographyVariants,
  fontFamilies,
  palette,
} from '@sehir-nabiz/design-tokens';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: typeof shadows;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  lineHeights: typeof lineHeights;
  letterSpacings: typeof letterSpacings;
  typographyVariants: typeof typographyVariants;
  fontFamilies: typeof fontFamilies;
  palette: typeof palette;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode = 'light' }: ThemeProviderProps): React.ReactElement {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialMode);

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const theme = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  const toggleTheme = useMemo(() => {
    return () => {
      setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      theme,
      isDark,
      themeMode,
      setThemeMode,
      toggleTheme,
      spacing,
      radii,
      shadows,
      fontSizes,
      fontWeights,
      lineHeights,
      letterSpacings,
      typographyVariants,
      fontFamilies,
      palette,
    };
  }, [theme, isDark, themeMode, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    // Context dışı fallback (örn. test ortamı)
    return {
      theme: lightTheme,
      isDark: false,
      themeMode: 'light',
      setThemeMode: () => {},
      toggleTheme: () => {},
      spacing,
      radii,
      shadows,
      fontSizes,
      fontWeights,
      lineHeights,
      letterSpacings,
      typographyVariants,
      fontFamilies,
      palette,
    };
  }
  return context;
}
