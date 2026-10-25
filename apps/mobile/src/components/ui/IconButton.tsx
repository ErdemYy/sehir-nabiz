import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  type ViewStyle,
  type GestureResponderEvent,
} from 'react-native';
import { useAppTheme } from '../../theme';

export type IconButtonVariant = 'ghost' | 'surface' | 'primary' | 'outline';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps {
  icon: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel: string;
}

export function IconButton({
  icon,
  onPress,
  variant = 'surface',
  size = 'md',
  disabled = false,
  style,
  accessibilityLabel,
}: IconButtonProps): React.ReactElement {
  const { theme, radii } = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const sizeMap: Record<IconButtonSize, number> = {
    sm: 36,
    md: 44, // Minimum iOS erişilebilir dokunma hedefi
    lg: 52,
  };

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.94,
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

  let backgroundColor = 'transparent';
  let borderColor = 'transparent';
  let borderWidth = 0;

  switch (variant) {
    case 'surface':
      backgroundColor = disabled ? theme.border : theme.surface;
      borderColor = theme.border;
      borderWidth = 1;
      break;
    case 'primary':
      backgroundColor = disabled ? theme.border : theme.primary;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      borderColor = disabled ? theme.border : theme.primary;
      borderWidth = 1.5;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      break;
  }

  const dimension = sizeMap[size];

  const buttonStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: radii.medium,
    backgroundColor,
    borderColor,
    borderWidth,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        style={[buttonStyle, style]}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
}
