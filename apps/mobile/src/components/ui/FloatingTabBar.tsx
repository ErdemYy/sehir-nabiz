import React from 'react';
import {
  View,
  Pressable,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Map, Newspaper, Plus, Bell, User } from 'lucide-react-native';
import { useAppTheme } from '../../theme';
import { AppText } from './AppText';

export interface TabItem {
  key: string;
  name: string;
  label: string;
  icon: (color: string, focused: boolean) => React.ReactNode;
  isAction?: boolean;
}

export interface FloatingTabBarProps {
  currentRoute: string;
  onSelectTab: (routeName: string) => void;
  style?: ViewStyle;
}

export const MAIN_TABS: TabItem[] = [
  {
    key: 'index',
    name: 'index',
    label: 'Harita',
    icon: (color, focused) => (
      <Map size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
    ),
  },
  {
    key: 'feed',
    name: 'feed',
    label: 'Akış',
    icon: (color, focused) => (
      <Newspaper size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
    ),
  },
  {
    key: 'create',
    name: 'create',
    label: 'Bildir',
    isAction: true,
    icon: () => <Plus size={26} color="#FFFFFF" strokeWidth={2.6} />,
  },
  {
    key: 'notifications',
    name: 'notifications',
    label: 'Bildirimler',
    icon: (color, focused) => (
      <Bell size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
    ),
  },
  {
    key: 'profile',
    name: 'profile',
    label: 'Profil',
    icon: (color, focused) => (
      <User size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
    ),
  },
];

export function FloatingTabBar({
  currentRoute,
  onSelectTab,
  style,
}: FloatingTabBarProps): React.ReactElement {
  const { theme, radii, spacing, shadows } = useAppTheme();
  const insets = useSafeAreaInsets();

  // Floating tab bar tabandan güvenli mesafe ile yüzer
  const bottomPadding = Math.max(insets.bottom, 12);

  const containerStyle: ViewStyle = {
    position: 'absolute',
    bottom: bottomPadding,
    left: spacing.lg,
    right: spacing.lg,
    height: 64,
    borderRadius: radii.sheet, // 24px radius
    backgroundColor: theme.tabBarBackground,
    borderWidth: 1,
    borderColor: theme.tabBarBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.sm,
    ...shadows.floating,
  };

  return (
    <View style={[containerStyle, style]}>
      {MAIN_TABS.map((tab) => {
        const isFocused = currentRoute === tab.name || (tab.name === 'index' && (currentRoute === '' || currentRoute === '/'));

        if (tab.isAction) {
          // Merkezi Öne Çıkarılmış "Bildir" Aksiyon Butonu
          return (
            <Pressable
              key={tab.key}
              onPress={() => onSelectTab(tab.name)}
              accessibilityRole="button"
              accessibilityLabel="Olay Bildir"
              accessibilityHint="Yeni bir kentsel olay veya durum bildirimi oluşturur"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [
                {
                  width: 50,
                  height: 50,
                  borderRadius: radii.pill,
                  backgroundColor: theme.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: -16, // Hafif yukarı taşan zarif floating hissi
                  borderWidth: 3,
                  borderColor: theme.surface,
                  ...shadows.elevation2,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                },
              ]}
            >
              {tab.icon('#FFFFFF', true)}
            </Pressable>
          );
        }

        const iconColor = isFocused ? theme.primary : theme.textSecondary;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelectTab(tab.name)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isFocused }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [
              {
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: spacing.xs,
                minWidth: 52,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            {tab.icon(iconColor, isFocused)}
            <AppText
              variant="label"
              weight={isFocused ? 'bold' : 'medium'}
              color={iconColor}
              style={{ marginTop: 2 }}
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
