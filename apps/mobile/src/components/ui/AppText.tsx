import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useAppTheme } from '../../theme';
import type { fontWeights, TypographyVariantName, TypographyVariantStyle } from '@sehir-nabiz/design-tokens';

export type TextVariant = TypographyVariantName;

export type TextWeight = keyof typeof fontWeights;

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  weight?: TextWeight;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  children: React.ReactNode;
}

export function AppText({
  variant = 'bodyM',
  color,
  weight,
  align,
  style,
  children,
  allowFontScaling = true,
  ...props
}: AppTextProps): React.ReactElement {
  const { theme, typographyVariants, fontFamilies } = useAppTheme();

  const variantStyle: TypographyVariantStyle = typographyVariants[variant] ?? typographyVariants.bodyM;
  const isHeading = variant === 'display' || variant.startsWith('heading');

  const selectedWeight = weight || (variantStyle.fontWeight === '700' ? 'bold' : variantStyle.fontWeight === '600' ? 'semibold' : 'regular');

  const fontFamily: string = isHeading
    ? fontFamilies.heading[selectedWeight as keyof typeof fontFamilies.heading] || fontFamilies.heading.regular
    : fontFamilies.body[selectedWeight as keyof typeof fontFamilies.body] || fontFamilies.body.regular;

  const resolvedColor = color || (variant === 'caption' ? theme.textSecondary : variant === 'label' ? theme.textSecondary : theme.text);

  const combinedStyle: TextStyle = {
    fontSize: variantStyle.fontSize,
    lineHeight: variantStyle.lineHeight,
    letterSpacing: variantStyle.letterSpacing,
    color: resolvedColor,
    textAlign: align,
    fontFamily,
    includeFontPadding: false,
  };

  return (
    <Text
      allowFontScaling={allowFontScaling}
      style={[combinedStyle, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
