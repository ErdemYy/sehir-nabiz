import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Moon, Sun, Monitor, Shield, Sparkles, ChevronRight, MapPin, ShieldAlert } from 'lucide-react-native';
import {
  AppScreen,
  AppHeader,
  AppAvatar,
  AppCard,
  AppText,
  AppBadge,
} from '../../src/components/ui';
import { useAppTheme, type ThemeMode } from '../../src/theme';
import { useAuthStore } from '../../src/features/auth';
import { UserRole } from '@sehir-nabiz/shared';

export default function ProfileScreen(): React.ReactElement {
  const router = useRouter();
  const { theme, spacing, radii, themeMode, setThemeMode } = useAppTheme();
  const { user, isAuthenticated } = useAuthStore();

  const isModeratorOrAdmin =
    isAuthenticated &&
    user &&
    (user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN);

  return (
    <AppScreen scrollable contentContainerStyle={{ paddingBottom: 100 }}>
      <AppHeader title="Profil" subtitle="Hesabınız ve tercihleriniz" />

      <View style={{ padding: spacing.lg }}>
        {/* Kullanıcı Bilgi Kartı */}
        <AppCard style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <AppAvatar name="Caner Yılmaz" size="xl" isVerified />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <AppText variant="headingM" weight="bold">
                  Caner Yılmaz
                </AppText>
                <AppBadge label="Güvenilir Yazar" variant="primary" size="sm" />
              </View>
              <AppText variant="caption" color={theme.textSecondary} style={{ marginTop: 2 }}>
                Kayseri • Katılım: Ekim 2026
              </AppText>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  marginTop: spacing.sm,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Shield size={14} color={theme.primary} />
                  <AppText variant="caption" weight="bold" color={theme.primary}>
                    İtibar Puanı: 84
                  </AppText>
                </View>
              </View>
            </View>
          </View>
        </AppCard>

        {/* Görünüm & Tema Ayarları */}
        <AppCard style={{ marginBottom: spacing.lg }}>
          <AppText
            variant="headingM"
            weight="bold"
            style={{ marginBottom: spacing.sm }}
          >
            Tema Tercihi
          </AppText>
          <AppText
            variant="bodyS"
            color={theme.textSecondary}
            style={{ marginBottom: spacing.md }}
          >
            Uygulama renk şemasını seçin veya sistem ayarını kullanın.
          </AppText>

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {(
              [
                { mode: 'light', label: 'Açık', icon: Sun },
                { mode: 'dark', label: 'Koyu', icon: Moon },
                { mode: 'system', label: 'Sistem', icon: Monitor },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const isSelected = themeMode === item.mode;
              return (
                <Pressable
                  key={item.mode}
                  onPress={() => setThemeMode(item.mode as ThemeMode)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.label} Tema`}
                  accessibilityState={{ selected: isSelected }}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: radii.large,
                    backgroundColor: isSelected ? theme.primaryLight : theme.surfaceElevated,
                    borderColor: isSelected ? theme.primary : theme.border,
                    borderWidth: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.xs,
                  }}
                >
                  <Icon
                    size={16}
                    color={isSelected ? theme.primaryDark : theme.textSecondary}
                  />
                  <AppText
                    variant="bodyS"
                    weight={isSelected ? 'bold' : 'medium'}
                    color={isSelected ? theme.primaryDark : theme.text}
                  >
                    {item.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </AppCard>

        {/* Gizlilik & Konum Bilgisi */}
        <AppCard style={{ marginBottom: spacing.lg }}>
          <AppText variant="headingM" weight="bold" style={{ marginBottom: spacing.xs }}>
            Güvenli Konum Politikası
          </AppText>
          <AppText variant="bodyS" color={theme.textSecondary} style={{ marginBottom: spacing.sm }}>
            Kişisel ev ve iş konumlarınız sunucularda açık koordinat olarak saklanmaz. Olay bildirimlerinde yalnızca kamuya açık aksaklığın gerçekleştiği kesin nokta doğrulanır; bildiren kullanıcının anlık cihaz konumu asla paylaşılmaz.
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MapPin size={16} color={theme.success} />
            <AppText variant="caption" weight="semibold" color={theme.success}>
              KVKK & Konum Güvenlik Standardı Aktif
            </AppText>
          </View>
        </AppCard>

        {/* Yetkili Moderatör Paneli Bağlantısı */}
        {isModeratorOrAdmin || __DEV__ ? (
          <AppCard
            onPress={() => router.push('/moderation')}
            style={{
              marginBottom: spacing.lg,
              borderColor: '#F59E0B',
              backgroundColor: '#FEF3C7',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <ShieldAlert size={20} color="#B45309" />
                <View>
                  <AppText variant="bodyM" weight="bold" color="#92400E">
                    Moderatör Yönetim Paneli
                  </AppText>
                  <AppText variant="caption" color="#B45309">
                    Topluluk olaylarını incele, onayla veya reddet
                  </AppText>
                </View>
              </View>
              <ChevronRight size={18} color="#B45309" />
            </View>
          </AppCard>
        ) : null}

        {/* Geliştirici UI Showcase Bağlantısı */}
        {__DEV__ ? (
          <AppCard
            onPress={() => router.push('/showcase')}
            style={{
              borderColor: theme.primary,
              backgroundColor: theme.primaryLight,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Sparkles size={20} color={theme.primaryDark} />
                <View>
                  <AppText variant="bodyM" weight="bold" color={theme.primaryDark}>
                    Tasarım Sistemi UI Showcase
                  </AppText>
                  <AppText variant="caption" color={theme.primaryDark}>
                    Tüm bileşenleri ve renk paletini canlı incele
                  </AppText>
                </View>
              </View>
              <ChevronRight size={18} color={theme.primaryDark} />
            </View>
          </AppCard>
        ) : null}
      </View>
    </AppScreen>
  );
}
