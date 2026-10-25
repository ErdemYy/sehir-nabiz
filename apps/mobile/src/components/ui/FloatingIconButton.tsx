import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  type ViewStyle,
  type GestureResponderEvent,
} from 'react-native';
import { useAppTheme } from '../../theme';

export interface FloatingIconButtonProps {
  icon: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  active?: boolean;
  style?: ViewStyle;
  accessibilityLabel: string;
}

export function FloatingIconButton({
  icon,
  onPress,
  disabled = false,
  active = false,
  style,
  accessibilityLabel,
}: FloatingIconButtonProps): React.ReactElement {
  const { theme, radii, shadows } = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.92,
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

  const containerStyle: ViewStyle = {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: active ? theme.primary : theme.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: active ? theme.primaryDark : theme.border,
    ...shadows.floating,
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, containerStyle, style]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled, selected: active }}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
}
