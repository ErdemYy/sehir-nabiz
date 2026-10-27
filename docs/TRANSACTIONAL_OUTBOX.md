# ŞehirNabız — Transactional Outbox Mimarisi ve Güvenilirlik Belgesi

Bu belge, ŞehirNabız kentsel olay ekosisteminde veri kaybını önlemek, dağıtık sistemlerde olay tutarlılığını sağlamak ve harici tüketicilere (WebSocket Gateway, Expo Push Notification, Redis Cache Eviction) **en az bir kez teslimat (at-least-once delivery)** garantisi sunmak amacıyla geliştirilen PostgreSQL tabanlı **Transactional Outbox** mimarisini belgeler.

---

## 1. Problem Tanımı ve Mimari Gerekçe (Dual-Write Problemi)

Phase 10 sonrasında tespit edilen en kritik mimari risk, **Dual-Write (Çift Yazma)** problemidir:
- **Senaryo:** Bir kullanıcı yeni olay bildirdiğinde veya moderatör bir olayı onayladığında, durum TypeORM transaction'ı içerisinde `events` tablosuna yazılır.
- **Risk:** Transaction commit edildikten hemen sonra, ancak WebSocket yayını veya push bildirim çağrısı henüz tamamlanmadan sunucu çökerse, işlemci yeniden başlarsa veya dış ağ hatası oluşursa; olay veritabanında güncellenmiş kalır fakat kullanıcılara bildirim **asla ulaşmaz**.
- **Ters Senaryo:** Bildirim harici servise transaction commit öncesinde iletilirse ve transaction son anda rollback olursa, vatandaşlara gerçekleşmemiş sahte olay bildirimleri (Ghost Events) gönderilmiş olur.

### Çözüm: Transactional Outbox Pattern
Olayın durum değişikliği ile o değişikliğin yaratacağı dış etkiyi (Outbox kaydı) **aynı ACID PostgreSQL transaction'ı içinde** atomik olarak yazmak.
Transaction commit edilirse iki kayıt da kalıcı olur; transaction rollback olursa iki kayıt da geri alınır. Harici ağ çağrıları ise bağımsız bir arka plan Worker'ı tarafından veritabanından okunarak güvenle yürütülür.

```
+---------------------------------------------------------------------------------+
|                         POSTGRESQL TRANSACTION (ACID)                           |
|                                                                                 |
|   1. UPDATE events SET status = 'ACTIVE' ...                                    |
|   2. INSERT INTO event_moderation_logs ...                                      |
|   3. INSERT INTO outbox_events (aggregate_id, event_type, payload, status) ...  |
|                                                                                 |
|                        COMMIT (Hepsi Veya Hiçbiri)                               |
+---------------------------------------------------------------------------------+
                                      |
                           (DB Commit Garantisi)
                                      v
+---------------------------------------------------------------------------------+
|                         OUTBOX PROCESSOR (Worker)                               |
|                                                                                 |
|   SELECT ... FOR UPDATE SKIP LOCKED (Yarış durumu korumalı batch çekme)         |
|   status = 'PROCESSING', lock_lease_expires_at = NOW() + 30s                    |
|                                                                                 |
|       +-----------------------------------------------------------------+       |
|       |                     TÜKETİCİLER (Consumers)                     |       |
|       |                                                                 |       |
|       |   [WebSocket]     realtimeService.broadcastEventStatusChanged() |       |
|       |   [Push/In-App]   notificationsService.createNotification()     |       |
|       |                   (Consumer Idempotency: idempotency_key)       |       |
|       |   [Redis Cache]   redisService.del('stats:overview:*')          |       |
|       +-----------------------------------------------------------------+       |
|                                      |                                          |
|            +-------------------------+-------------------------+                |
|            | Başarılı                                          | Hata           |
|            v                                                   v                |
|   status = 'PROCESSED'                              attempts < 5                |
|   processed_at = NOW()                        ? status = 'PENDING' + Backoff    |
|                                               : status = 'FAILED' (Dead-letter) |
+---------------------------------------------------------------------------------+
```

