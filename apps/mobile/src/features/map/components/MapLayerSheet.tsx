import React from 'react';
import { View } from 'react-native';
import { Map, Moon, Sun, Globe, Check } from 'lucide-react-native';
import { BottomSheet, AppText, AppCard } from '../../../components/ui';
import { useAppTheme } from '../../../theme';
import type { MapStyleMode } from '../types/map.types';
import { MAP_CONFIG } from '../config/mapConfig';

export interface MapLayerSheetProps {
  visible: boolean;
  onClose: () => void;
  activeMode: MapStyleMode;
  onSelectMode: (mode: MapStyleMode) => void;
}

const LAYER_OPTIONS: {
  mode: MapStyleMode;
  title: string;
  description: string;
  icon: typeof Map;
}[] = [
  {
    mode: 'light',
    title: 'Standart (Açık)',
    description: 'Şehir içi yollar ve açık renkli binalar (OpenFreeMap Liberty)',
    icon: Sun,
  },
  {
    mode: 'dark',
    title: 'Karanlık Mod',
    description: 'Gece sürüşü ve yüksek kontrast için optimize koyu tema',
    icon: Moon,
  },
  {
    mode: 'satellite',
    title: 'Uydu & Yeryüzü',
    description: 'Yüksek çözünürlüklü raster yeryüzü ve arazi katmanı',
    icon: Globe,
  },
];

export function MapLayerSheet({
  visible,
  onClose,
  activeMode,
  onSelectMode,
}: MapLayerSheetProps): React.ReactElement {
  const { theme, spacing, radii } = useAppTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ paddingTop: spacing.sm }}>
        <AppText variant="headingM" weight="bold" style={{ marginBottom: spacing.xs }}>
          Harita Katmanları
        </AppText>
        <AppText
          variant="bodyS"
          color={theme.textSecondary}
          style={{ marginBottom: spacing.lg }}
        >
          Görünüm stilini seçin. Tüm katmanlar vektör hızlandırmalı çalışır.
        </AppText>

        <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
          {LAYER_OPTIONS.map((layer) => {
            const Icon = layer.icon;
            const isSelected = activeMode === layer.mode;

            return (
              <AppCard
                key={layer.mode}
                onPress={() => {
                  onSelectMode(layer.mode);
                  onClose();
                }}
                style={{
                  borderColor: isSelected ? theme.primary : theme.border,
                  borderWidth: isSelected ? 2 : 1,
                  backgroundColor: isSelected
                    ? theme.primaryLight
                    : theme.surfaceElevated,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: radii.pill,
                        backgroundColor: isSelected ? theme.primary : theme.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon
                        size={20}
                        color={isSelected ? '#FFFFFF' : theme.textSecondary}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <AppText
                        variant="bodyM"
                        weight="bold"
                        color={isSelected ? theme.primaryDark : theme.text}
                      >
                        {layer.title}
                      </AppText>
                      <AppText
                        variant="caption"
                        color={
                          isSelected ? theme.primaryDark : theme.textSecondary
                        }
                      >
                        {layer.description}
                      </AppText>
                    </View>
                  </View>

                  {isSelected ? (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: radii.pill,
                        backgroundColor: theme.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  ) : null}
                </View>
              </AppCard>
            );
          })}
        </View>

        {/* Lisans ve Attribution Bilgilendirmesi */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.border,
            paddingTop: spacing.sm,
            alignItems: 'center',
          }}
        >
          <AppText variant="caption" color={theme.textMuted} align="center">
            {MAP_CONFIG.attributions.osm} • {MAP_CONFIG.attributions.maplibre}
          </AppText>
        </View>
      </View>
    </BottomSheet>
  );
}
