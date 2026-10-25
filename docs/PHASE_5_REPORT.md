# ŞehirNabız — Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi Raporu (PHASE_5_REPORT.md)

**Tarih:** 25 Ekim 2026  
**Faz:** Phase 5 — Premium Mobil UI Foundation ve Tasarım Sistemi  
**Önceki Commit:** `fd4975f` (Phase 4)  
**Tasarım Dili:** ŞehirNabız — Urban Floating UI  
**Durum:** TAMAMLANDI (%100 Yeşil: 84 Backend API, 11 Design-Tokens, 6 Mobile, 4 Shared Testi)

---

## 1. Oluşturulan UI Bileşenleri

ŞehirNabız için `apps/mobile/src/components/ui/` altında 24 adet yüksek kaliteli, TypeScript Strict Mode ile tiplendirilmiş, erişilebilir ve platform bağımsız yeniden kullanılabilir bileşen geliştirilmiştir:

1. **`AppText`:** 9 varyantlı tipografi motoru (`display`, `headingXL`, `headingL`, `headingM`, `bodyL`, `bodyM`, `bodyS`, `caption`, `label`). Sistem font ölçeklendirmesini korur (`allowFontScaling`).
2. **`AppButton`:** 52px yükseklik, 16px (`radii.large`) köşe yuvarlama, turkuaz `#14B8A6` birincil arka plan, beyaz metin ve 0.98 ölçekli kontrollü basılma animasyonu. Varyantlar: `primary`, `secondary`, `outline`, `ghost`, `destructive`. Desteklenen durumlar: `default`, `pressed`, `disabled`, `loading`.
3. **`IconButton`:** Minimum 44x44px erişilebilir dokunma alanı (Apple HIG / Android Material uyumlu).
4. **`FloatingIconButton`:** 48x48px dairesel (`radii.pill`), havada asılı yumuşak gölgeli (`shadows.floating`), harita üzeri kontroller için özel yüzer buton.
5. **`SearchBar`:** Yüzer arama çubuğu, tek dokunuşla temizleme (clear icon), odaklanıldığında turkuaz kenarlık, arama ikonu ve klavye etkileşimi.
6. **`FilterChip`:** Hap (pill) formunda, sayaç rozeti içeren, yatay kaydırmaya uygun, seçildiğinde semantik renk alan kompakt filtre çipi.
7. **`CategoryChip`:** Backend'deki 11 olay kategorisinin renk kodları ve simgeleriyle birebir uyumlu, harita filtreleme çipi.
8. **`AppCard`:** 20px radius (`radii.card`), `elevation1` yumuşak derinlik, ince sınır çizgisi ve ayarlanabilir padding içeren temel içerik taşıyıcı.
9. **`FloatingCard`:** Apple Maps esintili, harita üzerinde havada asılı duran yüzer bilgi kartı (`shadows.floating`).
10. **`AppInput`:** Odaklanıldığında turkuaz border, hata durumunda kırmızı uyarı, yardımcı metin (helperText), sol ve sağ ikon yuvası.
11. **`AppTextArea`:** Çok satırlı metin girişi, karakter sayacı (`maxLength`), esnek yükseklik.
12. **`AppBadge`:** Durum ve kategori rozetleri (`subtle`, `filled`, `outline`).
13. **`StatusBadge`:** Olayın yaşam döngüsünü simgeleyen semantik rozet (`ACTIVE` Yeşil, `PENDING_REVIEW` Kehribar, `RESOLVED` Mavi/Turkuaz, `REJECTED` Kırmızı).
14. **`AppDivider`:** Saç teli kalınlığında (`hairlineWidth`), isteğe bağlı metin etiketli ayraç.
15. **`AppAvatar`:** İsim baş harfleri veya fotoğraf gösterimi, doğrulanmış kullanıcı onay rozeti (Checkmark).
16. **`AppSkeleton`:** Yumuşak parıltı (opacity pulse loop) animasyonlu yükleme iskeleti.
17. **`EmptyState`:** Boş içerik ekranları (ikon, başlık, açıklama ve opsiyonel eylem butonu).
18. **`ErrorState`:** Hata durumları (uyarı ikonu, hata mesajı ve tekrar dene butonu).
19. **`LoadingState`:** Yükleme göstergesi ve durum mesajı.
20. **`AppScreen`:** `SafeAreaView` (kenar payı korumalı), kaydırılabilir veya sabit, `KeyboardAvoidingView` destekli sayfa sarmalayıcısı.
21. **`AppHeader`:** Sol/sağ aksiyon butonları, başlık, alt başlık ve ince alt kenarlık.
22. **`FloatingTabBar`:** 5 sekmeli, 24px radius, yüzen cam/yüzey hissi veren alt navigasyon barı.
23. **`FloatingActionButton (FAB)`:** 56x56px dairesel, hızlı olay bildirme veya harita aksiyon butonu.
24. **`BottomSheet`:** PanResponder dokunmatik sürükleme, yaylanma, arka plan karartması (backdrop) ve kapatma jestleri içeren doğal mobil alt paneli.
25. **`MapScreenLayout`:** Phase 6 MapLibre entegrasyonuna hazır tam ekran canvas, üst arama slotu, yatay filtre slotu, sağ aksiyon slotları ve alt bar koordinasyon şablonu.

