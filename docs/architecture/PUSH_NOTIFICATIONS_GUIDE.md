# ŞehirNabız — Akıllı Push Bildirimleri ve Cihaz Token Rehberi (PUSH_NOTIFICATIONS_GUIDE.md)

Bu rehber, ŞehirNabız mobil istemcisinde ve NestJS API katmanında kullanılan Expo Push Token altyapısını, gizlilik standartlarını, teslimat adaptörünü ve hata yönetimini açıklar.

---

## 1. Mimari Genel Bakış

```text
[ Mobil Cihaz ] ---> expo-notifications
        |
        | 1. Token Talebi (getExpoPushTokenAsync)
        v
[ Expo Push Servisi ]
        |
        | 2. "ExponentPushToken[...]"
        v
[ Mobil Cihaz ] ---> POST /api/v1/devices/push-token (JWT ile)
        |
        v
[ NestJS API ] ---> PostgreSQL `device_push_tokens` (Aktif/Pasif)
        |
        +-- Olay Onayı / Çözümü Tetiklendiğinde
        |
        v
[ PushNotificationService ] ---> HTTP POST https://exp.host/--/api/v2/push/send
        |
        v
[ FCM (Android) / APNs (iOS) ] ---> [ Kullanıcı Cihazı ]
```

---

## 2. Gizlilik ve Veri Minimizasyonu

1. **Gereksiz Cihaz Kimliği Toplamama:** Kullanıcının IMEI, MAC adresi veya donanım seri numarası asla toplanmaz.
2. **Korumalı Cihaz Tanımlayıcısı:** İsteğe bağlı `deviceIdentifier` alanı yalnızca tek yönlü SHA-256 hash veya anonim UUID formatında kabul edilir.
3. **Konum Bazlı Bildirimlerin Varsayılan Durumu:** Yeni kullanıcıların `nearbyEvents` tercihi varsayılan olarak `false` tutulur; kullanıcı açık rıza göstermedikçe zorunlu konum bildirimleri gönderilmez.
4. **Oturum Kapatma (Sign-out):** Kullanıcı oturumunu kapattığında aktif push tokenı veritabanında `isActive = false` yapılarak oturumu kapatılmış hesaba bildirim gitmesi engellenir.

---

## 3. Expo Push Backend Adaptörü ve Geliştirici Modu

Gerçek EAS kimlik bilgileri veya FCM/APNs anahtarları tanımlanmadığında geliştirme ortamının aksamaması için iki modlu bir adaptör uygulanmıştır:

1. **Kontrollü Test / Simülasyon Adaptörü (`DEV ADAPTER`):**
   - Ortam `NODE_ENV !== 'production'` ve `EXPO_ACCESS_TOKEN` tanımsız ise, dış ağa gereksiz istek yapılmaz.
   - Bildirim loglara güvenli biçimde simüle edilir ve başarılı sayaç dönülür.
2. **Üretim / Canlı Gönderim:**
   - `EXPO_ACCESS_TOKEN` tanımlandığında Expo Push API'sine batch formatında POST yapılır.
   - İade edilen receipt'lerde `DeviceNotRegistered` hatası alan tokenlar anında tespit edilerek veritabanında pasifleştirilir.

---

## 4. Android Bildirim Kanalı (Notification Channel)

Android 8.0+ (API 26) gereksinimleri uyarınca yüksek öncelikli bildirim kanalı tanımlanmıştır:

```typescript
await Notifications.setNotificationChannelAsync('sehir-nabiz-default', {
  name: 'ŞehirNabız Gelişmeleri',
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#0D9488', // Kentsel Turkuaz
});
```

---

## 5. Doğrulama Durumu ve Sorumluluk Reddi

> [!WARNING]
> Fiziksel cihaz üzerinde gerçek native push bildirimi teslimatı, gerçek EAS Project ID ve Firebase/APNs kimlik bilgileri yapılandırılana kadar **doğrulanmamış (unverified)** olarak kabul edilir. Geliştirme ortamında testler kontrollü simülasyon adaptörü ve in-app WebSocket ile güvenceye alınmıştır.
