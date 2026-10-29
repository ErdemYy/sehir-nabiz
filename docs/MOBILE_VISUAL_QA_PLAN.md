# ŞehirNabız — Mobil Görsel Kalite ve Kullanıcı Deneyimi Denetim Planı (MOBILE_VISUAL_QA_PLAN.md)

**Faz:** Phase 18A — Android Native Build Readiness & Mobile Visual QA  
**Tarih:** 29 Ekim 2026  
**Durum:** Kod Düzeyinde Doğrulandı (Fiziksel Cihaz Ekran Görüntüsü Bekleniyor)  
**Tasarım Dili:** Urban Floating UI (Minimal, Harita Odaklı, WCAG AA Uyumlu)

---

## 1. Giriş ve Şeffaflık Taahhüdü

Urban Floating UI tasarım felsefesi; sakin, kentin nabzını ferah bir harita üzerinde hissettiren, gereksiz neon ve opak panellerden arındırılmış floating elemanlara dayanır.

> [!CAUTION]
> **Dürüst Doğrulama İlkesi:** Bu belgede yer alan denetimler bileşen kaynak kodları, responsive yerleşim algoritmaları ve otomatik birim/entegrasyon testleri üzerinden gerçekleştirilmiştir.
> **Gerçek fiziksel Android telefon üzerinde alınmış ekran görüntüleri olmadan hiçbir görsel test "fiziksel olarak %100 onaylandı" kabul edilemez.** Bu adım Phase 18B'nin ilk aşamasında fiziksel cihaz ile tamamlanacaktır.

---

## 2. 10 Hedef Ekranın Görsel Kalite Denetim Matrisi

