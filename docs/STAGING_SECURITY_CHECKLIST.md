# ŞehirNabız — Staging Güvenlik ve Ağ Denetim Listesi (STAGING_SECURITY_CHECKLIST.md)

**Faz:** Phase 17 — Distributed Reliability, Outbox Delivery Assurance & Deployment Hardening  
**Tarih:** 29 Ekim 2026  
**Durum:** Denetlendi ve Doğrulandı (Phase 17 Sertleştirmeleri Uygulandı)  

---

## 1. Ağ ve İletişim Güvenliği

- [x] **Yerel Ağ Yalıtımı ve 127.0.0.1 Bind (Phase 17):** Staging Nginx portları `0.0.0.0` yerine kesin olarak `127.0.0.1:80` ve `127.0.0.1:443`'e bağlanmıştır. Aynı yerel ağdaki (Wi-Fi/LAN) yabancı cihazların staging ortamına erişmesi engellenmiştir.
- [x] **İç Altyapı Port İzolasyonu:** PostgreSQL (`5432`), Redis (`6379`), MinIO (`9000`) ve NestJS API (`3000`) portları Docker ana makinesine (host) ASLA expose edilmez; yalnızca izole staging bridge ağı içinde konuşurlar.
- [x] **Trusted Proxy ve Gerçek İstemci IP'si:** Nginx, `X-Forwarded-For` ve `X-Real-IP` başlıklarını ekler. NestJS `TRUSTED_PROXY_IPS` ile yalnızca iç Docker bridge ağındaki proxy isteklerine güvenir; IP sahteciliği (spoofing) engellenir.
- [x] **CORS İzin Listesi:** Geliştirme ortamındaki gevşek CORS kuralları kaldırılmış; `CORS_ORIGIN` ve `WEBSOCKET_CORS_ORIGIN` değişkenleri ile yalnızca yetkili staging etki alanlarına izin verilmiştir. Üretimde wildcard (`*`) fail-closed kuralıyla engellenmiştir.
- [x] **WebSocket Orijin Doğrulaması:** `/realtime` soket el sıkışmasında (handshake) CORS ve Origin eşleşmesi denetlenir.

---

## 2. HTTP ve Web Güvenlik Başlıkları (OWASP Standartları)

- [x] **HSTS (HTTP Strict Transport Security):** `Strict-Transport-Security: max-age=31536000; includeSubDomains` başlığı zorunludur.
- [x] **MIME Sniffing Koruması:** `X-Content-Type-Options: nosniff` başlığı tanımlıdır.
- [x] **Clickjacking Koruması:** `X-Frame-Options: DENY` başlığı ile iframe içine gömülme engellenir.
- [x] **Referrer Politikası:** `Referrer-Policy: strict-origin-when-cross-origin` ile hassas yönlendirme adresleri korunur.
- [x] **İstek Gövde Boyutu Sınırı:** `client_max_body_size 10M` ile DoS / bellek taşması saldırıları engellenir; medya yüklemeleri 10MB ile sınırlandırılır.

---

## 3. Hız Sınırlama (Rate Limiting)

- [x] **Genel API Sınırı:** Nginx düzeyinde IP başına saniyede azami 30 istek (`rate=30r/s`, `burst=20`).
- [x] **Kimlik Doğrulama Kalkanı:** `/api/v1/auth/` uç noktalarında kaba kuvvet (brute-force) saldırılarını engellemek için saniyede azami 5 istek (`rate=5r/s`, `burst=10`).
- [x] **Eşzamanlı Bağlantı Sınırı:** Tekil IP başına azami 20 eşzamanlı TCP bağlantısı (`limit_conn addr_conn_limit 20`).

---

## 4. Kimlik Doğrulama ve Hesap Silme Güvenliği

- [x] **Parola Zorunluluğu:** Uygulama içi veya web üzerinden hesap silme ve iptal işlemlerinde parolanın doğrulanması zorunludur (`bcrypt.compare`).
- [x] **PENDING_DELETION İzolasyonu:** Silme talebi vermiş kullanıcıların normal uygulama API'lerine erişimi `JwtAuthGuard` ile `401 Unauthorized` ile reddedilir.
- [x] **Seçici Yetkilendirme (`@AllowPendingDeletion`):** Yalnızca `GET /users/me/deletion-status` ve `POST /users/me/cancel-deletion` uç noktalarına kontrollü erişim verilir.
- [x] **Token ve Soket İmhası:** Silme anında tüm aktif `refresh_tokens` ve WebSocket soketleri derhal iptal edilir.
- [x] **Transactional Outbox İzolasyonu:** Silinen kullanıcıya ait bekleyen Outbox görevleri iptal edilir (`FAILED`), push tokenlar veritabanından kalıcı olarak silinir.

---

## 5. Teşhis, Hazırlık ve Altyapı Bilgi Sızması Koruması (Phase 17)

- [x] **Kamuya Açık Readiness Ayrımı (`GET /health/ready`):** Kamusal istemcilere (Nginx arkasından gelen istekler) iç altyapı bileşenleri (PostgreSQL bağlantı durumu, Redis ping süresi, MinIO disk bilgisi) ASLA ifşa edilmez. Kamuya yalnızca `{ status: "ok", timestamp: "..." }` yanıtı dönülür.
- [x] **Dahili Teşhis Koruması (`DiagnosticsGuard`):** `GET /health/diagnostics` uç noktası genel internete kapalıdır. Yalnızca `ADMIN` rolü veya `x-diagnostics-key` gizli anahtarı ile erişilebilir.
- [x] **Timing Attack Koruması:** Gizli anahtar doğrulaması `crypto.timingSafeEqual` ile zamanlama saldırılarına karşı korunmuştur.
- [x] **Sıfır Kesintili Secret Rotasyonu:** `DIAGNOSTICS_SECRET` virgülle ayrılmış birden fazla geçerli anahtarı kabul eder; anahtar değişiminde kesinti yaşanmaz.
- [x] **Log Sanitizasyonu:** Günlük kayıtlarında `x-diagnostics-key` veya hassas kimlik başlıkları maskelenir (`[REDACTED]`).
- [x] **Sıfır PII Metrikleri:** Diagnostics çıktısında kullanıcı adı, e-posta, koordinat veya olay başlığı kesinlikle yer almaz; yalnızca sistem sağlık durumları ve sayısal kuyruk metrikleri sunulur.
