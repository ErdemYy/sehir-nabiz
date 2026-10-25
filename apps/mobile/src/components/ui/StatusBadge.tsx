import React from 'react';
import { type ViewStyle } from 'react-native';
import { CheckCircle2, Clock, Check, AlertOctagon } from 'lucide-react-native';
import { EventStatus } from '@sehir-nabiz/shared';
import { AppBadge, type BadgeSize, type BadgeType } from './AppBadge';
import { useAppTheme } from '../../theme';

export interface StatusBadgeProps {
  status: EventStatus;
  size?: BadgeSize;
  type?: BadgeType;
  style?: ViewStyle;
}

export function StatusBadge({
  status,
  size = 'md',
  type = 'subtle',
  style,
}: StatusBadgeProps): React.ReactElement {
  const { theme } = useAppTheme();
  const iconSize = size === 'sm' ? 12 : 14;

  switch (status) {
    case EventStatus.ACTIVE:
      return (
        <AppBadge
          label="Aktif"
          variant="success"
          type={type}
          size={size}
          icon={<CheckCircle2 size={iconSize} color={theme.success} />}
          style={style}
        />
      );
    case EventStatus.PENDING_REVIEW:
      return (
        <AppBadge
          label="İncelemede"
          variant="warning"
          type={type}
          size={size}
          icon={<Clock size={iconSize} color={theme.warning} />}
          style={style}
        />
      );
    case EventStatus.RESOLVED:
      return (
        <AppBadge
          label="Çözüldü"
          variant="primary"
          type={type}
          size={size}
          icon={<Check size={iconSize} color={theme.primary} />}
          style={style}
        />
      );
    case EventStatus.REJECTED:
      return (
        <AppBadge
          label="Reddedildi"
          variant="error"
          type={type}
          size={size}
          icon={<AlertOctagon size={iconSize} color={theme.error} />}
          style={style}
        />
      );
    default:
      return (
        <AppBadge
          label={status}
          variant="default"
          type={type}
          size={size}
          style={style}
        />
      );
  }
}