---

## 2. Veritabanı Şeması (`outbox_events`)

```sql
CREATE TYPE outbox_status_enum AS ENUM (
  'PENDING',
  'PROCESSING',
  'PROCESSED',
  'FAILED'
);

CREATE TABLE IF NOT EXISTS outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type VARCHAR(64) NOT NULL,
  aggregate_id UUID NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  payload JSONB NOT NULL,
  status outbox_status_enum NOT NULL DEFAULT 'PENDING',
  attempts INT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  lock_lease_expires_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hızlı kuyruk tüketimi için bileşik indeks
CREATE INDEX IF NOT EXISTS idx_outbox_events_status_next_attempt 
  ON outbox_events (status, next_attempt_at);

-- Domain aggregate izleme indeksi
CREATE INDEX IF NOT EXISTS idx_outbox_events_aggregate 
  ON outbox_events (aggregate_type, aggregate_id);
```

### Alan Açıklamaları
- `id`: Olayın evrensel benzersiz kimliği (UUID v4). Tüketicilerde `idempotency_key` kökü olarak kullanılır (`outbox:{id}:{userId}`).
- `aggregate_type`: Üst domain nesnesi (`Event`, `Feedback`, `User`).
- `aggregate_id`: İlgili varlığın birincil anahtarı (UUID).
- `event_type`: Olay sınıfı (`EVENT_CREATED`, `EVENT_STATUS_CHANGED`, `EVENT_FEEDBACK_SUBMITTED`, `EVENT_FEEDBACK_REMOVED`).
- `payload`: Olayın işlenmesi için gereken asgari veri paketi (JSONB). Kişisel şifre, token ve binary dosyalardan arındırılmıştır (Sanitized).
- `status`: Durum makinesi (`PENDING` -> `PROCESSING` -> `PROCESSED` veya `FAILED`).
- `attempts`: Gerçekleşen deneme sayısı.
- `next_attempt_at`: Bir sonraki deneme zaman damgası (Exponential backoff desteği).
- `lock_lease_expires_at`: Worker kilit kiralama süresi (Varsayılan 30 saniye). Çöken worker'ların kilitlediği olayları kurtarır.
- `last_error`: Başarısızlık durumunda kaydedilen son hata mesajı.

---

## 3. Worker Mimarisi ve Concurrency Kontrolü

### 3.1. `FOR UPDATE SKIP LOCKED` ile Yarış Durumu Koruması
Birden fazla NestJS kümeleme düğümü veya arka plan worker'ı çalıştığında, aynı outbox kaydının birden fazla işlemci tarafından çekilmesini önlemek için PostgreSQL'in donanım seviyesindeki satır kilitleme mekanizması kullanılır:

```sql
UPDATE outbox_events
SET status = 'PROCESSING',
    lock_lease_expires_at = NOW() + '30 seconds'::interval,
    attempts = attempts + 1
WHERE id IN (
  SELECT id FROM outbox_events
  WHERE (status = 'PENDING' AND next_attempt_at <= NOW())
     OR (status = 'PROCESSING' AND lock_lease_expires_at < NOW())
  ORDER BY next_attempt_at ASC
  LIMIT 10
  FOR UPDATE SKIP LOCKED
)
RETURNING *;
```

**Avantajları:**
1. **Sıfır Kilit Beklemesi (Zero Lock Contention):** Kilitli satırlar atlanır (`SKIP LOCKED`), worker'lar birbirini beklemez.
2. **Kira Süresi Kurtarması (Lease Recovery):** Worker çalışırken aniden çöker veya bellek yetersizliğiyle kapanırsa, 30 saniye sonra `lock_lease_expires_at < NOW()` koşulu sayesinde diğer aktif worker'lar kaydı devralır.

