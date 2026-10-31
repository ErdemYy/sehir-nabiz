# ŞehirNabız — Phase 18B: Expo EAS Proje Bağlantısı ve Ücretsiz iOS Test Hazırlığı Raporu (PHASE_18B_IOS_PREPARATION.md)

**Proje:** ŞehirNabız  
**Tarih:** 29 Ekim 2026  
**Son Onaylı Commit:** `7359eed`  
**Geliştirme Ortamı:** Windows 11  
**Mevcut Test Sayısı:** **415 / 415 (%100 Başarılı, 0 Hata)**  
**Platform:** iOS (Simulator Odaklı / Ücretsiz Apple ID Hazırlığı)  
**Tasarım Dili:** Urban Floating UI (WCAG AA Uyumlu, Harita Odaklı)  
**Durum:** 🟢 **EAS BULUT DERLEMESİ TAMAMLANDI (FINISHED) — iOS SIMULATOR ARTEFAKTI ÜRETİLDİ**

---

## 1. Expo ve EAS Hesap Durumu

| Parametre | Değer / Durum | Doğrulama Yöntemi |
| --- | --- | --- |
| **Kullanıcı Adı** | `erdem0w` | `pnpm dlx eas-cli whoami` |
| **E-posta** | `erdem.ygtsy@gmail.com` | `pnpm dlx eas-cli whoami` |
| **Hesap Rolü** | `erdem0w` (Owner), `erdem0w-s-team` (Owner) | EAS CLI oturum denetimi |
| **Hesap Planı** | Free / Hobby (Ücretsiz Bireysel Plan) | Expo Dashboard |
| **Aylık Build Kotası** | 30 Derleme / Ay (Kullanılan: 2 derleme - 1 hata çözümü + 1 başarılı tamamlanma) | `eas build:list` |
| **Apple Developer Hesabı** | Standart Ücretsiz Apple ID (Ücretli Program Yok) | Kullanıcı Beyanı / Mimari Kısıt |

> [!NOTE]
> Proje kod tabanında, çevresel dosyalarda veya bu raporda hiçbir EAS API belirteci (token), parola veya oturum sırrı saklanmamıştır. Güvenlik ve kimlik denetimi işletim sistemi kullanıcı anahtarlığı üzerinden yürütülmektedir.

---

## 2. EAS Proje Bağlantısı ve Konfigürasyon Doğrulaması

Proje Expo bulut altyapısına başarıyla bağlanmış ve proje kimliği yapılandırılmıştır:

