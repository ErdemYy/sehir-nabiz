import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useAppTheme } from '../../theme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryTitle?: string;
  style?: ViewStyle;
}

export function ErrorState({
  title = 'Bir Hata Oluştu',
  message = 'İçerik yüklenirken bir sorun meydana geldi. Lütfen tekrar deneyin.',
  onRetry,
  retryTitle = 'Tekrar Dene',
  style,
}: ErrorStateProps): React.ReactElement {
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
          backgroundColor: theme.errorLight,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <AlertTriangle size={32} color={theme.error} strokeWidth={2} />
      </View>

      <AppText
        variant="headingM"
        weight="bold"
        color={theme.error}
        align="center"
        style={{ marginBottom: spacing.xs }}
      >
        {title}
      </AppText>

      <AppText
        variant="bodyM"
        color={theme.textSecondary}
        align="center"
        style={{ marginBottom: onRetry ? spacing.xl : 0 }}
      >
        {message}
      </AppText>

      {onRetry ? (
        <AppButton
          title={retryTitle}
          onPress={onRetry}
          variant="outline"
          size="sm"
        />
      ) : null}
    </View>
  );
}
