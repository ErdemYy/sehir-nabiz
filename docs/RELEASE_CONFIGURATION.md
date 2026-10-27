# ŞehirNabız — Dağıtım ve Yayın Yapılandırması Kılavuzu (RELEASE_CONFIGURATION.md)

**Tarih:** 27 Ekim 2026  
**Faz:** Phase 14 — Güvenli Hesap Silme, Veri Yaşam Döngüsü ve Release Blocker Düzeltmeleri  
**Son Durum:** Yapılandırma Standartları, Mağaza Uyumluluğu ve Hesap Silme Desteği  

---

## 1. Giriş ve Amaç

Bu doküman, ŞehirNabız mobil uygulamasının ve backend servislerinin **Geliştirme (Development)**, **Önizleme/Staging (Preview)** ve **Canlı/Üretim (Production)** ortamları arasındaki yapılandırma ayrımını, kimlik tanımlayıcılarını, mağaza gereksinimlerini ve güvenlik kurallarını tanımlar.

---

## 2. Mobil Uygulama Kimlik ve Mağaza Tanımlayıcıları

Mobil istemci yapılandırması `apps/mobile/app.json` ve `apps/mobile/eas.json` dosyaları üzerinden yönetilir:

| Alan | Değer / Kural | Açıklama |
| :--- | :--- | :--- |
| **Uygulama Adı (`name`)** | `ŞehirNabız` | Kullanıcının ana ekranında ve mağazada görünen resmî isim. |
| **Uygulama Slug (`slug`)** | `sehir-nabiz` | Expo ve EAS proje tanımlayıcısı. |
| **Sürüm (`version`)** | `0.1.0` | Semantik sürümleme formatı (SemVer). |
| **Android Package ID** | `com.sehirnabiz.app` | Google Play Store benzersiz paket kimliği. |
| **Android Version Code** | `1` | Google Play yüklemeleri için artan tamsayı. |
| **iOS Bundle Identifier** | `com.sehirnabiz.app` | Apple App Store benzersiz paket kimliği. |
| **iOS Build Number** | `"1"` | TestFlight ve App Store derleme sürümü. |
| **Runtime Version** | `{"policy": "appVersion"}` | EAS Update OTA güncellemelerinin native uyumluluk kilidi. |
| **Yönelim (`orientation`)** | `portrait` | Harita ve form düzeni için dikey mod kilitlidir. |
| **Arayüz Teması** | `automatic` | Sistem aydınlık/karanlık modunu otomatik takip eder. |

---

## 3. Görsel Varlıklar (App Icons & Splash Screen)

Tüm görsel varlıklar `apps/mobile/assets/` dizininde mevcuttur:

1. **Uygulama Simgesi (`icon.png`):** $1024 \times 1024$ px, Urban Floating UI birincil rengi (`#14B8A6`) zemin üzerinde şehir nabız dalgası ve harita pini sembolü.
2. **Android Uyarlanabilir Simge (`adaptive-icon.png`):** Arka plan rengi `#14B8A6`, ön plan görseli `./assets/adaptive-icon.png`.
3. **Açılış Ekranı (Splash Screen - `splash.png`):** Arka plan rengi `#14B8A6`, resizeMode: `contain`, görsel: `./assets/splash.png`.

---

## 4. İzinler ve Gizlilik Açıklamaları (Permissions & Info.plist)

Mağaza inceleme süreçlerinde (Apple App Review & Google Play Data Safety) red almamak amacıyla tüm izin gerekçeleri Türkçe, şeffaf ve açık olarak tanımlanmıştır:

### iOS (`Info.plist`)
- `NSLocationWhenInUseUsageDescription`: *"ŞehirNabız, harita üzerinde çevrenizdeki olayları göstermek ve konumunuza yakın bildirimlerde bulunmanızı sağlamak için konum izni gerektirir."*
- `NSPhotoLibraryUsageDescription`: *"ŞehirNabız, bildirdiğiniz olaya fotoğraf ekleyebilmeniz için galerinize erişim izni gerektirir."*
- `NSCameraUsageDescription`: *"ŞehirNabız, olayı doğrudan fotoğraflayabilmeniz için kamera erişim izni gerektirir."*

