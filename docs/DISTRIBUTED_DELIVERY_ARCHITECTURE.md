# ŞehirNabız — Dağıtık Teslimat Semantiği ve Kanal Güvencesi Mimarisi (DISTRIBUTED_DELIVERY_ARCHITECTURE.md)

**Faz:** Phase 17 — Distributed Reliability, Outbox Delivery Assurance & Deployment Hardening  
**Tarih:** 29 Ekim 2026  
**Durum:** Mimari Standart Olarak Belirlendi ve Doğrulandı  

---

## 1. Giriş ve Dağıtık Sistem Problemi

Kentsel olay platformu ŞehirNabız'da bir olay meydana geldiğinde (örneğin kaza, su kesintisi, yol çökmesi bildirimi veya moderatör onayı), bu tekil durum değişikliğinin birden fazla harici kanala güvenle duyurulması gerekir.

Geçmiş fazlarda tespit edilen en kritik mimari risk şudur:
- **Her kanalın güvenilirlik ve teslimat karakteristiği birbirinden farklıdır.**
- Tüm kanalları tek bir "başarılı/başarısız" bayrağına bağlamak veya Redis kesintisinde tüm Outbox işini başarısız saymak verimsizdir; öte yandan Redis hatasını yutup gerçekleşmemiş zorunlu bir yan etkiyi (örneğin veritabanı bildirimini) yapılmış varsaymak **sessiz veri kaybına (silent data loss)** yol açar.

---

## 2. 5 Temel İletişim Kanalının Ayrımı ve Teslimat Sözleşmesi (Delivery Contract)

ŞehirNabız mimarisinde her bir outbox tetikleyicisi aşağıdaki 5 bağımsız kanala ayrıştırılmıştır:

```text
                               +-----------------------------+
                               |     POSTGRESQL ACID TX      |
                               |  Events UPDATE + OutboxLog  |
                               +--------------+--------------+
                                              |
                                              v
                               +-----------------------------+
                               |   OUTBOX PROCESSOR WORKER   |
                               +--------------+--------------+
                                              |
            +------------------+--------------+------------------+------------------+
            |                  |                                 |                  |
            v                  v                                 v                  v
    +---------------+  +----------------+              +-------------------+ +---------------+
    |   KANAL 1     |  |    KANAL 2     |              |     KANAL 3       | |   KANAL 4     |
    | In-App (DB)   |  | WebSocket      |              | Redis Pub/Sub     | | Push (Expo)   |
    | (ZORUNLU)     |  | (BEST-EFFORT)  |              | (DEGRADED TOL.)   | | (RETRYABLE)   |
    +---------------+  +----------------+              +-------------------+ +---------------+
            |                  |                                 |                  |
    user_notifications  Bağlı istemciye             Çoklu API Instance   Expo Push API
    (Idempotent INSERT) bellek içi emit             kümeleme dağıtımı    Batching (100)
```

### Kanal Karşılaştırma Matrisi

| Kanal | Kanal Adı | Karakter | Başarı / Teslim Kriteri | Hata Durumunda Outbox Davranışı | İdempotans Mekanizması |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **1** | **Kalıcı Uygulama İçi Bildirim (`inAppNotification`)** | 🔴 **ZORUNLU (MANDATORY)** | PostgreSQL `user_notifications` tablosuna satır yazılması. | **Outbox işlemi FAILED/PENDING kalır, ASLA PROCESSED yapılmaz.** Exponential backoff ile tekrar denenir. | `uq_user_notifications_idempotency_key` (`outbox:{id}:{userId}`) |
| **2** | **Canlı WebSocket Yayını (`websocketBroadcast`)** | 🟡 **BEST-EFFORT** | O anda aktif bağlı istemcilere TCP üzerinden bellek içi `emit` edilmesi. | Outbox işlemini durdurmaz (`DELIVERED` veya `FAILED` kaydedilir). İstemci yeniden bağlandığında REST snapshot ile eşitlenir. | `serverEventId` UUID v4 + `eventVersion` monotonik filtre |
| **3** | **Redis Pub/Sub Dağıtımı (`redisPubSub`)** | 🟡 **TOLERANSLI / DEGRADED** | Çoklu sunucu kümesinde Redis kanalına `PUBLISH` edilmesi ve önbellek temizliği. | Redis çökerse yerel instancelar yayına devam eder; kanal `DEGRADED` olarak işaretlenir, outbox bloke edilmez. | Dağıtık adapter message ID |
| **4** | **Expo Push Bildirimi (`pushNotification`)** | 🟢 **BEST-EFFORT + RETRY** | Expo Push API'ye HTTP POST ile iletilip bilet (ticket) alınması. | Ağ zaman aşımında 2 kez iç retry yapılır. Token geçersizse (`DeviceNotRegistered`) pasifleştirilir. In-app bildirim korunur. | Token bazlı deduplication |
| **5** | **Push Ticket & Bilet Takibi (`pushReceiptTracking`)** | ⚪ **ASENKRON İZLEME** | Expo'dan dönen `ticketId` listesinin arka planda sorgulanması. | Asenkron arka plan görevi; ana outbox yaşam döngüsünü hiçbir şekilde bloke etmez. | `receiptId` sorgulama |

---

## 3. Doğrulanabilir Kanal Durumu Kaydı (`_channelDeliveries`)

Outbox kaydının `PROCESSED` durumuna geçmesi için körü körüne bir güncelleme yapılmaz. Olayın `payload` JSONB alanında `_channelDeliveries` nesnesi saklanır:

```json
{
  "eventId": "agg-evt-42",
  "newStatus": "ACTIVE",
  "authorId": "author-uuid-1",
  "_channelDeliveries": {
    "inAppNotification": "DELIVERED",
    "websocketBroadcast": "DELIVERED",
    "redisPubSub": "DEGRADED",
    "pushNotification": "DELIVERED",
    "cacheInvalidation": "DEGRADED",
    "processedAt": "2026-10-29T11:15:08.120Z",
    "error": null
  }
}
```

### Olası Kanal Durumları (`DeliveryChannelState`)
- `DELIVERED`: Kanal başarıyla işletildi.
- `DEGRADED`: Servis kesintisi nedeniyle alternatif/yerel yoldan devam edildi (örn. Redis çevrimdışıyken yerel soket yayını).
- `FAILED`: İşlem başarısız oldu (Zorunlu kanallarda outbox `PENDING` ile bekletilir).
- `SKIPPED`: İlgili olay türü için kanal gerekmedi (örn. anonim kullanıcının olayında push gönderilmemesi).
- `SIMULATED`: Geliştirme/test ortamında harici servise istek atmadan adaptör ile simüle edildi.

---

## 4. Reconnect ve REST Mutabakatı (Reconciliation)

Ağ kararsızlığı, tünel geçişi veya sunucu yeniden başlatılması durumunda kaçan WebSocket mesajları için şu garanti verilir:
1. İstemci koptuğunu anladığında (`disconnect` olayı) en yakın sağlıklı API instance'ına yeniden bağlanır.
2. Bağlantı kurulduğu anda mobil istemci son gördüğü sürüm numarasını (`lastSeenVersion`) içeren `GET /api/v1/events/bbox` sorgusu atar.
3. Sunucu, istemcinin ekran sınırları içindeki son aktif olayları döndürür. Böylece geçici WebSocket paket kaybı hiçbir veri tutarsızlığına yol açmaz.
