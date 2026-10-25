import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  type ViewStyle,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useAppTheme } from '../../theme';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Şehirde olay, sokak veya ilçe ara...',
  onFocus,
  onBlur,
  rightAction,
  style,
}: SearchBarProps): React.ReactElement {
  const { theme, radii, spacing, shadows, fontSizes, fontFamilies } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  const containerStyle: ViewStyle = {
    height: 48,
    borderRadius: radii.large, // 16px radius
    backgroundColor: theme.surfaceElevated,
    borderWidth: 1,
    borderColor: isFocused ? theme.borderFocus : theme.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    ...shadows.elevation1,
  };

  return (
    <View style={[containerStyle, style]}>
      <Search
        size={20}
        color={isFocused ? theme.primary : theme.textSecondary}
        strokeWidth={2}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        accessibilityLabel="Arama çubuğu"
        accessibilityRole="search"
        returnKeyType="search"
        style={{
          flex: 1,
          height: '100%',
          marginLeft: spacing.sm,
          marginRight: spacing.xs,
          color: theme.text,
          fontSize: fontSizes.bodyM,
          fontFamily: fontFamilies.body.regular,
          includeFontPadding: false,
          paddingVertical: 0,
        }}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={handleClear}
          accessibilityLabel="Aramayı temizle"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ padding: spacing.xs }}
        >
          <X size={18} color={theme.textSecondary} />
        </Pressable>
      ) : null}
      {rightAction ? (
        <View style={{ marginLeft: spacing.xs }}>{rightAction}</View>
      ) : null}
    </View>
  );
}
