import React from 'react';
import { View, Image, type ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { useAppTheme } from '../../theme';
import { AppText } from './AppText';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AppAvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  isVerified?: boolean;
  style?: ViewStyle;
}

export function AppAvatar({
  uri,
  name,
  size = 'md',
  isVerified = false,
  style,
}: AppAvatarProps): React.ReactElement {
  const { theme, radii } = useAppTheme();

  const dimensionMap: Record<AvatarSize, number> = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  const dimension = dimensionMap[size];

  // İsmin baş harflerini alma (örn. "Ahmet Yılmaz" -> "AY")
  const getInitials = (text?: string): string => {
    if (!text) return 'ŞN';
    const parts = text.trim().split(' ').filter(Boolean);
    const firstPart = parts[0];
    const secondPart = parts[1];
    if (parts.length >= 2 && firstPart && secondPart) {
      return ((firstPart[0] ?? '') + (secondPart[0] ?? '')).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: radii.pill,
    backgroundColor: theme.primaryLight,
    borderWidth: 1.5,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  };

  const badgeSize = size === 'sm' ? 12 : size === 'md' ? 14 : 18;

  return (
    <View style={[containerStyle, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: dimension - 3,
            height: dimension - 3,
            borderRadius: radii.pill,
          }}
          accessibilityLabel={name ? `${name} profil resmi` : 'Profil resmi'}
        />
      ) : (
        <AppText
          variant={size === 'sm' ? 'caption' : size === 'xl' ? 'headingL' : 'bodyM'}
          weight="bold"
          color={theme.primaryDark}
        >
          {getInitials(name)}
        </AppText>
      )}

      {isVerified ? (
        <View
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: badgeSize,
            height: badgeSize,
            borderRadius: radii.pill,
            backgroundColor: theme.primary,
            borderWidth: 1.5,
            borderColor: theme.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={badgeSize - 5} color="#FFFFFF" strokeWidth={3} />
        </View>
      ) : null}
    </View>
  );
}
