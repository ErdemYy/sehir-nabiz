import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Sun,
  Moon,
  Monitor,
  Bell,
  Shield,
  Lock,
  Info,
  EyeOff,
  CheckCircle2,
} from 'lucide-react-native';
import {
  AppScreen,
  AppHeader,
  AppCard,
  AppText,
  AppBadge,
} from '../../src/components/ui';
import { useAppTheme, type ThemeMode } from '../../src/theme';
import { useAuthStore } from '../../src/features/auth';
import { useNotificationPreferences } from '../../src/features/notifications';

export default function SettingsScreen(): React.ReactElement {
  const router = useRouter();
  const { theme, spacing, radii, themeMode, setThemeMode } = useAppTheme();
  const { isAuthenticated } = useAuthStore();
  const { preferences, updatePreferences, isUpdating } = useNotificationPreferences();

  // Yerel tercihler fallback'i (misafir kullanıcı veya yükleme anı için)
  const [localPrefs, setLocalPrefs] = useState({
    followedEvents: true,
    confirmedEvents: true,
    reportedEvents: true,
    nearbyEvents: false, // Gizlilik gereği varsayılan kapalıdır
    pushEnabled: true,
    inAppEnabled: true,
  });

  const currentPrefs = preferences || localPrefs;

  const handleTogglePref = async (key: string, value: boolean) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
    if (isAuthenticated) {
      try {
        await updatePreferences({ [key]: value });
      } catch (err) {
        Alert.alert('Hata', 'Bildirim tercihi kaydedilemedi.');
      }
    }
  };

  return (
    <AppScreen scrollable contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Üst Navigasyon */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Geri Dön"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 44,
            minWidth: 44,
            paddingRight: spacing.sm,
          }}
        >
          <ChevronLeft size={24} color={theme.text} />
          <AppText variant="bodyM" weight="semibold">
            Geri
          </AppText>
        </TouchableOpacity>

        <AppBadge label="v1.0.0 MVP" variant="default" size="sm" />
      </View>

      <AppHeader title="Ayarlar" subtitle="Uygulama, bildirim ve gizlilik tercihleriniz" />

      <View style={{ paddingHorizontal: spacing.lg }}>
        {/* 1. Görünüm & Tema Ayarları */}
        <AppCard style={{ marginBottom: spacing.lg, padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm }}>
            <Sun size={18} color={theme.primary} />
            <AppText variant="headingM" weight="bold">
              Görünüm & Tema
            </AppText>
          </View>
          <AppText variant="caption" color={theme.textSecondary} style={{ marginBottom: spacing.md }}>
            Arayüz renk şemasını seçin. Seçiminiz cihazınızda kalıcı olarak saklanır.
          </AppText>

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {[
              { id: 'light' as ThemeMode, label: 'Açık', icon: Sun },
              { id: 'dark' as ThemeMode, label: 'Koyu', icon: Moon },
              { id: 'system' as ThemeMode, label: 'Sistem', icon: Monitor },
            ].map(item => {
              const IconComp = item.icon;
              const isSelected = themeMode === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setThemeMode(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.label} tema`}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.xs,
                    paddingVertical: spacing.md,
                    borderRadius: radii.md,
                    backgroundColor: isSelected ? theme.primary + '18' : theme.surfaceElevated,
                    borderWidth: 1.5,
                    borderColor: isSelected ? theme.primary : theme.border,
                    minHeight: 44,
                  }}
                >
                  <IconComp size={16} color={isSelected ? theme.primary : theme.textSecondary} />
                  <AppText
                    variant="caption"
                    weight={isSelected ? 'bold' : 'regular'}
                    color={isSelected ? theme.primary : theme.text}
                  >
                    {item.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </AppCard>

        {/* 2. Bildirim Tercihleri */}
        <AppCard style={{ marginBottom: spacing.lg, padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Bell size={18} color={theme.primary} />
              <AppText variant="headingM" weight="bold">
                Bildirim Tercihleri
              </AppText>
            </View>
            {isUpdating && <ActivityIndicator size="small" color={theme.primary} />}
          </View>
          <AppText variant="caption" color={theme.textSecondary} style={{ marginBottom: spacing.md }}>
            Hangi olaylar hakkında uyarı almak istediğinizi belirleyin.
          </AppText>

          <View style={{ gap: spacing.md }}>
            {/* Bildirdiğim Olaylar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: spacing.sm }}>
                <AppText variant="bodyS" weight="medium">
                  Bildirdiğim Olaylar
                </AppText>
                <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 11 }}>
                  Oluşturduğunuz olayların onaylanma veya çözülme durumları
                </AppText>
              </View>
              <Switch
                value={currentPrefs.reportedEvents}
                onValueChange={v => handleTogglePref('reportedEvents', v)}
                trackColor={{ false: theme.border, true: theme.primary }}
                accessibilityLabel="Bildirdiğim Olaylar Bildirimleri"
              />
            </View>

            {/* Teyit Ettiğim Olaylar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: spacing.sm }}>
                <AppText variant="bodyS" weight="medium">
                  Teyit Ettiğim Olaylar
                </AppText>
                <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 11 }}>
                  "Gördüm" dediğiniz olaylar çözüldüğünde bildirim alın
                </AppText>
              </View>
              <Switch
                value={currentPrefs.confirmedEvents}
                onValueChange={v => handleTogglePref('confirmedEvents', v)}
                trackColor={{ false: theme.border, true: theme.primary }}
                accessibilityLabel="Teyit Ettiğim Olaylar Bildirimleri"
              />
            </View>

            {/* Yakınımdaki Gelişmeler */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <AppText variant="bodyS" weight="medium">
                    Yakınımdaki Gelişmeler
                  </AppText>
                  <AppBadge label="İsteğe Bağlı" variant="default" size="sm" />
                </View>
                <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 11 }}>
                  Konum gizliliği ilkesi gereği varsayılan olarak kapalıdır
                </AppText>
              </View>
              <Switch
                value={currentPrefs.nearbyEvents}
                onValueChange={v => handleTogglePref('nearbyEvents', v)}
                trackColor={{ false: theme.border, true: theme.primary }}
                accessibilityLabel="Yakınımdaki Gelişmeler Bildirimi"
              />
            </View>

            {/* Push Bildirimleri Anahtarı */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: spacing.sm }}>
                <AppText variant="bodyS" weight="medium">
                  Cihaz Push Bildirimleri
                </AppText>
                <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 11 }}>
                  Kritik kentsel uyarıları cihaz kilit ekranında göster
                </AppText>
              </View>
              <Switch
                value={currentPrefs.pushEnabled}
                onValueChange={v => handleTogglePref('pushEnabled', v)}
                trackColor={{ false: theme.border, true: theme.primary }}
                accessibilityLabel="Cihaz Push Bildirimleri"
              />
            </View>
          </View>
        </AppCard>

        {/* 3. Gizlilik ve Güvenlik İlkeleri */}
        <AppCard style={{ marginBottom: spacing.lg, padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm }}>
            <Shield size={18} color={theme.primary} />
            <AppText variant="headingM" weight="bold">
              Konum ve Veri Gizliliği
            </AppText>
          </View>

          <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs }}>
              <EyeOff size={16} color={theme.primary} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyS" weight="semibold">
                  Cihaz Konumu Asla Saklanmaz
                </AppText>
                <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 11 }}>
                  Yalnızca haritada işaretlediğiniz olay koordinatı kaydedilir. Cihazınızın anlık GPS konumu, hareket rotası veya geçmişi sunucuda tutulmaz.
                </AppText>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs }}>
              <CheckCircle2 size={16} color={theme.success} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyS" weight="semibold">
                  EXIF & GPS Temizleme Garantisi
                </AppText>
                <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 11 }}>
                  Fotoğraflar sunucuya yüklenmeden ve depolanmadan önce tüm cihaz ve kamera meta verileri tamamen silinir.
                </AppText>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs }}>
              <Lock size={16} color={theme.accentBlue} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyS" weight="semibold">
                  Yoğunluk Haritası k-Anonymity
                </AppText>
                <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 11 }}>
                  Isı haritasında tekil olayların konumu doğrudan gösterilmez; ızgara tabanlı mekânsal agregasyon ve seyrek hücre koruması uygulanır.
                </AppText>
              </View>
            </View>
          </View>
        </AppCard>

        {/* 4. Uygulama Hakkında */}
        <AppCard style={{ marginBottom: spacing.lg, padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm }}>
            <Info size={18} color={theme.textSecondary} />
            <AppText variant="headingM" weight="bold">
              Uygulama Hakkında
            </AppText>
          </View>

          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="caption" color={theme.textSecondary}>
                Sürüm
              </AppText>
              <AppText variant="caption" weight="semibold">
                1.0.0 (MVP)
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="caption" color={theme.textSecondary}>
                Harita Motoru
              </AppText>
              <AppText variant="caption" weight="semibold">
                MapLibre GL Native
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="caption" color={theme.textSecondary}>
                Karo Sağlayıcı
              </AppText>
              <AppText variant="caption" weight="semibold">
                OpenFreeMap (Açık Veri)
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="caption" color={theme.textSecondary}>
                Veri Tabanı & CBS
              </AppText>
              <AppText variant="caption" weight="semibold">
                PostgreSQL 16 / PostGIS 3.4
              </AppText>
            </View>
          </View>
        </AppCard>
      </View>
    </AppScreen>
  );
}