### 3.2. Hata Yönetimi, Exponential Backoff ve Dead-Letter (FAILED)
İşlem hatası alındığında (örneğin Expo Push API kesintisi veya geçici ağ kopması):
- `attempts < 5`: Kayıt `PENDING` durumuna alınır ve `next_attempt_at` üstel artış + rastgele gecikme (jitter) ile ileri atılır:
  $$\text{backoffMs} = \min(60000, 2^{\text{attempts}} \times 1000 + \text{jitter})$$
- `attempts >= 5`: Kayıt kalıcı olarak `FAILED` (Dead-letter) durumuna çekilir, operatör incelemesi için `last_error` alanına hata detayı yazılır ve döngüden çıkarılır.

### 3.3. Tüketici Tarafı İdempotans (Consumer Idempotency)
At-least-once modelinde, ağ zaman aşımları nedeniyle aynı bildirim iki kez tetiklenebilir. Bunu önlemek için `user_notifications` tablosuna benzersiz `idempotency_key` kısıtı eklenmiştir:

```sql
ALTER TABLE user_notifications 
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_notifications_idempotency_key 
  ON user_notifications (idempotency_key) 
  WHERE idempotency_key IS NOT NULL;
```

Bildirim üretilirken:
```typescript
await this.notificationsService.createNotification({
  userId: authorId,
  type: notifType,
  title,
  body,
  eventId: event.aggregateId,
  idempotencyKey: `outbox:${outboxId}:${authorId}`,
});
```
Aynı `outboxId` tekrar işlense dahi veritabanı unique index kuralı (`23505`) tetiklenir, mükerrer bildirim yazılmaz ve var olan bildirim güvenle döndürülür.

---

## 4. Mimari Karşılaştırma: Transactional Outbox vs. Redis Pub/Sub

| Karşılaştırma Kriteri | Redis Pub/Sub (Tek Başına) | Transactional Outbox (PostgreSQL) | ŞehirNabız Tercihi |
| :--- | :--- | :--- | :--- |
| **İşlem Atomisitesi (ACID)** | ❌ Hayır (DB commit olmadan yayınlanabilir veya tersi) | ✅ Evet (DB işlemiyle aynı transaction içinde) | **Transactional Outbox** |
| **Kalıcılık (Persistence)** | ❌ Hayır (Mesaj RAM'de anlık iletilir, abonesiz kaybolur) | ✅ Evet (PostgreSQL diskinde kalıcı kayıt) | **Transactional Outbox** |
| **Yeniden Deneme (Retry)** | ❌ Yok | ✅ Evet (5 deneme, exponential backoff) | **Transactional Outbox** |
| **Dead-Letter Kuyruğu** | ❌ Yok | ✅ Evet (`FAILED` durumu ve hata logu) | **Transactional Outbox** |
| **Anlık Gecikme (Latency)** | ⚡ < 1 ms | ⏱️ 1-5 ms (Anında event trigger + 2s worker poll) | **Hibrit (Trigger + Worker)** |
| **Kullanım Amacı** | Geçici UI titreşimleri, oda mesajları | Kritik durum değişiklikleri, bildirimler, denetim | **Amaç Odaklı Ayrım** |

---

## 5. Doğrulama ve Test Kanıtları
- **Birim Testleri (`outbox.service.spec.ts` & `outbox-processor.service.spec.ts`):** 6 test passed.
- **Canlı PostgreSQL Entegrasyon Testleri (`outbox.e2e-spec.ts`):** 5 test passed:
  1. Başarılı transaction atomisitesi doğrulaması.
  2. Kasıtlı çökme simülasyonunda sıfır kalıntı (Rollback) doğrulaması.
  3. `FOR UPDATE SKIP LOCKED` ile worker kilit claim ve `PROCESSED` doğrulaması.
  4. Mükerrer `idempotencyKey` durumunda tekil bildirim (Consumer idempotency) doğrulaması.
  5. PostgreSQL `unaccent` Türkçe karakter duyarsız arama doğrulaması.
