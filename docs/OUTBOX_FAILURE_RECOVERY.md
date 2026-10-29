# ŞehirNabız — Dağıtık Outbox Hata Kurtarma ve Teslimat Güvencesi (OUTBOX_FAILURE_RECOVERY.md)

**Faz:** Phase 17 — Distributed Reliability, Outbox Delivery Assurance & Deployment Hardening  
**Tarih:** 29 Ekim 2026  
**Durum:** Tamamlandı ve Doğrulandı  
**Referans Servis:** [`apps/api/src/modules/outbox/outbox-processor.service.ts`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/modules/outbox/outbox-processor.service.ts)

---

## 1. Giriş ve Sorun Analizi

Phase 16 yerel staging testleri sırasında tespit edilen kritik bulgu:
> *"Redis bağlantı kesintisi sırasında Outbox işlemcisinin bazı olayları tamamlandı (`PROCESSED`) olarak işaretlediği ve bu nedenle Redis ve WebSocket üzerinden yayılması gereken mesajların kalıcı olarak kaçırılabildiği gözlemlenmiştir."*

Bu mimari belgenin amacı; Transactional Outbox örüntüsünde **Zorunlu (Mandatory)** ve **İyi Niyetli (Best-Effort)** kanalları birbirinden ayırmak, kanal düzeyinde teslimat durumunu (`_channelDeliveries`) izlemek, işçi (worker) çökmesi senaryolarında veri bütünlüğünü korumak ve **At-Least-Once (En Az Bir Kez)** teslimat politikasını garanti altına almaktır.

---

## 2. Dağıtık Kanal Teslimat Semantiği

ŞehirNabız mimarisinde her bir Outbox olayı (`EVENT_CREATED`, `EVENT_VERIFIED`, `EVENT_RESOLVED`, `POINTS_EARNED` vb.) 5 farklı kanala etki edebilir. Bu kanalların sorumluluk ve teslimat gereksinimleri kesin çizgilerle ayrılmıştır:

| Kanal | Hedef ve Mekanizma | Kritiklik Derecesi | Hata Durumunda Davranış | Tekrar Denenebilir mi? |
| :--- | :--- | :--- | :--- | :--- |
| **1. Uygulama İçi Bildirim (`inAppNotification`)** | PostgreSQL `notifications` tablosuna kalıcı kayıt | **ZORUNLU (MANDATORY)** | İşlem derhal durdurulur. Outbox **ASLA `PROCESSED` YAPILMAZ**. `PENDING` kalır ve exponential backoff ile tekrar denenir. | **Evet** (Idempotency Key ile korunur) |
| **2. WebSocket Yayını (`websocketBroadcast`)** | İstemcilere gerçek zamanlı push (Socket.IO) | **İYİ NİYETLİ (BEST-EFFORT)** | İstemci o anda bağlı değilse veya kopmuşsa yayın kaçırılır. İstemci yeniden bağlandığında (`reconnect`) REST snapshot üzerinden durumu eşitler (reconciliation). | **Hayır** (State sync REST ile yapılır) |
| **3. Redis Pub/Sub (`redisPubSub`)** | Diğer API instance'larına olay yayını | **TOLERANSLI / DEGRADED** | Redis çökerse yerel soketlere yayın yapılır; kanal durumu `DEGRADED` olarak kaydedilir. Outbox başarısız sayılmaz ancak durum loglanır. | **Evet** (Instance içi yayın tamamlanır) |
| **4. Harici Push Bildirimi (`pushNotification`)** | Expo Push / FCM / APNs kilit ekranı bildirimi | **RETRYABLE / CRITICAL** | Push servisi 5xx veya timeout dönerse retry planlanır. Geliştirici ortamında `SIMULATED` çalışır. | **Evet** (Bilet ve makbuz takibiyle) |
| **5. Önbellek Temizleme (`cacheInvalidation`)** | Redis Geo / Stats önbelleği düşürme | **TOLERANSLI / DEGRADED** | Redis kapalıysa önbellek TTL ile zaman aşımına uğrar. Outbox işlemini bloke etmez. | **Hayır** (TTL fallback) |

---

## 3. Kanal Düzeyinde Durum Takibi (`_channelDeliveries`)

Her Outbox kaydı işlenirken her bir kanalın sonucu payload içerisindeki `_channelDeliveries` nesnesinde kayıt altına alınır:

```typescript
export type DeliveryChannelState = 
  | 'PENDING'    // Henüz denenmedi
  | 'DELIVERED'  // Başarıyla teslim edildi
  | 'FAILED'     // Hata aldı
  | 'DEGRADED'   // Altyapı kesintisi nedeniyle kısıtlı iletildi
  | 'SKIPPED'    // Bu kanal için hedef kitle/veri yoktu
  | 'SIMULATED'; // Geliştirici/Test ortamında simüle edildi

export interface OutboxChannelDeliveries {
  inAppNotification?: { state: DeliveryChannelState; timestamp: string; error?: string };
  websocketBroadcast?: { state: DeliveryChannelState; timestamp: string; clientsNotified?: number };
  redisPubSub?: { state: DeliveryChannelState; timestamp: string; degradedReason?: string };
  pushNotification?: { state: DeliveryChannelState; timestamp: string; ticketId?: string };
  cacheInvalidation?: { state: DeliveryChannelState; timestamp: string };
}
```

### PROCESSED Karar Matrisi
Bir Outbox kaydının `PROCESSED` statüsüne geçebilmesi için:
1. **ZORUNLU KANAL KURALI:** Eğer olay bir kullanıcıya yönelikse (`userId` tanımlıysa), `inAppNotification` kanal durumu kesinlikle `DELIVERED` olmalıdır.
2. Eğer `inAppNotification` `FAILED` ise:
   - Outbox durumu `PENDING` olarak kalır.
   - `retryCount` 1 artırılır.
   - `nextRetryAt = NOW() + (2 ^ retryCount * 5 sn)` hesaplanır.
   - Hata mesajı `lastError` alanına kaydedilir.
   - Kayıt `PROCESSED` **YAPILMAZ**.

---

## 4. Worker Crash Consistency ve Kilit Yönetimi

### 1. FOR UPDATE SKIP LOCKED
Birden fazla worker'ın aynı Outbox kaydını çekmesini önlemek için TypeORM transaction içinde `FOR UPDATE SKIP LOCKED` kullanılır:

```sql
SELECT * FROM outbox_events
WHERE status = 'PENDING' AND "nextRetryAt" <= NOW()
ORDER BY "createdAt" ASC
LIMIT 10
FOR UPDATE SKIP LOCKED;
```

### 2. Lease ve Worker Heartbeat
- Bir worker bir kaydı aldığında `status = 'PROCESSING'` ve `lockedUntil = NOW() + 60 seconds` güncellenir.
- Eğer worker işlem sırasında donar, bellek taşmasıyla (`OOM`) çöker veya Docker konteyneri öldürülürse:
  - 60 saniye sonra lease süresi dolar.
  - İkinci worker `WHERE status = 'PROCESSING' AND "lockedUntil" < NOW()` koşuluyla kaydı otomatik olarak devralır.

### 3. İdempotency Korunumu (Duplicate Prevention)
Kayıt işlenip veritabanına bildirim yazıldıktan **hemen sonra**, ancak Outbox kaydı `PROCESSED` yapılmadan önce worker çökerse:
- Yeni devralan worker kaydı tekrar işler.
- `inAppNotification` yazılırken `idempotencyKey: outbox:{outboxId}:{userId}` kullanılır.
- PostgreSQL `notifications` tablosundaki `UNIQUE(idempotency_key)` kısıtı sayesinde mükerrer bildirim oluşturulmaz:
  - `ON CONFLICT (idempotency_key) DO NOTHING` işletilir.
  - İkinci yazma girişimi sessizce `DELIVERED` olarak kabul edilir ve Outbox güvenle `PROCESSED` yapılır.

---

## 5. Doğrulama Senaryoları ve Test Kanıtları

Tüm bu davranışlar [`apps/api/test/phase_17_distributed_reliability.spec.ts`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/test/phase_17_distributed_reliability.spec.ts) test paketi ile doğrulanmıştır:

| Test Senaryosu | Beklenen Davranış | Doğrulama Sonucu |
| :--- | :--- | :--- |
| **Test 1: Zorunlu Kanal Hatası** | In-app notification DB hatası aldığında Outbox `PROCESSED` olmamalı, `PENDING` kalmalıdır. | 🟢 **PASS** (`status === 'PENDING'`, `retryCount === 1`) |
| **Test 2: Redis Kesintisi Toleransı** | Redis kapalıyken yerel soket yayını yapılmalı, kanal `DEGRADED` işaretlenmeli, Outbox kaybolmamalıdır. | 🟢 **PASS** (`redisPubSub.state === 'DEGRADED'`, Outbox işlendi) |
| **Test 3: Worker Çökmesi & İdempotency** | Worker DB yazdıktan sonra çökerse, ikinci worker aynı `idempotencyKey` ile mükerrer bildirim yazmamalıdır. | 🟢 **PASS** (1 adet bildirim oluşturuldu, 0 duplicate) |
| **Test 4: Çift Worker Lease Çakışması** | İki worker aynı anda kilidi dolmamış kayda erişememelidir. | 🟢 **PASS** (Worker 2 kaydı atladı, çakışma önlendi) |
