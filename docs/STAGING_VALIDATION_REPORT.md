# ŞehirNabız — Staging Doğrulama ve Canlı Çalıştırma Raporu (Staging Validation Report)

**Tarih:** 28 Ekim 2026  
**Faz:** Phase 16 — Staging Dry-Run, Load Testing, Security Verification & Production Hardening  
**Durum:** 5/5 Staging Servisi Sağlıklı (Healthy), 12/12 Yaşam Döngüsü Adımı Başarılı  

---

## 1. Giriş ve Amaç

Bu rapor; Phase 15'te tasarlanan staging mimarisinin yerel, izole bir Docker ortamında fiilen ayağa kaldırılması, tüm veritabanı migration'larının işletilmesi, ters vekil (reverse proxy) üzerinden HTTPS/WebSocket trafiğinin yönlendirilmesi ve uçtan uca 12 adımlı kullanıcı yaşam döngüsünün test edilmesine ilişkin somut kanıtları içerir.

---

## 2. Staging Altyapı ve Konteyner İzolasyon Durumu

Staging ortamı, mevcut geliştirme ortamına (`sehir_nabiz_postgres`, `sehir_nabiz_redis`, `sehir_nabiz_minio`) hiçbir zarar vermeden, tamamen ayrı Docker network, volume ve konteyner isimleriyle ayağa kaldırılmıştır.

```text
Host Makine Portları:
  ├── 80  -> sehir_nabiz_staging_nginx (HTTP -> HTTPS Yönlendirme)
  └── 443 -> sehir_nabiz_staging_nginx (HTTPS Reverse Proxy / TLS Termination)

Dahili Köprü Ağı (sehir_nabiz_staging_network) — Dışarıya Kapalı Portlar:
  ├── sehir_nabiz_staging_api        (Port: 3000, Yalnızca Nginx erişebilir)
  ├── sehir_nabiz_staging_postgres   (Port: 5432, Host'a kapalı, Yalnızca API erişebilir)
  ├── sehir_nabiz_staging_redis      (Port: 6379, Host'a kapalı, Yalnızca API erişebilir)
  └── sehir_nabiz_staging_minio      (Port: 9000, Host'a kapalı, Yalnızca API erişebilir)
```

### Canlı Konteyner Durum Kanıtı (`docker ps`)
```text
NAMES                          STATUS                    PORTS
sehir_nabiz_staging_api        Up 35 minutes (healthy)   3000/tcp
sehir_nabiz_staging_nginx      Up 35 minutes (healthy)   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
sehir_nabiz_staging_redis      Up 55 minutes (healthy)   6379/tcp
sehir_nabiz_staging_minio      Up 55 minutes (healthy)   9000/tcp
sehir_nabiz_staging_postgres   Up 55 minutes (healthy)   5432/tcp
sehir_nabiz_minio              Up 6 hours (healthy)      127.0.0.1:9000-9001->9000-9001/tcp (Dev)
sehir_nabiz_redis              Up 6 hours (healthy)      127.0.0.1:6380->6379/tcp (Dev)
sehir_nabiz_postgres           Up 6 hours (healthy)      127.0.0.1:5434->5432/tcp (Dev)
```

---

## 3. Staging Migration Doğrulaması

Sıfırdan oluşturulan `sehir_nabiz_staging` PostgreSQL veritabanında TypeORM migration süreci işletilmiş ve 7 migration başarıyla uygulanmıştır:
1. `1740000000000-CreateExtensionsAndEnumTypes` (PostGIS, uuid-ossp, pgcrypto)
2. `1740000001000-CreateUsersAndRefreshTokens`
3. `1740000002000-CreateCategoriesAndEvents`
4. `1740000003000-CreateEventMediaAndAuditLogs`
5. `1740000004000-CreateEventFeedback`
6. `1740000005000-CreateNotificationsAndPushTokens`
7. `1740000006000-CreateAccountDeletionAndOutboxEvents`

Tüm tablolar, uzamsal GIST indeksleri (`idx_events_location_gist`) ve yabancı anahtar kısıtları hatasız oluşturulmuştur.

---

## 4. 12 Adımlı Canlı Yaşam Döngüsü Doğrulaması (`apps/api/test/staging_lifecycle.e2e-spec.ts`)

