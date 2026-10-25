import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Camera, MapPin } from 'lucide-react-native';
import {
  AppScreen,
  AppHeader,
  AppInput,
  AppTextArea,
  AppButton,
  CategoryChip,
  FilterChip,
  AppText,
  AppCard,
} from '../../src/components/ui';
import { useAppTheme } from '../../src/theme';
import { EventCategory, EventSeverity } from '@sehir-nabiz/shared';

const CATEGORIES = [
  { code: EventCategory.TRAFFIC, name: 'Trafik' },
  { code: EventCategory.ACCIDENT, name: 'Kaza' },
  { code: EventCategory.ROAD_WORK, name: 'Yol Çalışması' },
  { code: EventCategory.WATER_OUTAGE, name: 'Su Kesintisi' },
  { code: EventCategory.POWER_OUTAGE, name: 'Elektrik' },
  { code: EventCategory.INFRASTRUCTURE, name: 'Altyapı' },
  { code: EventCategory.PUBLIC_TRANSPORT, name: 'Toplu Taşıma' },
];

export default function CreateEventScreen(): React.ReactElement {
  const { theme, spacing, radii } = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>(EventCategory.TRAFFIC);
  const [selectedSeverity, setSelectedSeverity] = useState<EventSeverity>(EventSeverity.MEDIUM);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <AppScreen scrollable keyboardAvoiding contentContainerStyle={{ paddingBottom: 110 }}>
      <AppHeader
        title="Olay Bildir"
        subtitle="Şehrinizdeki aksaklığı veya gelişmeyi paylaşın"
      />

      <View style={{ padding: spacing.lg }}>
        {/* Konum Doğrulama Kartı */}
        <AppCard style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: radii.pill,
                backgroundColor: theme.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MapPin size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyS" weight="semibold">
                Konumunuz Otomatik Belirlendi
              </AppText>
              <AppText variant="caption" color={theme.textSecondary}>
                Melikgazi, Kayseri (± 150m bulanıklaştırılmış)
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Kategori Seçimi */}
        <AppText
          variant="bodyS"
          weight="semibold"
          style={{ marginBottom: spacing.xs }}
        >
          Kategori Seçin
        </AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, marginBottom: spacing.lg }}
        >
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.code}
              categoryCode={cat.code}
              nameTr={cat.name}
              selected={selectedCategory === cat.code}
              onPress={() => setSelectedCategory(cat.code)}
            />
          ))}
        </ScrollView>

        {/* Başlık Girişi */}
        <AppInput
          label="Olay Başlığı"
          placeholder="Örn: Sivas Caddesi sağ şerit kaza"
          value={title}
          onChangeText={setTitle}
        />

        {/* Açıklama Girişi */}
        <AppTextArea
          label="Ayrıntılı Açıklama"
          placeholder="Olay hakkında sürücülere ve bölge sakinlerine faydalı detaylar giriniz..."
          value={description}
          onChangeText={setDescription}
          maxLength={500}
        />

        {/* Aciliyet Seviyesi */}
        <AppText
          variant="bodyS"
          weight="semibold"
          style={{ marginBottom: spacing.xs }}
        >
          Önem Seviyesi
        </AppText>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
          <FilterChip
            label="Düşük"
            selected={selectedSeverity === EventSeverity.LOW}
            onPress={() => setSelectedSeverity(EventSeverity.LOW)}
          />
          <FilterChip
            label="Orta"
            selected={selectedSeverity === EventSeverity.MEDIUM}
            onPress={() => setSelectedSeverity(EventSeverity.MEDIUM)}
          />
          <FilterChip
            label="Yüksek"
            selected={selectedSeverity === EventSeverity.HIGH}
            onPress={() => setSelectedSeverity(EventSeverity.HIGH)}
          />
          <FilterChip
            label="Kritik"
            selected={selectedSeverity === EventSeverity.CRITICAL}
            onPress={() => setSelectedSeverity(EventSeverity.CRITICAL)}
          />
        </View>

        {/* Fotoğraf Ekleme Alanı (Phase 4 depolama entegrasyonu için arayüz yuvası) */}
        <View
          style={{
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: theme.border,
            borderRadius: radii.card,
            padding: spacing.xl,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.surfaceElevated,
            marginBottom: spacing.xl,
          }}
        >
          <Camera size={32} color={theme.primary} style={{ marginBottom: spacing.xs }} />
          <AppText variant="bodyM" weight="semibold">
            Fotoğraf Ekle (Maksimum 3 Adet)
          </AppText>
          <AppText variant="caption" color={theme.textSecondary} align="center">
            Phase 4 ile kurulan S3/MinIO presigned altyapısı ve EXIF temizleme motoru ile korunur.
          </AppText>
        </View>

        {/* Gönder Butonu */}
        <AppButton
          title="Olayı Bildir"
          onPress={() => {}}
          fullWidth
          disabled={!title.trim() || !description.trim()}
        />
      </View>
    </AppScreen>
  );
}
