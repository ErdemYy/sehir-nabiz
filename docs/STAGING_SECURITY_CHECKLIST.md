# ŞehirNabız — Staging Güvenlik ve Ağ Denetim Listesi (STAGING_SECURITY_CHECKLIST.md)

**Faz:** Phase 15 — Account Deletion Verification, Privacy Hardening & Staging Readiness  
**Tarih:** 28 Ekim 2026  
**Durum:** Denetlendi ve Doğrulandı  

---

## 1. Ağ ve İletişim Güvenliği

- [x] **Ters Vekil (Reverse Proxy) Yalıtımı:** PostgreSQL (`5432`), Redis (`6379`) ve NestJS API (`3000`) portları dış dünyaya kapalıdır. Yalnızca Nginx portları (`80`, `443`) dış trafiği karşılar.
- [x] **Trusted Proxy ve Gerçek İstemci IP'si:** Nginx, `X-Forwarded-For` ve `X-Real-IP` başlıklarını ekler. NestJS `TRUSTED_PROXY_IPS` ile yalnızca iç Docker bridge ağındaki proxy isteklerine güvenir; IP sahteciliği (spoofing) engellenir.
- [x] **CORS İzin Listesi:** Geliştirme ortamındaki gevşek CORS kuralları kaldırılmış; `CORS_ORIGIN` ve `WEBSOCKET_CORS_ORIGIN` değişkenleri ile yalnızca yetkili staging etki alanlarına izin verilmiştir.
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

## 5. Operasyonel Görünürlük ve Veri Gizliliği (Zero-PII)

- [x] **Teşhis Uç Noktası Koruması:** `GET /health/diagnostics` uç noktası genel internete kapalıdır; yalnızca dahili IP bloklarından (`127.0.0.1`, `172.16.0.0/12`) erişilebilir.
- [x] **Sıfır PII Metrikleri:** Diagnostics çıktısında kullanıcı adı, e-posta, koordinat veya olay başlığı kesinlikle yer almaz; yalnızca sistem sağlık durumları ve sayısal kuyruk metrikleri sunulur.