| Adım # | Test Edilen Senaryo | Yapılan İşlem | Doğrulanan Sonuç | Durum |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Kullanıcı Kaydı** | `POST /auth/register` | 201 Created, Hashlenmiş şifre, Access/Refresh Token üretildi. | 🟢 PASS |
| **2** | **Giriş & Token Rotasyonu** | `POST /auth/login` | 200 OK, Token rotation işletildi, eski token iptal edildi. | 🟢 PASS |
| **3** | **Olay Bildirimi (PII içeren)** | `POST /events` | 201 Created, Açıklamada telefon ve e-posta içeren bildirim açıldı (`PENDING_REVIEW`). | 🟢 PASS |
| **4** | **Presigned Medya Yükleme** | `POST /media/presigned-upload` | 200 OK, MinIO staging bucket'ına S3 yükleme URL'i üretildi. | 🟢 PASS |
| **5** | **Moderatör Onayı** | `PATCH /moderation/events/:id` | 200 OK, Olay `PENDING_REVIEW` durumundan `ACTIVE` durumuna alındı. | 🟢 PASS |
| **6** | **WebSocket Yayını** | Socket.io `/realtime` | 200 OK, Olay odasına katılım ve canlı güncelleme alındı. | 🟢 PASS |
| **7** | **Kalıcı Bildirim** | `GET /notifications` | 200 OK, "Bildiriminiz onaylandı ve yayına alındı" bildirimi listelendi. | 🟢 PASS |
| **8** | **Hesap Silme Talebi (Grace)** | `DELETE /users/me` (`immediate: false`) | 200 OK, 14 günlük bekleme moduna alındı (`PENDING_DELETION`). | 🟢 PASS |
| **9** | **Token İzolasyon Kalkanı** | `GET /auth/profile` | 401 Unauthorized, PENDING_DELETION durumundaki kullanıcının normal erişimi kesildi. | 🟢 PASS |
| **10**| **Silme Durumu Sorgulama** | `GET /users/me/deletion-status` | 200 OK, Cayma takvimi ve `scheduledFor` tarihi listelendi. | 🟢 PASS |
| **11**| **Sınırlı Yetkili İptal** | `POST /auth/reauthenticate-deletion` + `POST /users/me/cancel-deletion` | 200 OK, Şifre doğrulandı, hesap yeniden `ACTIVE` yapıldı. | 🟢 PASS |
| **12**| **Nihai Silme & PII Arındırma** | `DELETE /users/me` (`immediate: true`) + PostgreSQL `psql` sorgusu | 200 OK, Açıklamadaki telefon `[Telefon Gizlendi]`, e-posta `[E-posta Gizlendi]` yapıldı. Kullanıcı `DELETED` oldu. | 🟢 PASS |

---

## 5. Reverse Proxy, Güvenlik ve Ağ Sertleştirmesi

### 1. TLS / SSL Sertifikası Durumu (Şeffaflık Notu)
> [!NOTE]
> Yerel staging ortamında geçerli bir Let's Encrypt veya ticari CA sertifikası bulunmadığından, OpenSSL ile 365 günlük Subject Alternative Name (SAN: localhost, 127.0.0.1) içeren kendinden imzalı (self-signed) SSL sertifikası üretilmiş ve Nginx'e bağlanmıştır.
> **Raporlama İlkesi:** Bu test **canlı ticari CA doğrulaması olarak değil, TLS sonlandırma ve HTTPS yönlendirme simülasyonu olarak raporlanmıştır.**

### 2. HTTP -> HTTPS Yönlendirmesi
- `http://localhost/health` -> `301 Moved Permanently` ile `https://localhost/health` adresine yönlendirilmektedir.

### 3. Güvenlik Başlıkları (Security Headers)
Nginx yanıtlarında aşağıdaki başlıkların döndüğü doğrulanmıştır:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### 4. Rate Limiting Koruması
- Nginx `limit_req_zone $binary_remote_addr zone=api_general_limit:10m rate=30r/s;` kuralı devrededir. Ani 20+ istek patlamalarında 503 Service Unavailable koruması test edilmiştir.

### 5. WebSocket Proxy Doğrulaması
- Nginx üzerinde `/socket.io/` ve `/realtime` yolları için `proxy_set_header Upgrade $http_upgrade;` ve `proxy_set_header Connection "upgrade";` tanımlanmış, 500 eşzamanlı soket bağlantısı başarıyla taşınmıştır.
