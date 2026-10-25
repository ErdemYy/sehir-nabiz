import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from './AppText';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeType = 'subtle' | 'filled' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface AppBadgeProps {
  label: string;
  variant?: BadgeVariant;
  type?: BadgeType;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function AppBadge({
  label,
  variant = 'default',
  type = 'subtle',
  size = 'md',
  icon,
  style,
}: AppBadgeProps): React.ReactElement {
  const { theme, radii, spacing } = useAppTheme();

  // Renk haritası
  const colorMap = {
    default: {
      filled: theme.textSecondary,
      subtleBg: theme.border,
      text: theme.text,
      border: theme.border,
    },
    primary: {
      filled: theme.primary,
      subtleBg: theme.primaryLight,
      text: theme.primaryDark,
      border: theme.primary,
    },
    success: {
      filled: theme.success,
      subtleBg: theme.successLight,
      text: theme.success,
      border: theme.success,
    },
    warning: {
      filled: theme.warning,
      subtleBg: theme.warningLight,
      text: theme.warning,
      border: theme.warning,
    },
    error: {
      filled: theme.error,
      subtleBg: theme.errorLight,
      text: theme.error,
      border: theme.error,
    },
    info: {
      filled: theme.info,
      subtleBg: theme.infoLight,
      text: theme.info,
      border: theme.info,
    },
  };

  const selectedColor = colorMap[variant];

  let backgroundColor: string;
  let borderColor = 'transparent';
  let borderWidth = 0;
  let textColor: string;

  if (type === 'filled') {
    backgroundColor = selectedColor.filled;
    textColor = '#FFFFFF';
  } else if (type === 'outline') {
    backgroundColor = 'transparent';
    borderColor = selectedColor.border;
    borderWidth = 1;
    textColor = selectedColor.text;
  } else {
    // subtle
    backgroundColor = selectedColor.subtleBg;
    textColor = selectedColor.text;
  }

  const containerStyle: ViewStyle = {
    paddingHorizontal: size === 'sm' ? spacing.xs : spacing.sm,
    paddingVertical: size === 'sm' ? 2 : spacing.xxs,
    borderRadius: radii.pill,
    backgroundColor,
    borderColor,
    borderWidth,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  };

  return (
    <View style={[containerStyle, style]}>
      {icon ? <View style={{ marginRight: 4 }}>{icon}</View> : null}
      <AppText
        variant={size === 'sm' ? 'label' : 'caption'}
        weight="semibold"
        color={textColor}
      >
        {label}
      </AppText>
    </View>
  );
}
