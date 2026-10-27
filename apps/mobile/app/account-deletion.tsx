import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldAlert, Lock } from 'lucide-react-native';
import {
  AppScreen,
  AppHeader,
  AppCard,
  AppText,
  AppBadge,
} from '../src/components/ui';
import { useAppTheme } from '../src/theme';
import { getApiBaseUrl } from '../src/config/env';

export default function WebAccountDeletionScreen(): React.ReactElement {
  const router = useRouter();
  const { theme, spacing, radii } = useAppTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [isImmediate, setIsImmediate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setStatusMessage('E-posta ve şifre zorunludur.');
      setIsSuccess(false);
      return;
    }

    try {
      setIsLoading(true);
      setStatusMessage(null);

      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/users/web-deletion-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          reason: reason.trim() || undefined,
          immediate: isImmediate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        setStatusMessage(
          data.message || 'Silme talebiniz başarıyla alındı ve işlendi.',
        );
        setEmail('');
        setPassword('');
        setReason('');
      } else {
        setIsSuccess(false);
        setStatusMessage(
          data.message || 'Silme talebi işlenemedi. Bilgilerinizi kontrol ediniz.',
        );
      }
    } catch (err: any) {
      setIsSuccess(false);
      setStatusMessage('Bağlantı hatası: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppScreen scrollable contentContainerStyle={{ paddingBottom: 60 }}>
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
          }}
        >
          <ChevronLeft size={24} color={theme.text} />
          <AppText variant="bodyM" weight="semibold">
            Geri
          </AppText>
        </TouchableOpacity>

        <AppBadge label="KVKK & Apple Uyumlu" variant="default" size="sm" />
      </View>

      <AppHeader
        title="Hesap Silme Talebi"
        subtitle="ŞehirNabız kullanıcı ve kişisel veri imha akışı"
      />

      <View style={{ paddingHorizontal: spacing.lg }}>
        <AppCard style={{ marginBottom: spacing.lg, padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
            <Lock size={18} color={theme.primary} />
            <AppText variant="headingM" weight="bold">
              Veri Yaşam Döngüsü Taahhüdü
            </AppText>
          </View>
          <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 12, lineHeight: 18 }}>
            6698 Sayılı KVKK ve mağaza kuralları uyarınca; hesap kimliğiniz, e-posta adresiniz, şifreniz, bildirim tercihleriniz ve tüm aktif cihaz belirteçleriniz sistemden kalıcı olarak imha edilir. Şehir güvenliği adına kentsel olay kayıtları anonimleştirilerek korunur.
          </AppText>
        </AppCard>

        <AppCard style={{ padding: spacing.md, gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <ShieldAlert size={20} color="#EF4444" />
            <AppText variant="headingM" weight="bold" color="#EF4444">
              Silme Talebi Formu
            </AppText>
          </View>

          {statusMessage && (
            <View
              style={{
                backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: isSuccess ? '#10B981' : '#EF4444',
                borderWidth: 1,
                borderRadius: radii.md,
                padding: spacing.sm,
              }}
            >
              <AppText
                variant="bodyS"
                weight="semibold"
                color={isSuccess ? '#10B981' : '#EF4444'}
              >
                {statusMessage}
              </AppText>
            </View>
          )}

          <View style={{ gap: 6 }}>
            <AppText variant="bodyS" weight="semibold">
              Kayıtlı E-posta Adresi
            </AppText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="ornek@domain.com"
              placeholderTextColor={theme.textSecondary}
              style={{
                backgroundColor: theme.background,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: radii.md,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: theme.text,
                fontSize: 14,
              }}
            />
          </View>

          <View style={{ gap: 6 }}>
            <AppText variant="bodyS" weight="semibold">
              Hesap Şifresi
            </AppText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Mevcut şifreniz"
              placeholderTextColor={theme.textSecondary}
              style={{
                backgroundColor: theme.background,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: radii.md,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: theme.text,
                fontSize: 14,
              }}
            />
          </View>

          <View style={{ gap: 6 }}>
            <AppText variant="bodyS" weight="semibold">
              Gerekçe (İsteğe Bağlı)
            </AppText>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Ayrılma nedeninizi belirtebilirsiniz"
              placeholderTextColor={theme.textSecondary}
              style={{
                backgroundColor: theme.background,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: radii.md,
                paddingHorizontal: 12,
                paddingVertical: 8,
                color: theme.text,
                fontSize: 13,
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <AppText variant="caption" color={theme.textSecondary}>
              Hemen Kalıcı Olarak Sil
            </AppText>
            <Switch
              value={isImmediate}
              onValueChange={setIsImmediate}
              trackColor={{ false: theme.border, true: '#EF4444' }}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Hesabımı ve Verilerimi Sil"
            style={{
              backgroundColor: '#EF4444',
              borderRadius: radii.full,
              paddingVertical: 14,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
              marginTop: spacing.xs,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <AppText variant="bodyM" weight="bold" color="#fff">
                Hesabımı ve Verilerimi Sil
              </AppText>
            )}
          </TouchableOpacity>
        </AppCard>
      </View>
    </AppScreen>
  );
}