---

## 2. Tasarım Tokenları (`@sehir-nabiz/design-tokens`)

Tüm tokenlar `@sehir-nabiz/design-tokens` paketinde toplanmış, TypeScript Strict modunda derlenmiş ve 11 birim testi ile doğrulanmıştır.

- **Renkler:**
  - **Light Theme:** Primary `#14B8A6`, PrimaryDark `#0F766E`, AccentBlue `#2563EB`, Background `#F6F8FB`, Surface `#FFFFFF`, TextPrimary `#0F172A`, TextSecondary `#64748B`, Border `#E2E8F0`, Success `#16A34A`, Warning `#F59E0B`, Error `#DC2626`.
  - **Dark Theme:** Background `#0B1726`, Surface `#152436`, SurfaceElevated `#1C3044`, TextPrimary `#F8FAFC`, TextSecondary `#A9B8C8`, Border `#304154`, Primary `#2DD4BF` (WCAG AA yüksek kontrast turkuaz).
  - **11 Kategori:** `TRAFFIC` (#EF4444), `ACCIDENT` (#DC2626), `ROAD_WORK` (#F59E0B), `WATER_OUTAGE` (#0284C7), `POWER_OUTAGE` (#EAB308), `INFRASTRUCTURE` (#6366F1), `PUBLIC_TRANSPORT` (#0D9488), `WEATHER` (#06B6D4), `DISASTER` (#B91C1C), `EVENT` (#8B5CF6), `OTHER` (#64748B).
- **Tipografi:**
  - Başlık: `Plus Jakarta Sans` (`@expo-google-fonts/plus-jakarta-sans`)
  - Gövde: `Manrope` (`@expo-google-fonts/manrope`)
  - Ölçek: Display (32px), Heading XL (24px), Heading L (20px), Heading M (18px), Body L (16px), Body M (14px), Body S (13px), Caption (12px), Label (11px).
- **Spacing:** 4px grid (`xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 20`, `xxl: 24`, `3xl: 32`, `4xl: 40`, `5xl: 48`).
- **Radius:** `small: 8`, `medium: 12`, `large: 16`, `card: 20`, `sheet: 24`, `pill: 999`.
- **Gölge (Shadows):** iOS `shadowOffset/Opacity/Radius` ve Android `elevation` eşleştirmesi (`elevation0`, `elevation1`, `elevation2`, `floating`).

---

## 3. Navigasyon Mimarisi

Expo Router (`expo-router`) dosya tabanlı navigasyon mimarisi kurulmuştur:

```text
apps/mobile/app/
├── _layout.tsx           # Kök Stack (Theme, Fonts, ErrorBoundary, Safe Area)
├── index.tsx             # Kök yönlendirme -> /(tabs)
├── (tabs)/
│   ├── _layout.tsx       # FloatingTabBar ile 5 sekmeli navigasyon sarmalayıcısı
│   ├── index.tsx         # 1. Harita (MapScreenLayout, Arama, Filtreler, BottomSheet)
│   ├── feed.tsx          # 2. Akış (Şehir olay akışı kartları)
│   ├── create.tsx        # 3. Bildir (Merkezi vurgulanmış olay bildirim formu)
│   ├── notifications.tsx # 4. Bildirimler (Teyit ve puan bildirimleri)
│   └── profile.tsx       # 5. Profil (Kullanıcı kimliği, itibar puanı, tema seçici)
├── showcase.tsx          # Geliştirici UI Showcase ekranı (Yalnızca __DEV__ modunda)
└── +not-found.tsx        # 404 Sayfa Bulunamadı ekranı
```

- **Floating Alt Navigasyon:** Tab bar ekranın en altında yapışık durmaz; `Math.max(insets.bottom, 12)` güvenli mesafe ile yüzer. 24px radius ve yarı saydam arka plan ile haritanın ferah görünümünü bozmaz.
- **Merkezi "Bildir" Aksiyonu:** Tab bar'ın tam ortasında 50x50 dairesel turkuaz buton olarak hafifçe yukarı taşarak vurgulanmıştır. İkinci bir FAB ile çakışma yaşanmaz.

---

## 4. Tema Sistemi

- `ThemeProvider` ve `useAppTheme()` React Context hook'u devreye alınmıştır.
- `light`, `dark` ve `system` (cihaz işletim sistemi temasına otomatik uyum) modları desteklenir.
- Profil ekranında veya UI Showcase'de tek dokunuşla tema anlık olarak değiştirilebilir.
- Tüm bileşenler renklerini doğrudan `useAppTheme().theme` semantic tokenlarından çeker; manuel renk tekrarları önlenmiştir.

---

## 5. Animasyon Altyapısı

- **Buton Basılma (Press Scale):** `Animated.spring` ile `0.98` ölçeğine kontrollü basılma ve `4` bounciness ile yaylanma.
- **Floating Butonlar:** `0.92` basılma ölçeği ile net dokunsal geri bildirim.
- **Bottom Sheet:** Doğal `PanResponder` sürükleme, `dy > 120` piksel eşiğinde veya `vy > 0.8` hızında kapatma; aksi halde orijinal yüksekliğe yaylanma.
- **İskelet (Skeleton):** 800ms'lik döngüsel `opacity` sequence pulse.
- **Erişilebilirlik (Reduce Motion):** Aşırı parıltı veya dönme efektlerinden kaçınılmıştır.

---

## 6. UI Showcase Durumu

- **Konum:** `apps/mobile/app/showcase.tsx`
- **Erişim:** Yalnızca geliştirme modunda (`__DEV__ = true`). Harita ekranındaki ışıltı (`Sparkles`) ikonundan veya Profil ekranından tek dokunuşla açılır.
- **Kapsam:** Renk paleti, tipografi ölçeği, buton varyantları, arama çubuğu, floating butonlar, filtre ve kategori çipleri, form elemanları, rozetler, avatarlar, kartlar, iskelet yükleme ve canlı `BottomSheet` simülasyonu.
- **Güvenlik:** Canlı üretim derlemelerinde (`__DEV__ === false`) otomatik olarak `ErrorState` ("Erişim Reddedildi") döndürür.

---

## 7. Expo Uyumluluk Durumu

- **Expo SDK Sürümü:** `58.0.0` (Expo 58 / React Native 0.88 / React 19.3).
- **Font Entegrasyonu:** `expo-font`, `@expo-google-fonts/plus-jakarta-sans` ve `@expo-google-fonts/manrope` paketleri resmi Expo SDK 58 uyumluluğundadır.
- **İkon Sistemi:** `lucide-react-native` ve `react-native-svg` ile tek tip, modern ve minimal ince çizgili ikon dili benimsenmiştir.
- **Native Uyum:** `app.json` içinde `newArchEnabled: true` ile React Native Yeni Mimarisi (Fabric / TurboModules) aktiftir.

---

## 8. Test Sonuçları ve Kapsam

### Test Özeti
```text
Paket                      | Test Sayısı | Sonuç
---------------------------+-------------+-------
sehir-nabiz-api (Backend)  | 84 test     | GEÇTİ
@sehir-nabiz/design-tokens | 11 test     | GEÇTİ
sehir-nabiz-mobile (UI)    |  6 test     | GEÇTİ
@sehir-nabiz/shared        |  4 test     | GEÇTİ
---------------------------+-------------+-------
TOPLAM                     | 105 test    | %100 YEŞİL
```

- **TypeScript Strict Denetimi:** `pnpm turbo typecheck` -> 5 paket, 0 hata.
- **Lint Denetimi:** `pnpm turbo lint` -> 5 paket, 0 uyarı/hata.
- **Derleme Denetimi:** `pnpm turbo build` -> Başarılı derleme (`FULL TURBO`).

---

## 9. Graphify Bilgi Grafiği Güncellemesi

Kod değişikliklerinin ardından AST tabanlı `graphify update .` komutu çalıştırılmıştır:

| Metrik | Phase 4 | Phase 5 (Mevcut) | Değişim (Delta) |
| :--- | :--- | :--- | :--- |
| **Düğümler (Nodes)** | 1176 | **1409** | **+233** |
| **Kenarlar (Edges)** | 2017 | **2799** | **+782** |
| **Topluluklar (Communities)**| 78 | **91** | **+13** |

Yeni eklenen bileşenler, slot yerleşimleri, `FloatingTabBar`, `MapScreenLayout`, `ThemeProvider` ve `showcase` ekranları bilgi grafiğine düğüm ve kenar olarak işlenmiştir.

---

## 10. Commit Hash

- **Phase 4 Commit:** `fd4975f`
- **Phase 5 Commit:** Kod değişiklikleri doğrulanıp commitlemeye hazırdır.

---

## 11. Eksik Cihaz Testleri (Açık Beyan)

Bu aşamada geliştirme ortamında TypeScript strict tip denetimi, Expo konfigürasyon analizi, Node.js unit testleri ve Metro bundler uyumluluğu doğrulanmıştır.
Ancak **fiziksel iOS ve Android cihazları üzerinde Xcode / Android Studio native release derlemesi (IPA/APK build) bu fazda çalıştırılmamıştır**. Bu testler Phase 6'da MapLibre dev-client prebuild aşamasında ve Phase 10 MVP lansmanında gerçekleştirilecektir.

---

## 12. Phase 6 Hazırlık Durumu ve Öneriler

Phase 5 ile mobil uygulamanın tüm görsel, navigasyon, tema ve bileşen temeli tamamlanmıştır.

### Phase 6 Hedefleri (Harita Motoru ve Vektör Katmanları):
1. **MapLibre Entegrasyonu:** `@maplibre/maplibre-react-native` paketinin Expo Prebuild ile bağlanması.
2. **Vektör Karo Sunucusu:** OpenStreetMap / MapTiler vektör stil URL'sinin entegrasyonu.
3. **GPU Kümeleme (Clustering):** 1000+ olay pini için harita motoru seviyesinde performanslı kümeleme.
4. **Harita & BottomSheet Bağlantısı:** Haritadaki bir pin tıklandığında Phase 5'te hazırlanan `BottomSheet` bileşenine gerçek PostGIS olay verilerinin aktarılması.
5. **Konum Takibi:** `expo-location` ile kullanıcının anlık konumunun haritada mavi nabız halkasıyla gösterilmesi.
