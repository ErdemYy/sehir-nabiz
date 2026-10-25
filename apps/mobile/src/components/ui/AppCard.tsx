import React from 'react';
import {
  View,
  Pressable,
  type ViewStyle,
  type GestureResponderEvent,
} from 'react-native';
import { useAppTheme } from '../../theme';

export interface AppCardProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  padding?: number;
  accessibilityLabel?: string;
}

export function AppCard({
  children,
  onPress,
  style,
  padding,
  accessibilityLabel,
}: AppCardProps): React.ReactElement {
  const { theme, radii, spacing, shadows } = useAppTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.card,
    borderRadius: radii.card, // 20px radius
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: padding ?? spacing.lg,
    ...shadows.elevation1,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          cardStyle,
          { opacity: pressed ? 0.95 : 1 },
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
