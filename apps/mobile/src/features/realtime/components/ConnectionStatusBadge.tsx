import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react-native';
import { AppText } from '../../../components/ui';
import { useAppTheme } from '../../../theme';
import type { RealtimeConnectionStatus } from '../services/socketService';

export interface ConnectionStatusBadgeProps {
  status: RealtimeConnectionStatus;
  onPress?: () => void;
}

export function ConnectionStatusBadge({
  status,
  onPress,
}: ConnectionStatusBadgeProps): React.ReactElement {
  const { theme, spacing, radii } = useAppTheme();

  // Duruma göre metin ve renk konfigürasyonu
  const config = React.useMemo(() => {
    switch (status) {
      case 'connected':
        return {
          label: 'Canlı',
          dotColor: theme.success,
          bgColor: theme.surfaceElevated,
          textColor: theme.textSecondary,
          borderColor: theme.border,
          Icon: Wifi,
        };
      case 'syncing':
        return {
          label: 'Güncelleniyor',
          dotColor: theme.primary,
          bgColor: theme.surfaceElevated,
          textColor: theme.textSecondary,
          borderColor: theme.primary,
          Icon: RefreshCw,
        };
      case 'reconnecting':
        return {
          label: 'Bağlanıyor...',
          dotColor: theme.warning,
          bgColor: theme.surfaceElevated,
          textColor: theme.warning,
          borderColor: theme.warning,
          Icon: RefreshCw,
        };
      case 'connecting':
        return {
          label: 'Bağlanıyor',
          dotColor: theme.info,
          bgColor: theme.surfaceElevated,
          textColor: theme.textSecondary,
          borderColor: theme.border,
          Icon: RefreshCw,
        };
      case 'disconnected':
      default:
        return {
          label: 'Çevrimdışı',
          dotColor: theme.textMuted,
          bgColor: theme.surfaceElevated,
          textColor: theme.textMuted,
          borderColor: theme.border,
          Icon: WifiOff,
        };
    }
  }, [status, theme]);

  const { Icon } = config;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.sm + 2,
          paddingVertical: 4,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: config.dotColor,
          },
        ]}
      />
      <Icon size={12} color={config.textColor} />
      <AppText
        variant="caption"
        weight="medium"
        style={{ color: config.textColor, fontSize: 11 }}
      >
        {config.label}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
