import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from './AppText';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  borderBottom?: boolean;
  style?: ViewStyle;
}

export function AppHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
  borderBottom = false,
  style,
}: AppHeaderProps): React.ReactElement {
  const { theme, spacing } = useAppTheme();

  return (
    <View
      style={[
        {
          height: subtitle ? 64 : 54,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          backgroundColor: theme.surface,
          borderBottomWidth: borderBottom ? StyleSheet.hairlineWidth : 0,
          borderBottomColor: theme.border,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {leftAction ? <View style={{ marginRight: spacing.sm }}>{leftAction}</View> : null}
        <View style={{ flex: 1 }}>
          <AppText variant="headingL" weight="bold" numberOfLines={1}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" color={theme.textSecondary} numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>

      {rightAction ? (
        <View style={{ marginLeft: spacing.sm }}>{rightAction}</View>
      ) : null}
    </View>
  );
}
