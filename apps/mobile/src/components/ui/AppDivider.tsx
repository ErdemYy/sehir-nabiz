import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from './AppText';

export interface AppDividerProps {
  label?: string;
  spacingVertical?: number;
  style?: ViewStyle;
}

export function AppDivider({
  label,
  spacingVertical,
  style,
}: AppDividerProps): React.ReactElement {
  const { theme, spacing } = useAppTheme();
  const vSpace = spacingVertical ?? spacing.md;

  if (label) {
    return (
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: vSpace,
          },
          style,
        ]}
      >
        <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: theme.border }} />
        <AppText
          variant="caption"
          color={theme.textSecondary}
          style={{ paddingHorizontal: spacing.sm }}
        >
          {label}
        </AppText>
        <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: theme.border }} />
      </View>
    );
  }

  return (
    <View
      style={[
        {
          height: StyleSheet.hairlineWidth,
          backgroundColor: theme.border,
          marginVertical: vSpace,
        },
        style,
      ]}
    />
  );
}
