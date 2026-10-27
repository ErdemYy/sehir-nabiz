import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Shield,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  FileText,
  Settings,
  LogOut,
  HelpCircle,
} from 'lucide-react-native';
import {
  AppScreen,
  AppHeader,
  AppAvatar,
  AppCard,
  AppText,
  AppBadge,
} from '../../src/components/ui';
import { useAppTheme } from '../../src/theme';
import { useAuthStore, AuthModal } from '../../src/features/auth';
import { useMyStats } from '../../src/features/users';
import { UserRole } from '@sehir-nabiz/shared';

export default function ProfileScreen(): React.ReactElement {
  const router = useRouter();
  const { theme, spacing, radii } = useAppTheme();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [reputationInfoVisible, setReputationInfoVisible] = useState(false);

  const { data: stats, isLoading: statsLoading } = useMyStats(isAuthenticated);

  const isModeratorOrAdmin =
    isAuthenticated &&
    user &&
    (user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN);

  const displayName = user?.displayName || (isAuthenticated ? 'Şehir Sakini' : 'Misafir Kullanıcı');
  const userEmail = user?.email || 'Oturum açılmadı';
  const reputationScore = stats?.reputationScore ?? (user?.reputationScore ?? 10);
  const reputationLevel = stats?.reputationLevel ?? 'Topluluk Gözlemcisi (Seviye 1)';

  const handleLogout = () => {
    Alert.alert(
      'Oturumu Kapat',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  };

  return (
    <AppScreen scrollable contentContainerStyle={{ paddingBottom: 100 }}>
      <AppHeader title="Profil" subtitle="Hesabınız, katkılarınız ve ayarlar" />

      <View style={{ padding: spacing.lg }}>
        {/* 1. Üst Premium Ama Sade Profil Kartı */}
        <AppCard style={{ marginBottom: spacing.lg, padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <AppAvatar name={displayName} size="xl" isVerified={isAuthenticated} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
                <AppText variant="headingM" weight="bold">
                  {displayName}
                </AppText>
                {isAuthenticated && (
                  <AppBadge
                    label={user?.role === UserRole.ADMIN ? 'Yönetici' : user?.role === UserRole.MODERATOR ? 'Moderatör' : 'Doğrulanmış'}
                    variant={user?.role === UserRole.ADMIN || user?.role === UserRole.MODERATOR ? 'warning' : 'primary'}
                    size="sm"
                  />
                )}
              </View>

              <AppText variant="caption" color={theme.textSecondary} style={{ marginTop: 2 }}>
                {userEmail}
              </AppText>

              {/* İtibar Seviyesi Barı */}
              <TouchableOpacity
                onPress={() => setReputationInfoVisible(prev => !prev)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: spacing.xs + 2,
                }}
              >
                <Shield size={14} color={theme.primary} />
                <AppText variant="caption" weight="bold" color={theme.primary}>
                  {reputationScore} İtibar Puanı
                </AppText>
                <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 11 }}>
                  • {reputationLevel.split(' (')[0]}
                </AppText>
                <HelpCircle size={12} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* İtibar Açıklama Bilgisi (Açılır/Kapanır) */}
          {reputationInfoVisible && (
            <View
              style={{
                marginTop: spacing.md,
                padding: spacing.sm + 2,
                backgroundColor: theme.surfaceElevated,
                borderRadius: radii.sm,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <AppText variant="caption" weight="bold" style={{ marginBottom: 2 }}>
                İtibar Puanı Nedir?
              </AppText>
              <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 11, lineHeight: 16 }}>
                ŞehirNabız'da paylaştığınız teyitli olaylar (+5 puan) itibarınızı artırır. Yanıltıcı veya asılsız bildirimler itibar puanınızı düşürür. Yüksek puanlı kullanıcıların bildirimleri daha hızlı yayına alınır.
              </AppText>
            </View>
          )}

          {/* Oturum Açma Çağrısı (Misafir kullanıcı için) */}
          {!isAuthenticated && (
            <View style={{ marginTop: spacing.md, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: spacing.sm }}>
              <TouchableOpacity
                onPress={() => setAuthModalVisible(true)}
                style={{
                  backgroundColor: theme.primary,
                  paddingVertical: spacing.sm + 2,
                  borderRadius: radii.md,
                  alignItems: 'center',
                  minHeight: 44,
                  justifyContent: 'center',
                }}
              >
                <AppText variant="bodyM" weight="bold" color="#FFFFFF">
                  Giriş Yap / Kayıt Ol
                </AppText>
              </TouchableOpacity>
            </View>
          )}
        </AppCard>

        {/* 2. Gerçek Katkı İstatistikleri (3'lü Sayaç Kartı) */}
        {isAuthenticated && (
          <AppCard style={{ marginBottom: spacing.lg, padding: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
              <AppText variant="bodyM" weight="bold">
                Kentsel Katkı Özeti
              </AppText>
              {statsLoading && <ActivityIndicator size="small" color={theme.primary} />}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: spacing.xs }}>
              {/* Bildirdiğim */}
              <TouchableOpacity
                onPress={() => router.push('/profile/my-events')}
                style={{ alignItems: 'center', flex: 1 }}
              >
                <AppText variant="headingL" weight="bold" color={theme.primary}>
                  {stats?.reportedCount ?? 0}
                </AppText>
                <AppText variant="caption" color={theme.textSecondary} style={{ marginTop: 2, fontSize: 11 }}>
                  Bildirdiğim
                </AppText>
              </TouchableOpacity>

              <View style={{ width: 1, height: 28, backgroundColor: theme.border }} />

              {/* Teyit Ettiğim */}
              <View style={{ alignItems: 'center', flex: 1 }}>
                <AppText variant="headingL" weight="bold" color={theme.accentBlue}>
                  {stats?.confirmedCount ?? 0}
                </AppText>
                <AppText variant="caption" color={theme.textSecondary} style={{ marginTop: 2, fontSize: 11 }}>
                  Teyit Ettiğim
                </AppText>
              </View>

              <View style={{ width: 1, height: 28, backgroundColor: theme.border }} />

              {/* Çözülen */}
              <View style={{ alignItems: 'center', flex: 1 }}>
                <AppText variant="headingL" weight="bold" color={theme.success}>
                  {stats?.resolvedCount ?? 0}
                </AppText>
                <AppText variant="caption" color={theme.textSecondary} style={{ marginTop: 2, fontSize: 11 }}>
                  Çözülen
                </AppText>
              </View>
            </View>
          </AppCard>
        )}

        {/* 3. Düzenli Eylem Grupları */}
        <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
          {/* Bildirdiğim Olaylar */}
          <AppCard
            onPress={() => {
              if (isAuthenticated) {
                router.push('/profile/my-events');
              } else {
                setAuthModalVisible(true);
              }
            }}
            style={{ padding: spacing.md }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <FileText size={20} color={theme.primary} />
                <View>
                  <AppText variant="bodyM" weight="semibold">
                    Bildirdiğim Olaylar
                  </AppText>
                  <AppText variant="caption" color={theme.textSecondary}>
                    İnceleme, yayında ve çözülen bildirimleriniz
                  </AppText>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} />
            </View>
          </AppCard>

          {/* Uygulama Ayarları */}
          <AppCard
            onPress={() => router.push('/profile/settings')}
            style={{ padding: spacing.md }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Settings size={20} color={theme.primary} />
                <View>
                  <AppText variant="bodyM" weight="semibold">
                    Ayarlar
                  </AppText>
                  <AppText variant="caption" color={theme.textSecondary}>
                    Görünüm, bildirimler ve gizlilik politikası
                  </AppText>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} />
            </View>
          </AppCard>

          {/* Moderatör Paneli (Yetkili kullanıcılar) */}
          {isModeratorOrAdmin && (
            <AppCard
              onPress={() => router.push('/moderation')}
              style={{
                padding: spacing.md,
                borderColor: '#F59E0B',
                backgroundColor: '#FEF3C7',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <ShieldAlert size={20} color="#B45309" />
                  <View>
                    <AppText variant="bodyM" weight="bold" color="#92400E">
                      Moderatör Yönetim Paneli
                    </AppText>
                    <AppText variant="caption" color="#B45309">
                      Bekleyen ve ihtilaflı olayları incele
                    </AppText>
                  </View>
                </View>
                <ChevronRight size={18} color="#B45309" />
              </View>
            </AppCard>
          )}

          {/* Oturumu Kapat */}
          {isAuthenticated && (
            <AppCard onPress={handleLogout} style={{ padding: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <LogOut size={20} color={theme.error} />
                  <AppText variant="bodyM" weight="semibold" color={theme.error}>
                    Oturumu Kapat
                  </AppText>
                </View>
                <ChevronRight size={18} color={theme.error} />
              </View>
            </AppCard>
          )}
        </View>

        {/* 4. Geliştirici UI Showcase Bağlantısı (__DEV__) */}
        {__DEV__ && (
          <AppCard
            onPress={() => router.push('/showcase')}
            style={{
              borderColor: theme.primary,
              backgroundColor: theme.primaryLight,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
        )}
      </View>

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />
    </AppScreen>
  );
}
