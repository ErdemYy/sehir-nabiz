/**
 * ŞehirNabız Tipografi Tokenları
 * Başlık Fontu: Plus Jakarta Sans
 * Gövde Fontu: Manrope
 */

export const fontFamilies = {
  heading: {
    regular: 'PlusJakartaSans_400Regular',
    medium: 'PlusJakartaSans_500Medium',
    semibold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
    extrabold: 'PlusJakartaSans_800ExtraBold',
  },
  body: {
    regular: 'Manrope_400Regular',
    medium: 'Manrope_500Medium',
    semibold: 'Manrope_600SemiBold',
    bold: 'Manrope_700Bold',
    extrabold: 'Manrope_800ExtraBold',
  },
  // Platform fallback
  systemHeading: 'System',
  systemBody: 'System',
} as const;

export const fontSizes = {
  label: 11,
  caption: 12,
  bodyS: 13,
  bodyM: 14,
  bodyL: 16,
  headingM: 18,
  headingL: 20,
  headingXL: 24,
  display: 32,
  // Geriye dönük uyumluluk
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  // Geriye dönük uyumluluk
  light: '300',
} as const;

export const lineHeights = {
  label: 14,
  caption: 16,
  bodyS: 18,
  bodyM: 20,
  bodyL: 24,
  headingM: 24,
  headingL: 28,
  headingXL: 32,
  display: 40,
  // Oransal
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export const letterSpacings = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  label: 0.5,
} as const;

export interface TypographyVariantStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  letterSpacing?: number;
}

export type TypographyVariantName =
  | 'display'
  | 'headingXL'
  | 'headingL'
  | 'headingM'
  | 'bodyL'
  | 'bodyM'
  | 'bodyS'
  | 'caption'
  | 'label';

export const typographyVariants: Record<TypographyVariantName, TypographyVariantStyle> = {
  display: {
    fontSize: fontSizes.display,
    lineHeight: lineHeights.display,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headingXL: {
    fontSize: fontSizes.headingXL,
    lineHeight: lineHeights.headingXL,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headingL: {
    fontSize: fontSizes.headingL,
    lineHeight: lineHeights.headingL,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  headingM: {
    fontSize: fontSizes.headingM,
    lineHeight: lineHeights.headingM,
    fontWeight: '600',
  },
  bodyL: {
    fontSize: fontSizes.bodyL,
    lineHeight: lineHeights.bodyL,
    fontWeight: '400',
  },
  bodyM: {
    fontSize: fontSizes.bodyM,
    lineHeight: lineHeights.bodyM,
    fontWeight: '400',
  },
  bodyS: {
    fontSize: fontSizes.bodyS,
    lineHeight: lineHeights.bodyS,
    fontWeight: '400',
  },
  caption: {
    fontSize: fontSizes.caption,
    lineHeight: lineHeights.caption,
    fontWeight: '400',
  },
  label: {
    fontSize: fontSizes.label,
    lineHeight: lineHeights.label,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
};