- **EAS Proje Adı:** `@erdem0w/sehir-nabiz`
- **EAS Project ID:** `f69b5cd2-90cb-430a-b4fe-1b18aabe3636`
- **Expo Dashboard URL:** [https://expo.dev/accounts/erdem0w/projects/sehir-nabiz](https://expo.dev/accounts/erdem0w/projects/sehir-nabiz)
- **Doğrulanan Yapılandırma Dosyası:** [`apps/mobile/app.json`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/mobile/app.json#L77-L88)
  ```json
  "extra": {
    "router": {
      "asyncRoutes": {
        "web": true
      }
    },
    "eas": {
      "projectId": "f69b5cd2-90cb-430a-b4fe-1b18aabe3636"
    }
  },
  "owner": "erdem0w"
  ```
- **CLI Doğrulaması:** `cd apps/mobile && pnpm dlx eas-cli project:info` komutu ile `@erdem0w/sehir-nabiz` ve ID `f69b5cd2-90cb-430a-b4fe-1b18aabe3636` başarıyla teyit edilmiştir.

---

## 3. iOS Native Uyumluluk Denetimi

iOS platformu için Expo ve React Native uyumluluk matrisi incelenmiş ve eksiksiz doğrulanmıştır:

1. **Expo SDK & React Native:**
   - Expo SDK: `58.0.0` (`~58.0.19`)
   - React Native: `0.88.0`
   - React: `19.3.0`
2. **Harita Motoru (MapLibre Native):**
   - `@maplibre/maplibre-react-native`: `11.5.0`
   - Bağımsız vektör harita motoru, donanım ivmeli Metal render desteği ve MapTiler / OpenMapTiles vektör tile uyumluluğu.
3. **Paket ve Bundle Tanımı:**
   - `name`: `SehirNabiz` (Dahili Xcode proje adı ve scheme adı, ASCII uyumlu)
   - `ios.infoPlist.CFBundleDisplayName`: `ŞehirNabız` (iOS ana ekranında ve sistemde görünen Türkçe ad)
   - `ios.bundleIdentifier`: `com.sehirnabiz.app`
   - `ios.buildNumber`: `"1"`
   - `ios.supportsTablet`: `true`
   - `ios.infoPlist.ITSAppUsesNonExemptEncryption`: `false` (App Store / TestFlight şifreleme uyumluluğu)
4. **Yeni Mimari ve JS Motoru:**
   - New Architecture: `newArchEnabled: true` (`app.json` ve Expo 58 varsayılanı)
   - JavaScript Motoru: Hermes (AOT bytecode derleme)
5. **Navigasyon ve Monorepo:**
   - Expo Router: `~58.0.26` (Dosya tabanlı yönlendirme ve `typedRoutes: true`)
   - Metro Monorepo Yapılandırması: [`apps/mobile/metro.config.js`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/mobile/metro.config.js#L1-L19) `watchFolders` ve `nodeModulesPaths` ile `@sehir-nabiz/shared` ve `@sehir-nabiz/design-tokens` paketlerini sorunsuz çözmektedir.
6. **iOS Native İzin Metinleri (`ios.infoPlist` & Config Plugins):**
   - `NSLocationWhenInUseUsageDescription`: *"ŞehirNabız, harita üzerinde çevrenizdeki olayları göstermek ve konumunuza yakın bildirimlerde bulunmanızı sağlamak için konum izni gerektirir."*
   - `NSPhotoLibraryUsageDescription`: *"ŞehirNabız, bildirdiğiniz olaya fotoğraf ekleyebilmeniz için galerinize erişim izni gerektirir."*
   - `NSCameraUsageDescription`: *"ŞehirNabız, olayı doğrudan fotoğraflayabilmeniz için kamera erişim izni gerektirir."*

---

## 4. iOS Simulator Profili Yapılandırması

Ücretli Apple Developer üyeliği ($99/yıl) gerektirmeyen, kod imzalamasız (no code signing certificate / provisioning profile) testler için [`apps/mobile/eas.json`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/mobile/eas.json#L36-L53) dosyasında `ios-simulator` profili oluşturulmuştur:

```json
"ios-simulator": {
  "distribution": "internal",
  "channel": "preview",
  "developmentClient": false,
  "ios": {
    "simulator": true,
    "scheme": "SehirNabiz"
  },
  "env": {
    "EXPO_PUBLIC_APP_ENV": "staging",
    "EXPO_PUBLIC_ENABLE_DEMO_MODE": "false",
    "EXPO_PUBLIC_API_URL": "http://172.2.0.130:3001/api/v1"
  }
}
```

### Profil Özellikleri:
- **`ios.simulator: true`:** EAS Build altyapısına Apple Developer sertifikası ve imzalama gerektirmeyen x86_64 / arm64 iOS Simulator uygulaması (`.tar.gz` içeren `.app`) derlemesini bildirir.
- **`ios.scheme: "SehirNabiz"`:** Fastlane / Xcode derleme aşamasında scheme adı uyuşmazlığını engellemek için açıkça tanımlanmıştır.
- **`developmentClient: false`:** Bağımsız (standalone) bir sürüm oluşturur; Metro geliştirme sunucusuna bağımlı olmadan çalışır.
- **`distribution: internal`:** EAS paneli üzerinden doğrudan indirilebilir internal test paketi olarak işaretler.

---

## 5. EAS Build Sonucu ve Log Analizi

EAS bulut derlemesi kullanıcının onayı ile çalıştırılmış ve başarıyla tamamlanmıştır.

### Başarılı Build Detayları:
- **Build ID:** `4fd17432-5b2e-4427-a11b-b5073c83dfc4`
- **Platform:** `iOS Simulator`
- **Profil:** `ios-simulator`
- **Durum:** 🟢 **`FINISHED`**
- **Derleme Süresi:** 513 saniye (~8.5 dakika)
- **EAS Build Sayfası:** [https://expo.dev/accounts/erdem0w/projects/sehir-nabiz/builds/4fd17432-5b2e-4427-a11b-b5073c83dfc4](https://expo.dev/accounts/erdem0w/projects/sehir-nabiz/builds/4fd17432-5b2e-4427-a11b-b5073c83dfc4)
- **Artefakt İndirme Bağlantısı:** [https://expo.dev/artifacts/eas/8tFWeAFHS4-4qmqK0JX-ediXWFgWIU4qNQXkeAzBvoI.tar.gz](https://expo.dev/artifacts/eas/8tFWeAFHS4-4qmqK0JX-ediXWFgWIU4qNQXkeAzBvoI.tar.gz)
- **Artefakt Türü:** iOS Simulator Application Archive (`.tar.gz` formatında sıkıştırılmış `SehirNabiz.app`)

### Kök Neden Analizi ve Düzeltilen Sorun (İlk Build Deneyimi):
İlk başlatılan EAS derlemesinde (`a8e00c51-f452-40eb-8190-e6d8c9a26cd7`) şu hata meydana gelmiştir:
```text
EAS_BUILD_UNKNOWN_FASTLANE_ERROR: The scheme 'ehirNabz' does not exist in your Xcode workspace.
Make sure that the scheme exists and is marked as shared.
```
- **Kök Neden:** Windows işletim sisteminde çalışan EAS CLI istemcisi, `app.json` içerisindeki Türkçe karakterli `name: "ŞehirNabız"` değerini ASCII'ye indirgerken Türkçe karakterleri (`Ş`, `ı`) kırparak `"ehirNabz"` adında bir scheme aramıştır. Buna karşılık Expo Prebuild, macOS derleyicide Türkçe karakterleri transliterasyon ile `SehirNabiz` adıyla projeye işlemiştir.
- **Güvenli Çözüm:** 
  1. `apps/mobile/app.json` içinde proje adı `name: "SehirNabiz"` olarak belirlenmiş, kullanıcıya görünen ana ekran adı ise `ios.infoPlist.CFBundleDisplayName: "ŞehirNabız"` olarak korunmuştur.
  2. `apps/mobile/eas.json` içinde `ios.scheme: "SehirNabiz"` açıkça eklenmiştir.
- Bu güvenli düzeltmeyle derleme baştan sona hatasız tamamlanmış ve `FINISHED` durumuna ulaşmıştır.

---

## 6. Bulut Simülatör ve Yerel Simülasyon İmkanları

| Simülasyon Yöntemi | Durum | Teknik Gerekçe ve Değerlendirme |
| --- | --- | --- |
| **Expo Cloud Interactive Simulator (Appetize.io)** | **BLOCKED** | Ücretsiz Expo planında yerleşik tarayıcı içi canlı iOS simülatör oynatıcısı sunulmamaktadır (Appetize.io üyeliği veya ücretli Expo On-Demand plan gerektirir). |
| **Yerel macOS Xcode Simulator** | **MÜMKÜN (macOS Cihaz Varsa)** | Derlenen `.tar.gz` paketi, macOS kullanan herhangi bir bilgisayarda `tar -xzf` ile açılıp `xcrun simctl install booted <app>` komutuyla ücretsiz çalıştırılabilir. |
| **Fiziksel iPhone IPA Kurulumu** | **BLOCKED** | Ücretli Apple Developer Program olmadan ad-hoc/TestFlight IPA imzası alınamaz. |

---

## 7. Ağ Bağlantısı ve API İletişim Sınırları

1. **Geliştirici Yerel Ağ IP'si:** `172.2.0.130` (Wi-Fi LAN).
2. **Simülatör Ağ İzolasyonu:**
   - **Yerel Wi-Fi Simülatörü:** Aynı yerel Wi-Fi ağına bağlı bir Mac üzerindeki Xcode Simulator, `http://172.2.0.130:3001/api/v1` adresine doğrudan ulaşabilir.
   - **Bulut Simülatörleri (Appetize / Remote VMs):** İnternet üzerindeki bulut simülatörleri, geliştirici makinesinin özel RFC1918 `172.2.0.130` adresine **erişemez**. Canlı veri testleri için Cloudflare Tunnel veya ngrok gibi bir HTTPS tüneli veya genel IP'ye sahip Staging sunucusu şarttır.
3. **Güvenlik Koruma Kalkanı:**
   - [`apps/mobile/src/config/env.ts`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/mobile/src/config/env.ts#L18-L59) dosyasında üretim ortamında (`production`) yerel IP ve localhost kullanımı engellenmiş; staging ve development için kontrollü geçiş sağlanmıştır.

---

## 8. Kalite Doğrulama ve Test Sonuçları

Tüm monorepo genelinde 415 test eksiksiz çalıştırılmış, statik tipler, lint kuralları ve paket derlemeleri doğrulanmıştır:

| Paket / Modül | Test Aracı | Test Sayısı | Başarılı | Başarısız | Durum |
| --- | --- | --- | --- | --- | --- |
| **`sehir-nabiz-api`** | Vitest | 274 | 274 | 0 | 🟢 PASS |
| **`sehir-nabiz-mobile`** | Node.js Test Runner | 122 | 122 | 0 | 🟢 PASS |
| **`@sehir-nabiz/design-tokens`** | Node.js Test Runner | 11 | 11 | 0 | 🟢 PASS |
| **`@sehir-nabiz/shared`** | Node.js Test Runner | 8 | 8 | 0 | 🟢 PASS |
| **TOPLAM** | — | **415** | **415** | **0** | **%100 PASS** |

### İlave Doğrulamalar:
- `pnpm turbo run typecheck`: **6/6 paket başarılı** (TypeScript Strict Mode)
- `pnpm turbo run lint`: **6/6 paket başarılı**
- `pnpm turbo run build`: **3/3 paket başarılı** (`api`, `shared`, `design-tokens`)
- `expo config --type public`: **Geçerli ve hatasız**

---

## 9. Graphify Bilgi Grafı Metrikleri

Projenin AST tabanlı bağımlılık grafiği güncellenmiştir:

- **Toplam Düğüm (Nodes):** 3212
- **Toplam Kenar (Edges):** 6929
- **Topluluk Sayısı (Communities):** 177
- **Depolama Konumu:** `graphify-out/` (`graph.json`, `graph.html`, `GRAPH_REPORT.md`)

---

## 10. Gerçek iPhone İçin Kalan Engeller (Ücretsiz Hesap Kısıtları)

Ücretli Apple Developer Program ($99/yıl) olmadan gerçek bir iPhone cihazında test yapmanın önündeki teknik engeller ve yasal sınırlar:

1. **Ad-Hoc ve TestFlight Dağıtım Yasağı:** Apple, geçerli bir kurumsal veya bireysel ücretli geliştirici hesabı olmadan TestFlight veya imzalı `.ipa` dağıtımına izin vermez.
2. **Provisioning Profile Yokluğu:** Fiziksel bir iPhone'a uygulama kurabilmek için cihazın UDID'sinin Apple Developer Portal'da kayıtlı olması ve bir Apple Distribution/Development sertifikasıyla imzalanması zorunludur.
3. **Windows 11 Ortamında Sideloading İmkânsızlığı:** Ücretsiz Apple ID ile geliştirme cihazına geçici yükleme (Personal Team / 7 günlük sertifika) yalnızca macOS üzerinde çalışan Xcode ile kabloyla bağlı bir iPhone'a yapılabilir. Windows üzerinden bu profil oluşturulamaz.
4. **Push Bildirimleri (APNs) Kısıtlaması:** Apple Push Notification Service (APNs) anahtarları yalnızca ücretli geliştirici hesaplarında üretilebilir; simülatörde veya sideload edilen cihazlarda canlı APNs push bildirimleri çalışmaz (yerel bildirimler hariç).

---

## 11. Simülatör Paketini Çalıştırma Rehberi (macOS Ortamı İçin)

Elde edilen derleme artefaktını macOS üzerinde Xcode Simulator ile çalıştırmak için izlenecek adımlar:

1. **Artefaktı İndirin:**
   ```bash
   curl -L -o sehir-nabiz-simulator.tar.gz "https://expo.dev/artifacts/eas/8tFWeAFHS4-4qmqK0JX-ediXWFgWIU4qNQXkeAzBvoI.tar.gz"
   ```
2. **Arşivi Açın:**
   ```bash
   tar -xzf sehir-nabiz-simulator.tar.gz
   # Çıktı: SehirNabiz.app
   ```
3. **Xcode Simulator'ı Başlatın:**
   ```bash
   open -a Simulator
   ```
4. **Uygulamayı Simülatöre Yükleyin ve Çalıştırın:**
   ```bash
   xcrun simctl install booted SehirNabiz.app
   xcrun simctl launch booted com.sehirnabiz.app
   ```

---

## 12. Sonuç ve Durum Değerlendirmesi

- ŞehirNabız iOS uygulaması, **sıfır maliyetle** (Apple Developer Program veya ücretli EAS planı satın alınmadan), Expo EAS altyapısı üzerinden başarıyla native x86_64/arm64 iOS Simulator paketine dönüştürülmüştür.
- Tüm mimari güvenlik standartları, strict TypeScript tipleri, 415 test ve MapLibre 11.5.0 entegrasyonu tam uyumla doğrulanmıştır.
- Bulutta etkileşimli oynatıcı ücretsiz planda yer almadığından ve Windows ortamında iOS simülatörü çalıştırılamadığından, iOS tarafındaki native doğrulama "derleme düzeyinde başarılı" (build verified) olarak işaretlenmiştir; cihaz/simülatör üzerinde görsel yürütme için bir macOS ortamı veya fiziksel Android QA (Phase 18B Android Preview APK) süreci önerilmektedir.