| # | Ekran | Rota | Bileşen Hiyerarşisi | Floating Tab / Çakışma Önlemi | SafeArea & Form Davranışı |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Harita** | `/(tabs)/index` | `MapScreenLayout`<br>`PulseMapView`<br>`SearchBar`<br>`CategoryChip x 11`<br>`BottomSheet` | FloatingTabBar haritanın üzerinde `zIndex: 15` ile yüzer. Seçili pin açıldığında `BottomSheet` `zIndex: 20` ile öne çıkar. | Üst arama çubuğu `Math.max(insets.top + 8, 12)` ile sistem bildirim çubuğundan güvenle ayrılmıştır. |
| **2** | **Şehir Akışı** | `/(tabs)/feed` | `AppScreen (scrollable)`<br>`AppHeader`<br>`FilterChip x 3`<br>`AppCard (Olaylar)` | `contentContainerStyle={{ paddingBottom: 100 }}` ile son kartın tab bar altında kalması önlenmiştir. | Pull-to-refresh (`RefreshControl`) devrededir; liste akıcıdır. |
| **3** | **Olay Bildir** | `/(tabs)/create` | `CreateEventFlow (3 Adım)`<br>`StepperHeader`<br>`AppInput / AppTextArea`<br>`PhotoPickerSection` | `contentContainerStyle={{ paddingBottom: 110 }}` tanımlıdır. | `KeyboardAvoidingView` aktiftir. Klavye açıldığında form yukarı kaydırılır; butonlar görünür kalır. |
| **4** | **Bildirimler** | `/(tabs)/notifications`| `AppScreen (scrollable)`<br>`AppHeader`<br>`FilterChip (Tümü/Okunmamış)`<br>Tarihsel Gruplama | `contentContainerStyle={{ paddingBottom: 120 }}` tanımlıdır. | Boş kuyrukta `EmptyState`, hata durumunda `ErrorState` devreye girer. |
| **5** | **Profil** | `/(tabs)/profile` | `AppScreen (scrollable)`<br>`AppAvatar`<br>`AppCard (İtibar & Katkı)`<br>Hızlı Menü Butonları | `contentContainerStyle={{ paddingBottom: 100 }}` tanımlıdır. | Giriş yapılmamışsa "Misafir Kullanıcı" ve `AuthModal` tetikleyicisi gösterilir. |
| **6** | **Olay Detayı** | `/events/[id]` | `AppScreen (scrollable)`<br>`AppHeader (Geri/Paylaş)`<br>`StatusBadge / AppBadge`<br>Teyit Butonları (3'lü) | Bağımsız ekran (Tabs dışı). | `contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 32, 60) }}` ile ekran altındaki teyit butonları sistem çubuğundan korunmuştur. |
| **7** | **Fotoğraf Yükleme**| `PhotoPickerSection` | Kamera / Galeri butonları<br>Önizleme kartları<br>Maks 3 adet, 8MB kalkanı | Form içine gömülü bileşen. | Hatalı yüklemede `RefreshCw` butonu ile görsel bazlı tekrar deneme desteklenir. |
| **8** | **İstatistikler** | `/stats` | `AppScreen (scrollable)`<br>Şehir Seçim Çipleri<br>Dönem Seçimi (24h/7d/30d)<br>Kategori Dağılımı | Bağımsız ekran (Tabs dışı). | `contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 32, 60) }}` ve `minHeight: 44` dokunma hedefi uygulanmıştır. |
| **9** | **Ayarlar** | `/profile/settings` | `AppScreen (scrollable)`<br>Tema Seçici (Light/Dark/Sistem)<br>Bildirim Switch'leri<br>Hesap Silme Paneli | Bağımsız ekran (Tabs dışı). | `contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 32, 60) }}` ve parola korumalı silme modalı mevcuttur. |
| **10**| **Moderasyon** | `/moderation` | `AppScreen (scrollable)`<br>Sekme Filtreleri<br>İnceleme Bekleyenler<br>Onay / Red / İtiraz Çözümü | Bağımsız ekran (Tabs dışı). | `contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}` ve `UserRole` guard ile yetkisizlere kapalıdır. |

---

## 3. Urban Floating UI Tasarım Standartları Uyumu

- **Birincil Marka Rengi:** `#14B8A6` (Turkuaz) birincil aksiyonlar, aktif sekmeler ve vurgulu rozetlerde tutarlı şekilde kullanılmıştır.
- **Yüzer Kartlar (Floating Cards):** `#FFFFFF` (Dark: `#1C3044`) zemin rengi, 1px sınır çizgisi (`#E2E8F0` / `#304154`) ve `radii.card` (20px) köşe yuvarlama ile hafif asılı durma hissi verilmiştir.
- **Tipografi Sistemi:** Başlıklarda `Plus Jakarta Sans` (Geometrik ve otoriter), gövde metinlerinde `Manrope` (Geniş aralıklı, yüksek okunabilirlik) kullanılmıştır.
- **İkon Dili:** `lucide-react-native` ikonları 18-24px boyut aralığında ve 1.8 - 2.5 çizgi kalınlığında (strokeWidth) standartlaştırılmıştır.
- **4px Grid Spacing:** Tüm boşluklar (8px, 12px, 16px, 20px, 24px, 32px) grid kurallarına sadıktır.
- **Erişilebilirlik (WCAG AA):** Metin-arka plan kontrastı en az 4.5:1, buton dokunma alanları (hit target) en az 44x44 pikseldir.

---

## 4. Ekran Boyutları ve Kenar Durumları (Edge Cases)

### 1. Küçük Ekran Yerleşimi (360px Genişlik — Giriş Seviyesi Android)
- Yatay filtre çipleri (`CategoryChip`, `FilterChip`) `ScrollView horizontal` içinde kaydırılabilir tutulmuş, metinlerin taşması veya sıkışması engellenmiştir.
- Kart içi başlıklar 2 satırla sınırlandırılmış (`numberOfLines={2}`), gereksiz boşluk yaratılmamıştır.

### 2. Gesture Navigation ve Sistem Çubukları (`useSafeAreaInsets`)
- `react-native-safe-area-context`'in `useSafeAreaInsets` hook'u kullanılarak tüm bağımsız ekranlarda `Math.max(insets.bottom + 32, 60)` alt kenar payı uygulanmıştır.
- Android 14/15 jest navigasyon çubuğu (home indicator pill) butonların veya form elemanlarının üzerine binmez.

### 3. Klavye Açılma Davranışı (`KeyboardAvoidingView`)
- Form ekranlarında (`CreateEventFlow`, `AuthModal`, `SettingsScreen`) `keyboardShouldPersistTaps="handled"` ve `Platform.OS === 'ios' ? 'padding' : undefined` ile Android'in doğal `adjustResize` davranışı desteklenmiştir.

### 4. Boş, Yükleniyor ve Hata Durumları
- Veri çekilirken jenerik gri ekran yerine `LoadingState` (turkuaz `ActivityIndicator`), hata anında açıklayıcı Türkçe mesaj ve `onRetry` aksiyonu içeren `ErrorState`, boş listelerde `EmptyState` standartlaştırılmıştır.
