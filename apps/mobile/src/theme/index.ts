import { useColorScheme } from 'react-native';
import {
  lightTheme,
  darkTheme,
  ThemeColors,
  spacing,
  radii,
  fontSizes,
  fontWeights,
  palette,
} from '@sehir-nabiz/design-tokens';

export function useAppTheme(): {
  theme: ThemeColors;
  isDark: boolean;
  spacing: typeof spacing;
  radii: typeof radii;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  palette: typeof palette;
} {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    theme: isDark ? darkTheme : lightTheme,
    isDark,
    spacing,
    radii,
    fontSizes,
    fontWeights,
    palette,
  };
}

export * from '@sehir-nabiz/design-tokens';
