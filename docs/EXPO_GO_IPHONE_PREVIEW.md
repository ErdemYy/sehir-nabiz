# ŞehirNabız — Expo Go iPhone QR Önizleme Modu Dokümantasyonu (EXPO_GO_IPHONE_PREVIEW.md)

**Proje:** ŞehirNabız  
**Tarih:** 29 Ekim 2026  
**Platform:** iOS (Fiziksel iPhone + Expo Go İstemcisi)  
**Tasarım Dili:** Urban Floating UI  
**Metro Adresi:** `exp://172.2.0.130:8081`  
**Durum:** 🟢 **METRO GÖZLEMCİ SUNUCUSU AKTİF — QR KOD KULLANIMA HAZIR**

---

## 1. Expo Go Uyumluluk Durumu

Expo Go, App Store üzerinden herhangi bir Apple Developer hesabı gerektirmeden iPhone'a indirilebilen bir test ortamıdır. Ancak Expo Go yalnızca çekirdek Expo SDK modüllerini içerir ve özel C++/Objective-C native kütüphaneleri barındırmaz.

| Modül / Özellik | Expo Go Durumu | ŞehirNabız Çözümü / Uyumluluk |
| --- | --- | --- |
| **`@maplibre/maplibre-react-native` (Vektör Harita)** | ❌ Native binary bulunmaz | Metro çözümleyicisinde (`metro.config.js`) otomatik olarak [`apps/mobile/src/mocks/maplibre-stub.tsx`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/mobile/src/mocks/maplibre-stub.tsx) ile değiştirilir; çalışma anında ise Urban Floating UI tasarımına sahip [`ExpoGoMapPreview.tsx`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/mobile/src/features/map/components/ExpoGoMapPreview.tsx) etkileşimli harita simülatörü devreye girer. |
| **`expo-location` (GPS Konum Servisleri)** | ✅ Tam Uyumlu | Fiziksel iPhone GPS koordinatları canlı olarak alınır (`Location.getCurrentPositionAsync`). |
| **`expo-image-picker` (Kamera ve Galeri)** | ✅ Tam Uyumlu | Fotoğraf çekme ve albümden görsel seçme akışı çalışır. |
| **`expo-secure-store` (Güvenli Depolama)** | ✅ Tam Uyumlu | JWT oturum belirteçleri iOS Keychain üzerinde saklanır. |
| **Expo Router & Navigasyon** | ✅ Tam Uyumlu | Tab geçişleri, Floating Tab Bar, stack modal'lar kusursuz çalışır. |
| **Tasarım Sistemi (`@sehir-nabiz/design-tokens`)** | ✅ Tam Uyumlu | WCAG AA renkleri, Plus Jakarta Sans, Manrope fontları, 4px aralık sistemi ve Dark/Light temalar %100 aktiftir. |
| **Canlı WebSocket (`socket.io-client`)** | ✅ Uyumlu | LAN üzerinden API erişilebilirse canlı olay güncellemeleri dinlenir. |
| **Push Bildirimleri (APNs)** | ⚠️ Sınırlı | Uzaktan APNs push bildirimleri Expo Go'da kısıtlıdır; yerel bildirimler (`expo-notifications`) çalışır. |

---

## 2. Önizleme Modu Mimarisi

Önizleme modu, üretim kod tabanını kesinlikle bozmadan üç katmanlı bir izolasyon kalkanı ile tasarlanmıştır:

```text
┌────────────────────────────────────────────────────────┐
│               iPhone (Expo Go İstemcisi)               │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / WebSocket (Port 8081)
┌───────────────────────────▼────────────────────────────┐
│          Metro Bundler (apps/mobile/metro.config.js)   │
│  - isExpoGo algılayıcısı devrede                      │
│  - @maplibre/maplibre-react-native -> maplibre-stub    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│      ŞehirNabız Runtime Güvenlik & Preview Katmanı     │
│  - src/config/preview.ts (Production'da asla açılmaz)  │
│  - PulseMapView -> ExpoGoMapPreview (Görsel Simülatör) │
│  - LocationPickerModal -> ExpoGoLocationPickerPreview  │
│  - Tüm sekmeler: Feed, Bildir, Profil, İstatistikler   │
└────────────────────────────────────────────────────────┘
```

1. **Metro Düzeyi İzolasyon ([`metro.config.js`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/mobile/metro.config.js)):**
   `npx expo start --go` çalıştırıldığında veya `EXPO_GO_PREVIEW=true` olduğunda `@maplibre/maplibre-react-native` importları stub dosyasına yönlendirilir. Böylece Expo Go açılışta `Native module cannot be null` hatası vermez.
