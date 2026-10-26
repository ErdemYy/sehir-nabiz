import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LogIn, UserPlus, X, AlertCircle } from 'lucide-react-native';
import { BottomSheet, AppText, AppInput, AppButton } from '../../../components/ui';
import { useAppTheme } from '../../../theme';
import { useAuthStore } from '../store/useAuthStore';
import { LoginInputSchema, RegisterInputSchema } from '@sehir-nabiz/shared';

export interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export function AuthModal({
  visible,
  onClose,
  onSuccess,
  title = 'Giriş Yapılması Gerekiyor',
  subtitle = 'Olay bildirmek ve topluluk teyidine katılmak için lütfen oturum açın.',
}: AuthModalProps): React.ReactElement {
  const { theme, spacing, radii } = useAppTheme();
  const { login, register, isLoading, error: storeError, clearError } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSwitchMode = useCallback((newMode: 'login' | 'register') => {
    setMode(newMode);
    setFormError(null);
    clearError();
  }, [clearError]);

  const handleSubmit = useCallback(async () => {
    setFormError(null);
    clearError();

    if (mode === 'login') {
      const validation = LoginInputSchema.safeParse({ email, password });
      if (!validation.success) {
        setFormError(validation.error.errors[0]?.message || 'Lütfen bilgileri kontrol ediniz.');
        return;
      }
      try {
        await login(validation.data);
        onSuccess?.();
        onClose();
      } catch (err: any) {
        // Hata Zustand store'a yazıldı
      }
    } else {
      const validation = RegisterInputSchema.safeParse({
        email,
        password,
        displayName,
      });
      if (!validation.success) {
        setFormError(validation.error.errors[0]?.message || 'Lütfen bilgileri kontrol ediniz.');
        return;
      }
      try {
        await register(validation.data);
        onSuccess?.();
        onClose();
      } catch (err: any) {
        // Hata Zustand store'a yazıldı
      }
    }
  }, [mode, email, password, displayName, login, register, onSuccess, onClose, clearError]);

  const activeError = formError || storeError;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ paddingTop: spacing.xs }}>
        {/* Üst Kapatma ve Başlık Satırı */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <AppText variant="headingM" weight="bold">
              {title}
            </AppText>
            <AppText variant="caption" color={theme.textSecondary} style={{ marginTop: 2 }}>
              {subtitle}
            </AppText>
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Kapat"
            accessibilityRole="button"
          >
            <X size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Giriş / Kayıt Ol Sekme Seçicisi */}
        <View
          style={[
            styles.tabSelector,
            {
              backgroundColor: theme.surfaceElevated,
              borderRadius: radii.pill,
              borderColor: theme.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tabButton,
              mode === 'login' && [styles.activeTab, { backgroundColor: theme.surface }],
            ]}
            onPress={() => handleSwitchMode('login')}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === 'login' }}
          >
            <LogIn size={16} color={mode === 'login' ? theme.primary : theme.textSecondary} />
            <AppText
              variant="bodyS"
              weight={mode === 'login' ? 'bold' : 'medium'}
              color={mode === 'login' ? theme.primary : theme.textSecondary}
            >
              Giriş Yap
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              mode === 'register' && [styles.activeTab, { backgroundColor: theme.surface }],
            ]}
            onPress={() => handleSwitchMode('register')}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === 'register' }}
          >
            <UserPlus size={16} color={mode === 'register' ? theme.primary : theme.textSecondary} />
            <AppText
              variant="bodyS"
              weight={mode === 'register' ? 'bold' : 'medium'}
              color={mode === 'register' ? theme.primary : theme.textSecondary}
            >
              Kayıt Ol
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Hata Bildirimi */}
        {activeError ? (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: theme.errorLight,
                borderColor: theme.error,
                borderRadius: radii.medium,
                marginBottom: spacing.md,
              },
            ]}
          >
            <AlertCircle size={16} color={theme.error} />
            <AppText variant="caption" color={theme.error} style={{ flex: 1 }}>
              {activeError}
            </AppText>
          </View>
        ) : null}

        {/* Form Alanları */}
        {mode === 'register' ? (
          <AppInput
            label="Ad Soyad veya Takma Ad"
            placeholder="Örn: Ahmet Yılmaz"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            autoComplete="name"
          />
        ) : null}

        <AppInput
          label="E-posta Adresi"
          placeholder="ornek@sehirnabiz.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <AppInput
          label="Şifre"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        {/* Aksiyon Butonu */}
        <AppButton
          title={mode === 'login' ? 'Giriş Yap ve Devam Et' : 'Hesap Oluştur ve Devam Et'}
          loading={isLoading}
          onPress={handleSubmit}
          disabled={isLoading || !email.trim() || !password.trim()}
          fullWidth
          style={{ marginTop: spacing.sm, marginBottom: spacing.md }}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tabSelector: {
    flexDirection: 'row',
    padding: 4,
    borderWidth: 1,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTab: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderWidth: 1,
  },
});
