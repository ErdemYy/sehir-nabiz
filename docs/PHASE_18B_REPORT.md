# ŞehirNabız — Phase 18B İlerleme ve Doğrulama Raporu (PHASE_18B_REPORT.md)

**Faz:** Phase 18B — İlk Android APK, Fiziksel Cihaz QA ve Görsel Doğrulama  
**Tarih:** 29 Ekim 2026  
**Önceki Onaylı Commit:** `7359eed` (Phase 18A)  
**Başlangıç Test Sayısı:** 415  
**Final Test Sayısı:** **415 test** (%100 Başarılı, 0 Hata)  
**Tasarım Dili:** Urban Floating UI (Minimal, Harita Odaklı, WCAG AA Uyumlu)  
**Durum:** 🟡 **EAS PROJE BAĞLANTISI VE BUILD TETİKLEMESİ İÇİN KULLANICI ONAYI BEKLENİYOR**

---

## 1. EAS Proje Durumu ve Hesap Denetimi

- **Aktif EAS Oturumu:** `erdem0w` (`erdem.ygtsy@gmail.com`) hesabı başarıyla tespit edildi.
  - Hesap Sahip Rolü: `erdem0w` (Owner), `erdem0w-s-team` (Owner).
  - *Güvenlik Notu:* Hiçbir API belirteci (token), parola veya oturum sırrı kaynak kodlara veya bu rapora yazılmamıştır.
- **Proje Bağlantısı Durumu:** `apps/mobile` dizininde henüz `extra.eas.projectId` tanımlı değildir (`EAS project not configured`).
- **Önerilen İşlem:** Kullanıcı onayı alındığında `cd apps/mobile && npx eas init --account erdem0w --non-interactive` çalıştırılarak proje Expo bulutuna bağlanacaktır.
- **Paket Kimlikleri Doğrulaması:**
  - `android.package`: `com.sehirnabiz.app` 🟢 (Doğrulandı)
  - `ios.bundleIdentifier`: `com.sehirnabiz.app` 🟢 (Doğrulandı)
  - `newArchEnabled`: `true` 🟢 (Doğrulandı)

---

## 2. Preview Profil Yapılandırması ve Ağ İletişimi Hazırlığı

`apps/mobile/eas.json` dosyasındaki `preview` profili denetlendi ve güncellendi:

```json
"preview": {
  "distribution": "internal",
  "channel": "preview",
  "developmentClient": false,
  "android": {
    "buildType": "apk"
  },
  "env": {
    "EXPO_PUBLIC_APP_ENV": "staging",
    "EXPO_PUBLIC_ENABLE_DEMO_MODE": "false",
    "EXPO_PUBLIC_API_URL": "http://172.2.0.130:3001/api/v1"
  }
}
```

### Derleme Zamanı ve Çalışma Zamanı Ağ Erişimi:
1. **Yerel Ağ IP Tespiti:** Geliştirici makinesinin aktif Wi-Fi IP adresi `172.2.0.130` olarak belirlendi.
2. **Localhost İzolasyonu:** Fiziksel Android telefonda çalıştırılacak APK'nın ulaşılamaz `localhost` veya `10.0.2.2` yerine doğrudan `http://172.2.0.130:3001/api/v1` adresine bağlanması sağlandı.
3. **Android Cleartext HTTP İzni:** Android 9+ (API 28+) varsayılan olarak şifrelenmemiş HTTP trafiğini engeller. Yerel testlerde API ve MinIO bağlantılarının kopmaması için `apps/mobile/android/app/src/main/AndroidManifest.xml` ve `apps/mobile/app.json` dosyalarına `android:usesCleartextTraffic="true"` eklendi.
4. **Ortam Kalkanı (`env.ts`):** `EXPO_PUBLIC_APP_ENV=staging` derlemelerinde yerel ağ IP'lerine izin verilirken, canlı mağaza `production` paketlerinde yerel döngü/LAN IP'lerinin bloke edilmesi garantilendi.

---

## 3. Expo Doctor ve Native Uyumluluk Analizi

`expo-doctor` tarafından raporlanan native hususlar incelendi:

