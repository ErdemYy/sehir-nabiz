import React from 'react';
import {
  View,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';
import { AppText } from '../ui/AppText';

export interface MapScreenLayoutProps {
  // Slotlar
  searchBarSlot?: React.ReactNode;
  categoryFilterSlot?: React.ReactNode;
  mapActionControlsSlot?: React.ReactNode;
  bottomSheetSlot?: React.ReactNode;
  bottomNavigationSlot?: React.ReactNode;
  // Harita render alanı (Phase 6 MapLibre için hazır canvas)
  mapCanvas?: React.ReactNode;
  style?: ViewStyle;
}

export function MapScreenLayout({
  searchBarSlot,
  categoryFilterSlot,
  mapActionControlsSlot,
  bottomSheetSlot,
  bottomNavigationSlot,
  mapCanvas,
  style,
}: MapScreenLayoutProps): React.ReactElement {
  const { theme, spacing, radii } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[{ flex: 1, backgroundColor: theme.background }, style]}>
      {/* 1. Fullscreen Map Canvas Alanı */}
      <View style={StyleSheet.absoluteFill}>
        {mapCanvas ? (
          mapCanvas
        ) : (
          // Geliştirme Yer Tutucusu (Development Placeholder)
          <View
            style={{
              flex: 1,
              backgroundColor: theme.background,
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing.xl,
            }}
          >
            {/* Grid deseni simülasyonu */}
            <View
              style={{
                width: '100%',
                height: '70%',
                borderRadius: radii.card,
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: theme.border,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.surface,
                padding: spacing.xl,
              }}
            >
              <AppText
                variant="headingL"
                weight="bold"
                color={theme.primary}
                align="center"
                style={{ marginBottom: spacing.xs }}
              >
                ŞehirNabız Vektör Harita Alanı
              </AppText>
              <AppText
                variant="bodyM"
                color={theme.textSecondary}
                align="center"
                style={{ marginBottom: spacing.md }}
              >
                [Development Placeholder] — Phase 6'da MapLibre vektör motoru ile GPU ivmeli katmanlar bu alana bağlanacaktır.
              </AppText>
              <View
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xxs,
                  borderRadius: radii.pill,
                  backgroundColor: theme.primaryLight,
                }}
              >
                <AppText variant="caption" weight="semibold" color={theme.primaryDark}>
                  MapScreenLayout Hazır
                </AppText>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* 2. Floating Üst Bar (Search Bar Slotu) */}
      {searchBarSlot ? (
        <View
          style={{
            position: 'absolute',
            top: Math.max(insets.top + spacing.xs, 16),
            left: spacing.lg,
            right: spacing.lg,
            zIndex: 10,
          }}
        >
          {searchBarSlot}
        </View>
      ) : null}

      {/* 3. Yatay Kategori Filtre Slotu */}
      {categoryFilterSlot ? (
        <View
          style={{
            position: 'absolute',
            top: Math.max(insets.top + 68, 80),
            left: 0,
            right: 0,
            zIndex: 9,
          }}
        >
          {categoryFilterSlot}
        </View>
      ) : null}

      {/* 4. Sağ Taraf Harita Aksiyon Kontrolleri (Floating Action Buttons Slotu) */}
      {mapActionControlsSlot ? (
        <View
          style={{
            position: 'absolute',
            right: spacing.lg,
            top: Math.max(insets.top + 140, 150),
            zIndex: 8,
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          {mapActionControlsSlot}
        </View>
      ) : null}

      {/* 5. Bottom Sheet Slotu */}
      {bottomSheetSlot ? (
        <View style={{ zIndex: 20 }}>{bottomSheetSlot}</View>
      ) : null}

      {/* 6. Floating Alt Navigasyon Slotu */}
      {bottomNavigationSlot ? (
        <View style={{ zIndex: 15 }}>{bottomNavigationSlot}</View>
      ) : null}
    </View>
  );
}