### Android (`AndroidManifest.xml` / `permissions`)
- `ACCESS_FINE_LOCATION`: Harita merkezini ve olay yerini hassas GPS ile işaretleyebilmek için.
- `ACCESS_COARSE_LOCATION`: Yaklaşık şehir ve ilçe filtreleri için.
- `CAMERA`: Olay yerinde anlık fotoğraf çekebilmek için.
- `READ_MEDIA_IMAGES`: Galeriden fotoğraf seçebilmek için (Android 13+).

---

## 5. Ortam Bazlı Yapılandırma Matrisi (EAS Build Profiles)

`apps/mobile/eas.json` dosyasında ortamlar kesin sınırlarla ayrılmıştır:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development",
      "android": { "buildType": "apk", "gradleCommand": ":app:assembleDebug" },
      "ios": { "simulator": true },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "development",
        "EXPO_PUBLIC_ENABLE_DEMO_MODE": "false"
      }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "android": { "buildType": "apk" },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "staging",
        "EXPO_PUBLIC_ENABLE_DEMO_MODE": "false"
      }
    },
    "production": {
      "autoIncrement": true,
      "channel": "production",
      "android": { "buildType": "app-bundle" },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "production",
        "EXPO_PUBLIC_ENABLE_DEMO_MODE": "false"
      }
    }
  }
}
```

---

## 6. Güvenli API ve WebSocket URL Çözümleme Stratejisi

`apps/mobile/src/config/env.ts` dosyası aşağıdaki katı kuralları işletir:

1. **Production'da Loopback/Localhost Yasağı:**
   Eğer `EXPO_PUBLIC_APP_ENV === 'production'` veya `!__DEV__` ise; `localhost`, `127.0.0.1`, `10.0.2.2`, `192.168.*` veya `10.*` adresleri **kesinlikle reddedilir** ve API URL'si boş string döner. İstek gönderilmesi engellenir.
2. **Tanımsız Production URL Kalkanı:**
   Canlı ortamda `EXPO_PUBLIC_API_URL` ortam değişkeni tanımlanmamışsa yerel emülatör IP'sine fallback verilmez; derleme ve çalışma anı **BLOCKED** durumuna geçer.
3. **WebSocket Senkronizasyonu:**
   Canlı soket URL'si, doğrulanmış API ana bilgisayar adresi üzerinden (`hostUrl + '/realtime'`) türetilir. Eğer API adresi boşsa soket bağlantısı hiç başlatılmaz; döngüsel çökme (crash loop) engellenir.
4. **Halka Açık Değişken İlkesi:**
   `EXPO_PUBLIC_*` ön ekine sahip tüm değişkenler derleme anında JavaScript paketine düz metin olarak gömülür. Hiçbir veritabanı şifresi, S3 gizli anahtarı veya servis sırrı bu değişkenlerde saklanamaz.

---

## 7. Demo Modu Güvenlik Sınırı

- **Geliştirme Ortamı:** `EXPO_PUBLIC_ENABLE_DEMO_MODE="true"` açıkça belirtilirse, kontrollü Kayseri sentetik olayları yalnızca çevrimdışı önizleme amacıyla kullanılabilir. Tüm demo olayları `[DEMO]` öneki ve sıfır güvenilirlik puanıyla izole edilir.
- **Production Ortamı:** `NODE_ENV === 'production'` veya `__DEV__ === false` olduğu anda `isDevelopmentDemoEnabled()` fonksiyonu istisnasız `false` döner. Canlı veritabanına veya haritaya tek bir sentetik kayıt sızamaz.

---

## 8. Yayın Hazırlık Durumu (Release Readiness Status)

> [!WARNING]
> **Mevcut Durum: 🟡 BETA READINESS (Teknik Altyapı Hazır, Dağıtım Öncesi 3 Engel Kalan)**  
> Uygulama release konfigürasyonu yerel olarak tam ve hatasızdır; Mağaza hesap silme şartı (Apple Guideline 5.1.1(v) & Google Play Data Safety) Phase 14 ile eksiksiz tamamlanmıştır.

---

## 9. Native Paket ve Bağımlılık Doğrulaması (MapLibre & Paket Kimliği)

Phase 14 denetimi kapsamında bağımlılık kilitleri ve kimlik tanımlayıcıları doğrulanmıştır:

### MapLibre Native Sürümü
- **`apps/mobile/package.json`:** `"@maplibre/maplibre-react-native": "11.5.0"`
- **`pnpm-lock.yaml`:** `@maplibre/maplibre-react-native@11.5.0`
- **Doğrulama Sonucu:** Projede kurulu ve çalışan gerçek sürüm **`11.5.0`**'dır. Geçmiş dokümanlarda yer alan `10.1.1` ifadesi yazım hatası olup 11.5.0 donanım hızlandırmalı vektör harita motoru kullanılmaktadır.
- **Config Plugin Uyumu:** `@maplibre/maplibre-react-native` Expo config plugini `apps/mobile/app.json` içinde `plugins` dizisinde kayıtlıdır ve Prebuild/EAS derleme adımlarında native Android/iOS projelerine doğru Maven/CocoaPods bağımlılıklarını enjekte eder.

### Android Paket Kimliği & iOS Bundle ID Kararı
- **`apps/mobile/app.json`:**
  - `android.package`: `com.sehirnabiz.app`
  - `ios.bundleIdentifier`: `com.sehirnabiz.app`
- **Karar:** Mağaza kimliği olarak Android ve iOS platformlarında tutarlı biçimde tek bir kanonik değer belirlenmiştir: **`com.sehirnabiz.app`**.
- Geçmiş notlardaki `com.sehirnabiz.mobile` ifadesi bir taslak önerisi olup hiçbir derleme dosyasına veya konfigürasyona yansıtılmamıştır. Mevcut tüm testler (`phase_6_5.test.js`, `phase_13.test.js`, `phase_14.test.js`) `com.sehirnabiz.app` değerini onaylamaktadır.

---

## 10. Apple App Store & Google Play Hesap Silme Uyumluluğu

Apple App Store İnceleme Kılavuzu Kuralı 5.1.1(v) ve Google Play Data Safety politikaları uyarınca hesap oluşturan her uygulamanın kullanıcıya hem uygulama içerisinden hem de harici bir web sayfası üzerinden hesabını ve kişisel verilerini silme imkânı sunması zorunludur.

| Gereksinim | ŞehirNabız Çözümü | Durum |
| :--- | :--- | :--- |
| **Uygulama İçi Silme** | `apps/mobile/app/profile/settings.tsx` — Profil Ayarları altında "Tehlike Bölgesi" modalı | **Tamamlandı** |
| **Uygulama İçi Doğrulama** | Şifre tekrarı (`password`), isteğe bağlı silme nedeni (`reason`) ve anında silme seçeneği (`immediate`) | **Tamamlandı** |
| **Harici Web Silme Sayfası** | NestJS SSR: `GET /account-deletion` & Expo Web: `/account-deletion` | **Tamamlandı** |
| **Web Silme API'si** | `POST /api/v1/users/web-deletion-request` (E-posta, şifre ve onay bayrağı ile) | **Tamamlandı** |
| **Bekleme Süresi (Grace Period)** | 14 gün (`AccountStatus.PENDING_DELETION`), iptal edebilme imkânı (`POST /api/v1/users/cancel-deletion`) | **Tamamlandı** |
| **PII Veri Maskeleme** | E-posta, isim, şifre hash'i rastgele maskeleme; push token ve oturumların anında yok edilmesi | **Tamamlandı** |
| **Kentsel Güvenlik Olayları** | Kamu yararı taşıyan kaza ve afet raporları silinmez; yazar kimliği `"Anonim Vatandaş"` olarak korunur | **Tamamlandı** |