1. **New Architecture & Prebuild Şema Uyarısı:**
   - Expo SDK 58 şemasında kök `app.json` içindeki `newArchEnabled` anahtarı ek özellik olarak uyarılmaktadır. Ancak MapLibre 11.5.0 C++ kütüphaneleri ve geriye dönük test tutarlılığı gereği `newArchEnabled=true` hem `app.json` hem de `android/gradle.properties` üzerinde eşzamanlı korunmaktadır.
2. **Non-CNG (Prebuild) Proje Yapısı:**
   - `@maplibre/maplibre-react-native` (11.5.0) bağımsız C++ vektör tile motoru gereksinimi sebebiyle `apps/mobile/android` prebuild klasörünün korunması beklenen mimari davranıştır.
3. **MapLibre 11.5.0 ve Gradle Ayarı:**
   - `android/gradle.properties` dosyasında `org.maplibre.reactnative.version=11.5.0` tanımlıdır.
   - `app.json` eklentilerinde `["@maplibre/maplibre-react-native", { "android": { "version": "11.5.0" } }]` doğrulanmıştır.

---

## 4. Presigned MinIO URL Güvenliği ve Port Haritası

- **Kriptografik İmza Kuralı (AWS SigV4):**
  - Presigned S3/MinIO URL'leri üretilirken `Host` başlığı (`X-Amz-SignedHeaders=host`) HMAC imzasının ayrılmaz bir bileşenidir.
  - İstemci tarafında host adresinin yeniden yazılması (URL rewriting/mutation) durumunda MinIO `403 SignatureDoesNotMatch` fırlatır.
  - **Uygulanan Çözüm:** Backend servisleri telefonla aynı Wi-Fi ağındayken `STORAGE_ENDPOINT=http://172.2.0.130:9000` ve `STORAGE_PUBLIC_URL=http://172.2.0.130:9000/sehir-nabiz-media` olarak yapılandırıldığında URL baştan doğru imzalanır ve sıfır istemci manipülasyonu ile yükleme tamamlanır.
- **Güvenlik Duvarı (Firewall) Port İhtiyacı:**
  - `3001`: NestJS API & WebSocket `/realtime`
  - `9000`: MinIO Depolama (Presigned PUT & GET)

---

## 5. Fiziksel Cihaz QA Test Planı (APK Sonrası Akışlar)

APK derlendikten sonra kullanıcının Android telefonunda denetlenecek 15 kritik akış:

| # | Test Akışı | Beklenen Davranış | Cihaz Doğrulama Durumu |
| :-: | :--- | :--- | :-: |
| 1 | **Uygulama Açılışı (Splash & TTI)** | Turkuaz splash ekranı ardından ana haritanın < 2.5s içinde belirmesi | ⏳ APK Bekleniyor |
| 2 | **Harita Render & GPU** | OpenGL/Vulkan donanım ivmesiyle vektör sokakların ve binaların akıcı çizilmesi | ⏳ APK Bekleniyor |
| 3 | **MapLibre Kamera Hareketi** | Pan, zoom ve iki parmak döndürme jestlerinin 60 FPS akıcılıkta olması | ⏳ APK Bekleniyor |
| 4 | **Floating Tab Bar** | 5 sekmenin harita üzerinde yüzer biçimde konumlanması ve sekme geçişleri | ⏳ APK Bekleniyor |
| 5 | **Kategori Filtreleri** | Yatay çiplere dokunulduğunda harita pinlerinin filtrelenmesi | ⏳ APK Bekleniyor |
| 6 | **Olay Detayları & BottomSheet**| Pin tıklandığında alttan kart açılması ve detay sayfasına geçiş | ⏳ APK Bekleniyor |
| 7 | **Kullanıcı Girişi / Kayıt** | Parola ve JWT token'ın SecureStore'a kaydedilmesi | ⏳ APK Bekleniyor |
| 8 | **Olay Oluşturma Sihirbazı** | 3 adımlı form akışı ve klavye açıldığında butonların görünür kalması | ⏳ APK Bekleniyor |
| 9 | **Konum İzni** | Android sistem izin diyaloğunun açılması ve mevcut koordinatın okunması | ⏳ APK Bekleniyor |
| 10 | **Fotoğraf Yükleme** | Kameradan/galeriden görsel seçimi ve MinIO'ya presigned PUT yüklemesi | ⏳ APK Bekleniyor |
| 11 | **Bildirim Ekranı** | Gruplanmış bildirim listesi ve okunmamış rozet sayacı | ⏳ APK Bekleniyor |
| 12 | **Profil ve Ayarlar** | İtibar seviyesi kartı, katkı istatistikleri ve ayarlar ekranı | ⏳ APK Bekleniyor |
| 13 | **Tema Geçişleri** | Açık (Light) ve Koyu (Dark) mod geçişlerinde Urban Floating UI kontrastı | ⏳ APK Bekleniyor |
| 14 | **WebSocket Bağlantısı** | `/realtime` ağ geçidine bağlanma ve canlı olay yayını alma | ⏳ APK Bekleniyor |
| 15 | **Hesap Silme Ekranı** | Parola korumalı modal, 14 günlük bekleme modu uyarısı ve silme talebi | ⏳ APK Bekleniyor |