2. **Güvenlik Koruma Kalkanı ([`src/config/preview.ts`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/mobile/src/config/preview.ts)):**
   Eğer `env.appEnv === 'production'` ise önizleme modu **asla** aktifleşemez (her zaman `false` döner). Üretim sürümünde gerçek MapLibre Native motoru çalışmaya devam eder.
3. **Etkileşimli UI Bileşeni ([`ExpoGoMapPreview.tsx`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/mobile/src/features/map/components/ExpoGoMapPreview.tsx)):**
   Harita sekmesinde donanım hızlandırmalı vektör harita yerine, Urban Floating UI grid'i, etkileşimli kategori pinleri, yakınlaştırma butonları ve tıklandığında gerçek olay detay BottomSheet kartını açan tam işlevsel bir önizleme sunulur.

---

## 3. Çalıştırma Komutları ve Erişim

Metro geliştirme sunucusu arka planda çalışır durumdadır. İlerleyen süreçte yeniden başlatmak için:

```bash
# apps/mobile dizininde:
cmd /c "cd apps\mobile && set \"CI=true\" && npx expo start --go --lan"
# veya package.json komutuyla:
pnpm run preview:go
```

### Bağlantı URL'si:
* **Expo Go URL:** `exp://172.2.0.130:8081`
* **Metro Durum Kontrolü:** `http://172.2.0.130:8081/status` -> `packager-status:running`

---

## 4. iPhone Üzerinden Test Edilmesi Gereken Ekranlar

Fiziksel iPhone cihazınızda Expo Go üzerinden incelemeniz önerilen akışlar:

1. **Harita Arayüzü (`/(tabs)/index`):**
   * Üstteki Floating Arama Çubuğu ve 11 adet yatay kategori çipi (`Tümü`, `Trafik`, `Kaza`, `Yol Çalışması` vb.).
   * Harita simülasyonu üzerindeki kategori renkli pinler; pine dokunulduğunda alttan açılan gerçek `BottomSheet` olay kartı.
   * Sağdaki katmanlar (Layers), pusula ve ısı haritası (Heatmap) aç/kapa butonları.
2. **Olay Akışı Sekmesi (`/(tabs)/feed`):**
   * Şehir olaylarının kart listesi, doğrulama puanları ve kategori filtreleri.
3. **Olay Bildirme Ekranı (`/(tabs)/create`):**
   * 3 adımlı bildirim sihirbazı.
   * Konum seçici modal (`ExpoGoLocationPickerPreview`) ve gerçek iPhone GPS konumunun alınması.
   * Fotoğraf yükleme / kamera seçimi (`expo-image-picker`).
4. **Bildirimler Sekmesi (`/(tabs)/notifications`):**
   * Bildirim listesi, kategori rozetleri ve zaman damgaları.
5. **Profil Sekmesi (`/(tabs)/profile`):**
   * Vatandaş güvenilirlik skoru kartı, rozetler ve istatistikler.
6. **Ayarlar Ekranı (`/profile/settings`):**
   * **Açık / Koyu Tema (Light / Dark mode)** geçişi (Urban Floating UI renk kontrastı).
7. **Şehir İstatistikleri (`/stats`):**
   * Şehir genel bakışı, kategori dağılım grafikleri ve güvenli bölgeler.
8. **Hesap Silme Ekranı (`/account-deletion`):**
   * KVKK / GDPR uyumlu 14 günlük bekleme süreli hesap silme ve anında silme arayüzü.

---

## 5. Bilinen Sınırlamalar

1. **Vektör Harita Motoru (MapLibre Native):**
   Expo Go native C++ kütüphanelerini derleyemediğinden, 3D binalar, GPU vektör karoları ve MapLibre Metal donanım hızlandırması Expo Go içinde çalışmaz. Bu özellikler için daha önce tamamladığımız **Phase 18B iOS Simulator Build** (`4fd17432-5b2e-4427-a11b-b5073c83dfc4`) veya Android test APK'sı kullanılır.
2. **Wi-Fi LAN Ağı Erişimi:**
   iPhone ve geliştirme bilgisayarının aynı yerel Wi-Fi ağına (`172.2.0.x`) bağlı olması gerekir. Ağda cihazlar arası izolasyon (client isolation) varsa Metro sunucusuna ulaşılamaz; bu durumda `npx expo start --go --tunnel` seçeneği tercih edilmelidir.
3. **Canlı Backend API Erişimi:**
   API sunucusu yerel makinenizde çalışırken (`http://172.2.0.130:3001/api/v1`), iPhone'un bilgisayarınızın güvenlik duvarından (Windows Firewall) 3001 portuna erişebilmesi gerekir. API çevrimdışı olsa dahi arayüz mock/demo verileriyle kusursuz incelenebilir.
