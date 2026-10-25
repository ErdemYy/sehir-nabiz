import React from 'react';
import { View, ActivityIndicator, type ViewStyle } from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from './AppText';

export interface LoadingStateProps {
  message?: string;
  style?: ViewStyle;
}

export function LoadingState({
  message = 'Yükleniyor...',
  style,
}: LoadingStateProps): React.ReactElement {
  const { theme, spacing } = useAppTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
        },
        style,
      ]}
    >
      <ActivityIndicator size="large" color={theme.primary} />
      {message ? (
        <AppText
          variant="bodyM"
          color={theme.textSecondary}
          style={{ marginTop: spacing.md }}
        >
          {message}
        </AppText>
      ) : null}
    </View>
  );
}
