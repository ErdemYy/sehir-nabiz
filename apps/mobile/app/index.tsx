import type { ReactElement } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../src/theme';
import { useAppStore } from '../src/store/useAppStore';

export default function HomeScreen(): ReactElement {
  const { theme, spacing, radii } = useAppTheme();
  const { selectedCity } = useAppStore();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.lg }]}>
        {/* Üst Karşılama Kartı */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderRadius: radii.xl,
              padding: spacing.xl,
            },
          ]}
        >
          <View style={[styles.pulseBadge, { backgroundColor: theme.primaryLight }]}>
            <View style={[styles.pulseDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.pulseText, { color: theme.primaryDark }]}>Canlı Şehir Nabzı</Text>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>ŞehirNabız'a Hoş Geldiniz</Text>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Türkiye'deki şehir olaylarını, yol durumlarını ve gelişmeleri anlık harita üzerinden
            takip edin ve doğrulayın.
          </Text>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Seçili Şehir:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{selectedCity}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Platform Durumu:</Text>
            <Text style={[styles.infoValue, { color: theme.success }]}>Altyapı Aktif (Phase 1)</Text>
          </View>
        </View>

        {/* Bilgilendirme Kartı */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderRadius: radii.lg,
              padding: spacing.lg,
              marginTop: spacing.md,
            },
          ]}
        >
          <Text style={[styles.statusTitle, { color: theme.text }]}>Geliştirme Durumu</Text>
          <Text style={[styles.statusText, { color: theme.textSecondary }]}>
            • Expo SDK 58 + React 19 mimarisi devrede{'\n'}
            • Type-safe Expo Router navigasyonu hazır{'\n'}
            • Zustand ve TanStack Query entegre edildi{'\n'}
            • PostGIS ve MapLibre motoru Phase 2 & 6'da bağlanacak
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  heroCard: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  pulseText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusCard: {
    borderWidth: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
