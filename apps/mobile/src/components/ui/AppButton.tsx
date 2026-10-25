import React, { useRef } from 'react';
import {
  Pressable,
  ActivityIndicator,
  Animated,
  type ViewStyle,
  type GestureResponderEvent,
} from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: AppButtonProps): React.ReactElement {
  const { theme, radii, spacing } = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  // Yükseklik ve padding kuralları
  const heightMap: Record<ButtonSize, number> = {
    sm: 38,
    md: 52, // Primary spesifikasyon 52px
    lg: 56,
  };

  const paddingHMap: Record<ButtonSize, number> = {
    sm: spacing.md,
    md: spacing.xl,
    lg: spacing.xxl,
  };

  // Varyanta göre arka plan, border ve metin rengi
  let backgroundColor: string = theme.primary;
  let borderColor = 'transparent';
  let borderWidth = 0;
  let textColor = '#FFFFFF';

  switch (variant) {
    case 'primary':
      backgroundColor = disabled ? (theme.border) : theme.primary;
      textColor = disabled ? theme.textMuted : '#FFFFFF';
      break;
    case 'secondary':
      backgroundColor = disabled ? theme.background : theme.surface;
      borderColor = theme.border;
      borderWidth = 1;
      textColor = disabled ? theme.textMuted : theme.text;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      borderColor = disabled ? theme.border : theme.primary;
      borderWidth = 1.5;
      textColor = disabled ? theme.textMuted : theme.primary;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      textColor = disabled ? theme.textMuted : theme.primary;
      break;
    case 'destructive':
      backgroundColor = disabled ? theme.border : theme.error;
      textColor = disabled ? theme.textMuted : '#FFFFFF';
      break;
  }

  const containerStyle: ViewStyle = {
    height: heightMap[size],
    paddingHorizontal: paddingHMap[size],
    borderRadius: radii.large, // 16px radius
    backgroundColor,
    borderColor,
    borderWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && { width: '100%' }]}>
      <Pressable
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled, busy: loading }}
        style={[containerStyle, style]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <>
            {leftIcon ? <Animated.View style={{ marginRight: spacing.sm }}>{leftIcon}</Animated.View> : null}
            <AppText
              variant={size === 'sm' ? 'bodyS' : 'bodyL'}
              weight="semibold"
              color={textColor}
              numberOfLines={1}
            >
              {title}
            </AppText>
            {rightIcon ? <Animated.View style={{ marginLeft: spacing.sm }}>{rightIcon}</Animated.View> : null}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
