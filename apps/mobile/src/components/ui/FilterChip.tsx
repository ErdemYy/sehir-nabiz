import React from 'react';
import {
  Pressable,
  View,
  type ViewStyle,
  type GestureResponderEvent,
} from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from './AppText';

export interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: (event: GestureResponderEvent) => void;
  count?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

export function FilterChip({
  label,
  selected,
  onPress,
  count,
  icon,
  disabled = false,
  style,
}: FilterChipProps): React.ReactElement {
  const { theme, radii, spacing } = useAppTheme();

  const containerStyle: ViewStyle = {
    height: 36,
    borderRadius: radii.pill, // 999 pill
    paddingHorizontal: spacing.md,
    backgroundColor: selected ? theme.primaryLight : theme.surfaceElevated,
    borderColor: selected ? theme.primary : theme.border,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
  };

  const textColor = selected ? theme.primaryDark : theme.textSecondary;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={`${label}${count !== undefined ? `, ${count} sonuç` : ''}`}
      accessibilityState={{ selected, disabled }}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      style={[containerStyle, style]}
    >
      {icon ? <View style={{ marginRight: spacing.xs }}>{icon}</View> : null}
      <AppText
        variant="bodyS"
        weight={selected ? 'semibold' : 'medium'}
        color={textColor}
      >
        {label}
      </AppText>
      {count !== undefined ? (
        <View
          style={{
            marginLeft: spacing.xs,
            paddingHorizontal: spacing.xs,
            paddingVertical: 1,
            borderRadius: radii.pill,
            backgroundColor: selected ? theme.primary : theme.border,
          }}
        >
          <AppText
            variant="label"
            weight="bold"
            color={selected ? '#FFFFFF' : theme.textMuted}
          >
            {count.toString()}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}
