import React, { useState } from 'react';
import {
  View,
  TextInput,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from './AppText';

export interface AppTextAreaProps extends Omit<TextInputProps, 'style' | 'multiline'> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  minHeight?: number;
  containerStyle?: ViewStyle;
}

export function AppTextArea({
  label,
  error,
  helperText,
  maxLength,
  minHeight = 110,
  containerStyle,
  value = '',
  onChangeText,
  onFocus,
  onBlur,
  ...props
}: AppTextAreaProps): React.ReactElement {
  const { theme, radii, spacing, fontSizes, fontFamilies } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);
  const currentLength = value?.length ?? 0;

  const inputContainerStyle: ViewStyle = {
    minHeight,
    borderRadius: radii.medium, // 12px
    backgroundColor: theme.surfaceElevated,
    borderWidth: 1.5,
    borderColor: hasError
      ? theme.error
      : isFocused
      ? theme.borderFocus
      : theme.border,
    padding: spacing.md,
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
        <TextInput
          multiline
          textAlignVertical="top"
          maxLength={maxLength}
          value={value}
          onChangeText={onChangeText}
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
            minHeight: minHeight - spacing.md * 2,
            color: theme.text,
            fontSize: fontSizes.bodyM,
            fontFamily: fontFamilies.body.regular,
            includeFontPadding: false,
            padding: 0,
          }}
          {...props}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: spacing.xxs,
        }}
      >
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          {hasError ? (
            <AppText variant="caption" weight="medium" color={theme.error}>
              {error}
            </AppText>
          ) : helperText ? (
            <AppText variant="caption" color={theme.textSecondary}>
              {helperText}
            </AppText>
          ) : null}
        </View>

        {maxLength !== undefined ? (
          <AppText
            variant="caption"
            color={currentLength >= maxLength ? theme.error : theme.textMuted}
          >
            {`${currentLength} / ${maxLength}`}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
