# ŞehirNabız — Gerçek Cihaz ve Yerel Ağ (LAN) Bağlantı Rehberi (DEVICE_NETWORK_SETUP.md)

**Faz:** Phase 18A — Android Native Build Readiness & Mobile Visual QA  
**Tarih:** 29 Ekim 2026  
**Durum:** Hazırlık Tamamlandı (Henüz Gerçek Cihaz Bağlantısı Yapılmadı)  

---

## 1. Giriş ve Karşılaşılan Ağ Sorunları

Geliştirme aşamasında web tarayıcıları ve emülatörler doğrudan `http://localhost:3000` veya Android emülatör döngü adresi `http://10.0.2.2:3000` üzerinden API'ye erişebilir.

Ancak **fiziksel bir Android veya iOS cihazında test yaparken:**
1. Telefon üzerindeki `localhost`, telefonun kendi dahili döngü adresidir; geliştirici bilgisayarına bağlanamaz.
2. `10.0.2.2` yalnızca Android Studio emülatörü sanal ağı için geçerlidir; fiziksel Wi-Fi ağında çalışmaz.
3. Bilgisayar ile telefonun **aynı yerel Wi-Fi ağına** bağlı olması ve bilgisayarın LAN IP adresinin (`192.168.x.x` veya `10.x.x.x`) kullanılması şarttır.

---

## 2. Geliştirici Bilgisayarı LAN IP Tespiti

Windows ortamında bilgisayarınızın yerel ağ IP adresini öğrenmek için:

```powershell
ipconfig
```

Çıktıda aktif Wi-Fi veya Ethernet bağdaştırıcısının `IPv4 Address` değerini not edin (Örnek: `192.168.1.105`).

---

## 3. Mobil İstemci Ortam Değişkeni Yapılandırması

Mobil uygulamanın telefon üzerinde bilgisayardaki NestJS API servisine erişebilmesi için `apps/mobile/.env` veya EAS ortam değişkenlerinde aşağıdaki adres tanımlanmalıdır:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.105:3000/api/v1
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_ENABLE_DEMO_MODE=false
```

> [!WARNING]
> **Canlı Üretim Güvenlik Kuralı:** Phase 17'de devreye alınan `env.ts` kuralı gereğince, `EXPO_PUBLIC_APP_ENV=production` olduğunda yerel LAN IP'leri (`192.168.x.x`) veya `localhost` adresleri güvenlik nedeniyle otomatik olarak bloke edilir ve uygulama başlamayı reddeder.

---

## 4. MinIO Presigned URL ve S3 İmza Bütünlüğü Kuralı (Kritik)

Fotoğraf yükleme sürecinde istemci önce API'den bir presigned upload URL'si alır, ardından bu URL'ye ikili (binary) PUT isteği atar.

### Kriptografik İmza Kuralı (AWS SigV4 HMAC-SHA256):
- MinIO presigned URL'si üretilirken hedef sunucunun `Host` başlığı (`X-Amz-SignedHeaders=host`) HMAC-SHA256 imzasının parçasıdır.
- **İSTEMCİ MANİPÜLASYONU YASAĞI:** Eğer backend presigned URL'yi `http://localhost:9000/...` olarak üretirse ve mobil istemci telefon üzerinde bu adresi kod içinde `http://192.168.1.105:9000/...` ile değiştirmeye çalışırsa, MinIO imza denetiminde **`SignatureDoesNotMatch (403 Forbidden)`** hatası fırlatır!

### Doğru Çözüm:
Backend `.env` dosyasında MinIO depolama uç noktası bilgisayarın LAN IP'si ile hizalanmalıdır:

```env
# apps/api/.env (Fiziksel cihaz testleri için)
STORAGE_ENDPOINT=http://192.168.1.105:9000
STORAGE_PUBLIC_URL=http://192.168.1.105:9000/sehir-nabiz-media
```

Bu sayede backend presigned URL'yi baştan `192.168.1.105:9000` başlığı ile imzalar; mobil istemci hiçbir değişiklik yapmadan doğrudan bu adrese yükleme yapar ve imza kusursuz geçer.

---

## 5. WebSocket ve Gerçek Zamanlı Bağlantı Hizalaması

[`apps/mobile/src/features/realtime/services/socketService.ts`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/mobile/src/features/realtime/services/socketService.ts) mimarisi soket adresini doğrudan `getApiBaseUrl()` üzerinden türetir:

```typescript
const hostUrl = getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
// Çıktı: http://192.168.1.105:3000
const socketUrl = `${hostUrl}/realtime`;
// Çıktı: http://192.168.1.105:3000/realtime
```

Bu sayede API URL'si LAN IP'sine çekildiğinde WebSocket `/realtime` ağ geçidi de ek bir ayara ihtiyaç duymaksızın otomatik olarak doğru sunucuya bağlanır.

---

## 6. Windows Güvenlik Duvarı (Firewall) ve Port İzinleri

Fiziksel telefonun bilgisayardaki servislere ulaşabilmesi için Windows Güvenlik Duvarı'nda ilgili portların yerel ağ (Private Network) için açık olması gerekir:

| Servis | Port | Protokol | Amaç |
| :--- | :---: | :---: | :--- |
| **Metro Bundler** | `8081` | TCP | Expo JS Bundle ve kaynak dosyaların aktarımı |
| **NestJS API** | `3000` | TCP | REST API ve WebSocket `/realtime` trafiği |
| **MinIO Depolama** | `9000` | TCP | Presigned fotoğraf yükleme (PUT) ve görsel indirme |

Gerekirse PowerShell (Yönetici) ile hızlı kural eklenebilir:
```powershell
New-NetFirewallRule -DisplayName "SehirNabiz-Dev-Ports" -Direction Inbound -LocalPort 3000,8081,9000 -Protocol TCP -Action Allow -Profile Private
```

---

## 7. Özet Kontrol Listesi (Pre-Flight Checklist)

- [ ] Telefon ve geliştirici bilgisayarı aynı 2.4GHz/5GHz Wi-Fi ağına bağlı.
- [ ] Bilgisayarın LAN IP adresi (`192.168.x.x`) tespit edildi.
- [ ] `EXPO_PUBLIC_API_URL` LAN IP ile güncellendi.
- [ ] Backend `STORAGE_ENDPOINT` LAN IP ile hizalandı.
- [ ] Windows Firewall 3000, 8081 ve 9000 portlarına izin verdi.
- [ ] Telefon tarayıcısından `http://<LAN_IP>:3000/health` adresine gidilerek `{"status":"ok"}` yanıtı teyit edildi.
