import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  MapPin,
  Camera,
  Heart,
} from 'lucide-react-native';
import {
  AppScreen,
  AppHeader,
  AppText,
  AppButton,
  IconButton,
  FloatingIconButton,
  SearchBar,
  FilterChip,
  CategoryChip,
  AppCard,
  FloatingCard,
  AppInput,
  AppTextArea,
  StatusBadge,
  AppDivider,
  AppAvatar,
  AppSkeleton,
  ErrorState,
  BottomSheet,
} from '../src/components/ui';
import { useAppTheme } from '../src/theme';
import { EventStatus } from '@sehir-nabiz/shared';

export default function ShowcaseScreen(): React.ReactElement {
  const router = useRouter();
  const { theme, spacing, radii, isDark, toggleTheme } = useAppTheme();

  const [searchVal, setSearchVal] = useState('');
  const [chipSelected, setChipSelected] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('TRAFFIC');
  const [inputVal, setInputVal] = useState('');
  const [textAreaVal, setTextAreaVal] = useState('');
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  // Güvenlik denetimi: Yalnızca geliştirme ortamında erişilebilir
  if (!__DEV__) {
    return (
      <AppScreen>
        <ErrorState
          title="Erişim Reddedildi"
          message="UI Showcase ekranı yalnızca yerel geliştirme (development) ortamında kullanılabilir."
          onRetry={() => router.replace('/')}
          retryTitle="Ana Sayfaya Dön"
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Başlık ve Tema Butonu */}
      <AppHeader
        title="Urban Floating UI Showcase"
        subtitle="ŞehirNabız Tasarım Sistemi Bileşen Kataloğu"
        leftAction={
          <IconButton
            icon={<ArrowLeft size={20} color={theme.text} />}
            onPress={() => router.back()}
            accessibilityLabel="Geri"
          />
        }
        rightAction={
          <IconButton
            icon={isDark ? <Sun size={20} color={theme.warning} /> : <Moon size={20} color={theme.text} />}
            onPress={toggleTheme}
            accessibilityLabel="Tema Değiştir"
          />
        }
        borderBottom
      />

      <View style={{ padding: spacing.lg, gap: spacing.xl }}>
        {/* 1. Renk Sistemi */}
        <View>
          <AppText variant="headingL" weight="bold" style={{ marginBottom: spacing.sm }}>
            1. Renk Paleti ve Semantic Tokenlar
          </AppText>
          <AppText variant="bodyS" color={theme.textSecondary} style={{ marginBottom: spacing.md }}>
            Mevcut tema: {isDark ? 'Koyu (Dark Theme)' : 'Açık (Light Theme)'}
          </AppText>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {[
              { label: 'Primary (Turkuaz)', color: theme.primary },
              { label: 'Primary Dark', color: theme.primaryDark },
              { label: 'Accent Blue', color: theme.accentBlue },
              { label: 'Success', color: theme.success },
              { label: 'Warning', color: theme.warning },
              { label: 'Error', color: theme.error },
              { label: 'Surface', color: theme.surface },
              { label: 'Border', color: theme.border },
            ].map((c) => (
              <View
                key={c.label}
                style={{
                  width: '48%',
                  borderRadius: radii.medium,
                  backgroundColor: theme.surfaceElevated,
                  borderWidth: 1,
                  borderColor: theme.border,
                  padding: spacing.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: radii.small,
                    backgroundColor: c.color,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" weight="bold" numberOfLines={1}>
                    {c.label}
                  </AppText>
                  <AppText variant="label" color={theme.textSecondary} numberOfLines={1}>
                    {c.color}
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        </View>

        <AppDivider />

        {/* 2. Tipografi Ölçeği */}
        <View>
          <AppText variant="headingL" weight="bold" style={{ marginBottom: spacing.md }}>
            2. Tipografi Ölçeği (Plus Jakarta Sans & Manrope)
          </AppText>

          <View style={{ gap: spacing.sm }}>
            <AppText variant="display">Display — 32px Bold</AppText>
            <AppText variant="headingXL">Heading XL — 24px Bold</AppText>
            <AppText variant="headingL">Heading L — 20px SemiBold</AppText>
            <AppText variant="headingM">Heading M — 18px SemiBold</AppText>
            <AppText variant="bodyL">Body L — 16px Regular Metin Alanı</AppText>
            <AppText variant="bodyM">Body M — 14px Standart Gövde Metni</AppText>
            <AppText variant="bodyS">Body S — 13px İkincil Bilgi Açıklaması</AppText>
            <AppText variant="caption">Caption — 12px Zaman Damgası / Dipnot</AppText>
            <AppText variant="label">LABEL — 11px SEMIBOLD BÜYÜK HARF ETİKET</AppText>
          </View>
        </View>

        <AppDivider />

        {/* 3. Buton Varyantları ve Durumları */}
        <View>
          <AppText variant="headingL" weight="bold" style={{ marginBottom: spacing.md }}>
            3. Butonlar (52px Primary, 16px Radius)
          </AppText>

          <View style={{ gap: spacing.md }}>
            <AppButton
              title="Primary Buton (Varsayılan)"
              variant="primary"
              fullWidth
              leftIcon={<Sparkles size={18} color="#FFFFFF" />}
              onPress={() => {}}
            />

            <AppButton
              title="Secondary Buton"
              variant="secondary"
              fullWidth
              onPress={() => {}}
            />

            <AppButton
              title="Outline Buton"
              variant="outline"
              fullWidth
              onPress={() => {}}
            />

            <AppButton
              title="Destructive (Kritik İşlem)"
              variant="destructive"
              fullWidth
              onPress={() => {}}
            />

            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <AppButton
                title="Yükleniyor..."
                variant="primary"
                loading
                style={{ flex: 1 }}
              />
              <AppButton
                title="Pasif Buton"
                variant="primary"
                disabled
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>

        <AppDivider />

        {/* 4. Floating Butonlar ve Arama Çubuğu */}
        <View>
          <AppText variant="headingL" weight="bold" style={{ marginBottom: spacing.md }}>
            4. Floating Bileşenler & Arama
          </AppText>

          <SearchBar
            value={searchVal}
            onChangeText={setSearchVal}
            placeholder="Arama yapın..."
            style={{ marginBottom: spacing.md }}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <FloatingIconButton
              icon={<MapPin size={22} color={theme.primary} />}
              onPress={() => {}}
              accessibilityLabel="Konum"
            />
            <FloatingIconButton
              icon={<Camera size={22} color={theme.text} />}
              onPress={() => {}}
              accessibilityLabel="Kamera"
            />
            <FloatingIconButton
              icon={<Heart size={22} color={theme.error} />}
              active
              onPress={() => {}}
              accessibilityLabel="Favori"
            />
          </View>
        </View>

        <AppDivider />

        {/* 5. Filtre ve Kategori Chip'leri */}
        <View>
          <AppText variant="headingL" weight="bold" style={{ marginBottom: spacing.md }}>
            5. Filtre ve Kategori Chip'leri
          </AppText>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
            <FilterChip
              label="Tümü"
              selected={chipSelected}
              count={42}
              onPress={() => setChipSelected(!chipSelected)}
            />
            <FilterChip
              label="Teyit Edilenler"
              selected={!chipSelected}
              count={18}
              onPress={() => setChipSelected(!chipSelected)}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {[
              { code: 'TRAFFIC', name: 'Trafik' },
              { code: 'ACCIDENT', name: 'Kaza' },
              { code: 'ROAD_WORK', name: 'Yol Çalışması' },
              { code: 'INFRASTRUCTURE', name: 'Altyapı' },
              { code: 'EVENT', name: 'Etkinlik' },
            ].map((c) => (
              <CategoryChip
                key={c.code}
                categoryCode={c.code}
                nameTr={c.name}
                selected={selectedCategory === c.code}
                onPress={() => setSelectedCategory(c.code)}
              />
            ))}
          </ScrollView>
        </View>

        <AppDivider />

        {/* 6. Form Giriş Elemanları */}
        <View>
          <AppText variant="headingL" weight="bold" style={{ marginBottom: spacing.md }}>
            6. Form Giriş Elemanları (Input & TextArea)
          </AppText>

          <AppInput
            label="Kullanıcı Adı"
            placeholder="ornek_kullanici"
            value={inputVal}
            onChangeText={setInputVal}
            helperText="Diğer kullanıcılar bu ismi görecektir."
          />

          <AppInput
            label="Hatalı Giriş Örneği"
            placeholder="E-posta giriniz"
            value="gecersiz-eposta"
            error="Lütfen geçerli bir e-posta adresi yazınız."
          />

          <AppTextArea
            label="Açıklama Alanı (Karakter Sayacılı)"
            placeholder="Olay hakkında detayları buraya yazınız..."
            value={textAreaVal}
            onChangeText={setTextAreaVal}
            maxLength={250}
          />
        </View>

        <AppDivider />

        {/* 7. Rozetler (Badge & StatusBadge) ve Avatarlar */}
        <View>
          <AppText variant="headingL" weight="bold" style={{ marginBottom: spacing.md }}>
            7. Rozetler & Profil Avatarları
          </AppText>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
            <StatusBadge status={EventStatus.ACTIVE} />
            <StatusBadge status={EventStatus.PENDING_REVIEW} />
            <StatusBadge status={EventStatus.RESOLVED} />
            <StatusBadge status={EventStatus.REJECTED} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <AppAvatar name="Ahmet Yılmaz" size="sm" />
            <AppAvatar name="Mehmet Demir" size="md" isVerified />
            <AppAvatar name="Ayşe Kaya" size="lg" isVerified />
            <AppAvatar name="Şehir Nabız" size="xl" />
          </View>
        </View>

        <AppDivider />

        {/* 8. Kartlar ve Yüzeyler */}
        <View>
          <AppText variant="headingL" weight="bold" style={{ marginBottom: spacing.md }}>
            8. Kartlar (AppCard & FloatingCard)
          </AppText>

          <AppCard style={{ marginBottom: spacing.md }}>
            <AppText variant="headingM" weight="bold">
              Standart AppCard (20px Radius)
            </AppText>
            <AppText variant="bodyS" color={theme.textSecondary} style={{ marginTop: spacing.xxs }}>
              Zemin seviyesi Elevation 1 ve ince sınır çizgisi içerir.
            </AppText>
          </AppCard>

          <FloatingCard>
            <AppText variant="headingM" weight="bold" color={theme.primary}>
              FloatingCard (Apple Maps Style)
            </AppText>
            <AppText variant="bodyS" color={theme.textSecondary} style={{ marginTop: spacing.xxs }}>
              Harita üzerinde havada asılı duran zarif derinlik ve gölge.
            </AppText>
          </FloatingCard>
        </View>

        <AppDivider />

        {/* 9. Yükleme ve İskelet (Skeleton) */}
        <View>
          <AppText variant="headingL" weight="bold" style={{ marginBottom: spacing.md }}>
            9. İskelet Yükleme (AppSkeleton)
          </AppText>

          <View style={{ gap: spacing.sm }}>
            <AppSkeleton height={24} width="60%" />
            <AppSkeleton height={16} width="90%" />
            <AppSkeleton height={16} width="75%" />
          </View>
        </View>

        <AppDivider />

        {/* 10. Bottom Sheet Testi */}
        <View>
          <AppText variant="headingL" weight="bold" style={{ marginBottom: spacing.md }}>
            10. Bottom Sheet Altyapısı
          </AppText>

          <AppButton
            title="Bottom Sheet Önizlemesini Aç"
            variant="primary"
            fullWidth
            onPress={() => setBottomSheetOpen(true)}
          />
        </View>
      </View>

      {/* Bottom Sheet Demo */}
      <BottomSheet visible={bottomSheetOpen} onClose={() => setBottomSheetOpen(false)}>
        <View style={{ paddingTop: spacing.md, alignItems: 'center' }}>
          <Sparkles size={36} color={theme.primary} style={{ marginBottom: spacing.sm }} />
          <AppText variant="headingL" weight="bold" align="center" style={{ marginBottom: spacing.xs }}>
            ŞehirNabız Bottom Sheet
          </AppText>
          <AppText variant="bodyM" color={theme.textSecondary} align="center" style={{ marginBottom: spacing.lg }}>
            Doğal PanResponder sürükleme ve yaylanma animasyonu ile çalışan entegre mobil alt sayfası.
          </AppText>
          <AppButton
            title="Kapat"
            variant="secondary"
            fullWidth
            onPress={() => setBottomSheetOpen(false)}
          />
        </View>
      </BottomSheet>
    </AppScreen>
  );
}
