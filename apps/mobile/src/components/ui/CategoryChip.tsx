import React from 'react';
import {
  Pressable,
  View,
  type ViewStyle,
  type GestureResponderEvent,
} from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from './AppText';
import type { EventCategory } from '@sehir-nabiz/shared';

export interface CategoryChipProps {
  categoryCode: EventCategory | string;
  nameTr: string;
  selected: boolean;
  onPress: (event: GestureResponderEvent) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

export function CategoryChip({
  categoryCode,
  nameTr,
  selected,
  onPress,
  icon,
  disabled = false,
  style,
}: CategoryChipProps): React.ReactElement {
  const { theme, radii, spacing, palette, shadows } = useAppTheme();

  const categoryColor =
    palette.categories[categoryCode as keyof typeof palette.categories] ||
    palette.categories.OTHER;

  const containerStyle: ViewStyle = {
    height: 38,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: selected ? categoryColor : theme.surfaceElevated,
    borderColor: selected ? categoryColor : theme.border,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.elevation1,
    opacity: disabled ? 0.5 : 1,
  };

  const textColor = selected ? '#FFFFFF' : theme.text;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Kategori filtresi: ${nameTr}`}
      accessibilityState={{ selected, disabled }}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      style={[containerStyle, style]}
    >
      {/* Kategori renk gösterge noktası */}
      {!selected ? (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: categoryColor,
            marginRight: spacing.xs,
          }}
        />
      ) : null}
      {icon ? <View style={{ marginRight: spacing.xs }}>{icon}</View> : null}
      <AppText
        variant="bodyS"
        weight={selected ? 'semibold' : 'medium'}
        color={textColor}
      >
        {nameTr}
      </AppText>
    </Pressable>
  );
}
