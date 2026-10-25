import React, { useState } from 'react';
import {
  View,
  TextInput,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from './AppText';

export interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function AppInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}: AppInputProps): React.ReactElement {
  const { theme, radii, spacing, fontSizes, fontFamilies } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);

  const inputContainerStyle: ViewStyle = {
    height: 50,
    borderRadius: radii.medium, // 12px
    backgroundColor: theme.surfaceElevated,
    borderWidth: 1.5,
    borderColor: hasError
      ? theme.error
      : isFocused
      ? theme.borderFocus
      : theme.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  };

  return (
    <View style={[{ width: '100%', marginBottom: spacing.md }, containerStyle]}>
      {label ? (
        <AppText
          variant="bodyS"
          weight="semibold"
          color={hasError ? theme.error : theme.text}
          style={{ marginBottom: spacing.xs }}
        >
          {label}
        </AppText>
      ) : null}

      <View style={inputContainerStyle}>
        {leftIcon ? (
          <View style={{ marginRight: spacing.sm }}>{leftIcon}</View>
        ) : null}

        <TextInput
          placeholderTextColor={theme.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={{
            flex: 1,
            height: '100%',
            color: theme.text,
            fontSize: fontSizes.bodyM,
            fontFamily: fontFamilies.body.regular,
            includeFontPadding: false,
            paddingVertical: 0,
          }}
          {...props}
        />

        {rightIcon ? (
          <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View>
        ) : null}
      </View>

      {hasError ? (
        <AppText
          variant="caption"
          weight="medium"
          color={theme.error}
          style={{ marginTop: spacing.xxs }}
        >
          {error}
        </AppText>
      ) : helperText ? (
        <AppText
          variant="caption"
          color={theme.textSecondary}
          style={{ marginTop: spacing.xxs }}
        >
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}
