import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  type ViewStyle,
  type GestureResponderEvent,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { useAppTheme } from '../../theme';

export interface FloatingActionButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function FloatingActionButton({
  onPress,
  icon,
  disabled = false,
  style,
  accessibilityLabel = 'Aksiyon Butonu',
}: FloatingActionButtonProps): React.ReactElement {
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
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: disabled ? theme.border : theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.floating,
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
        accessibilityState={{ disabled }}
        style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon || <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />}
      </Pressable>
    </Animated.View>
  );
}
