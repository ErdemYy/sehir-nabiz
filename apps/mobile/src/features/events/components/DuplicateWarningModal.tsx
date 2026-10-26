import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, MapPin, Clock, X } from 'lucide-react-native';
import { BottomSheet, AppText, AppButton, AppCard } from '../../../components/ui';
import { useAppTheme } from '../../../theme';
import { formatDistance } from '../../map/utils/geoUtils';
import type { DuplicateWarningDto } from '@sehir-nabiz/shared';

export interface DuplicateWarningModalProps {
  visible: boolean;
  warning: DuplicateWarningDto | null;
  onProceed: () => void;
  onCancel: () => void;
}

export function DuplicateWarningModal({
  visible,
  warning,
  onProceed,
  onCancel,
}: DuplicateWarningModalProps): React.ReactElement {
  const { theme, spacing, radii } = useAppTheme();

  return (
    <BottomSheet visible={visible} onClose={onCancel}>
      <View style={{ paddingTop: spacing.xs }}>
        {/* Üst Uyarı Başlığı */}
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: radii.pill,
                backgroundColor: '#FEF3C7',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={18} color="#D97706" />
            </View>
            <AppText variant="headingM" weight="bold" color="#92400E">
              Benzer Bildirim Bulundu
            </AppText>
          </View>
          <TouchableOpacity
            onPress={onCancel}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Kapat"
          >
            <X size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <AppText variant="bodyS" color={theme.textSecondary} style={{ marginBottom: spacing.md }}>
          Yakınınızda (150 metre yarıçapında) son 45 dakika içinde bildirilmiş benzer bir olay tespit edildi.
        </AppText>

        {/* Eşleşen Olay Bilgi Kartı */}
        {warning?.candidateTitle ? (
          <AppCard
            style={{
              marginBottom: spacing.lg,
              backgroundColor: '#FFFBEB',
              borderColor: '#FDE68A',
              borderWidth: 1,
            }}
          >
            <AppText variant="bodyM" weight="bold" style={{ marginBottom: 4 }}>
              {warning.candidateTitle}
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {warning.distanceMeters !== undefined ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} color="#D97706" />
                  <AppText variant="caption" color="#92400E">
                    {formatDistance(warning.distanceMeters)} uzaklıkta
                  </AppText>
                </View>
              ) : null}

              {warning.createdAt ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} color="#D97706" />
                  <AppText variant="caption" color="#92400E">
                    {new Date(warning.createdAt).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </AppText>
                </View>
              ) : null}
            </View>
          </AppCard>
        ) : null}

        <AppText variant="caption" color={theme.textSecondary} style={{ marginBottom: spacing.lg }}>
          Farklı bir açıdan çekilmiş fotoğraf eklemek veya durumu teyit etmek istiyorsanız bildiriminizi gönderebilirsiniz. Moderatörler mükerrer bildirimleri tek bir olayda birleştirecektir.
        </AppText>

        {/* Aksiyon Butonları */}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <AppButton
            title="Düzenle / Vazgeç"
            variant="secondary"
            onPress={onCancel}
            style={{ flex: 1 }}
          />
          <AppButton
            title="Yine de Bildir"
            variant="primary"
            onPress={onProceed}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});