> *Taahhüt: Gerçek cihaz kullanıcıya ait olduğundan, kullanıcı kanıtı (ekran görüntüleri ve loglar) gelmeden bu akışlar tamamlandı kabul edilmeyecektir.*

---

## 6. Urban Floating UI Görsel Kalite Denetim Kriterleri

Kullanıcıdan gelecek ekran görüntüleri üzerinde incelenecek detaylar:
- **Metin Taşmaları:** Küçük ekranlı cihazlarda (360px-390px) başlıkların 2 satırda kesilmesi (`numberOfLines={2}`) ve yatay çiplerin kaydırılabilirliği.
- **Buton Dokunma Alanları:** Minimum 44x44px dokunma hedefi (WCAG AA).
- **Safe Area & Sistem Çubukları:** Android 14/15 jest navigasyon çubuğu ile FloatingTabBar ve form butonlarının çakışmaması (`useSafeAreaInsets`).
- **Renk ve Kontrast:** Turkuaz birincil aksiyonlar (`#14B8A6`), kart sınır çizgileri (`#E2E8F0` / `#304154`) ve en az 4.5:1 kontrast oranı.

---

## 7. Regresyon Test Sonuçları

Tüm test paketleri monorepo genelinde `--force` ile çalıştırılmış ve sıfır hata ile tamamlanmıştır:

| Test Paketi | Test Sayısı | Başarılı | Başarısız | Durum |
| :--- | :---: | :---: | :---: | :---: |
| **API Birim ve Entegrasyon Testleri** | 274 | 274 | 0 | 🟢 PASS |
| **Mobil Bileşen ve Hook Testleri** | 122 | 122 | 0 | 🟢 PASS |
| **Tasarım Tokenları Testleri** | 11 | 11 | 0 | 🟢 PASS |
| **Shared Paketi Testleri** | 8 | 8 | 0 | 🟢 PASS |
| **TOPLAM** | **415** | **415** | **0** | **%100 PASS** |

### Derleme ve Doğrulama Hattı:
- `pnpm turbo run test --force`: **6/6 Başarılı (415 test)**
- `pnpm turbo run typecheck`: **6/6 Başarılı (Strict mode)**
- `pnpm turbo run lint`: **6/6 Başarılı**
- `pnpm turbo run build`: **3/3 Başarılı**
- `expo config --type public`: **Geçerli ve Hatasız**
- `graphify update .`: **3174 düğüm, 6893 kenar, 180 topluluk güncellendi**

---

## 8. Kullanıcı Onayı Gereken Karar Noktaları

Kullanıcının açık onayı olmadan hiçbir işlem yapılmamaktadır:

1. **`eas init` Onayı:** `apps/mobile` için `npx eas init --account erdem0w --non-interactive` komutunu çalıştırarak mevcut hesaba bağlayalım mı?
2. **Preview APK Derleme Onayı:** Proje kimliği bağlandıktan sonra `eas build --platform android --profile preview` komutunu başlatıp ilk dahili test APK'sını derleyelim mi?
3. **API Uç Noktası Onayı:** APK derlemesi için Wi-Fi yerel ağ adresiniz `http://172.2.0.130:3001/api/v1` olarak yapılandırılmıştır. Telefonunuzun aynı Wi-Fi ağına bağlı olduğunu onaylıyor musunuz?
