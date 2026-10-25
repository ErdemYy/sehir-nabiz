import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { useAppTheme } from '../../theme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  title,
  description,
  icon,
  actionTitle,
  onAction,
  style,
}: EmptyStateProps): React.ReactElement {
  const { theme, spacing, radii } = useAppTheme();

  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing['3xl'],
        },
        style,
      ]}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radii.pill,
          backgroundColor: theme.surfaceElevated,
          borderWidth: 1,
          borderColor: theme.border,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.lg,
        }}
      >
        {icon || <Inbox size={32} color={theme.textSecondary} strokeWidth={1.5} />}
      </View>

      <AppText
        variant="headingM"
        weight="bold"
        align="center"
        style={{ marginBottom: spacing.xs }}
      >
        {title}
      </AppText>

      {description ? (
        <AppText
          variant="bodyM"
          color={theme.textSecondary}
          align="center"
          style={{ marginBottom: actionTitle ? spacing.xl : 0 }}
        >
          {description}
        </AppText>
      ) : null}

      {actionTitle && onAction ? (
        <AppButton
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="sm"
        />
      ) : null}
    </View>
  );
}
