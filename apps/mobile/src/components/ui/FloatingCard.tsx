import React from 'react';
import {
  View,
  Pressable,
  type ViewStyle,
  type GestureResponderEvent,
} from 'react-native';
import { useAppTheme } from '../../theme';

export interface FloatingCardProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  padding?: number;
  accessibilityLabel?: string;
}

export function FloatingCard({
  children,
  onPress,
  style,
  padding,
  accessibilityLabel,
}: FloatingCardProps): React.ReactElement {
  const { theme, radii, spacing, shadows } = useAppTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.surfaceElevated,
    borderRadius: radii.card, // 20px radius
    borderWidth: 1,
    borderColor: theme.border,
    padding: padding ?? spacing.lg,
    ...shadows.floating,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          cardStyle,
          { opacity: pressed ? 0.94 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[cardStyle, style]}
    >
      {children}
    </View>
  );
}
