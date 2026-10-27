# ŞehirNabız — Gerçek Zamanlı Sistem Mimarisi (REALTIME_ARCHITECTURE.md)

Bu doküman, ŞehirNabız sisteminde kentsel olayların ve bildirimlerin istemcilere anlık olarak iletilmesini sağlayan WebSocket, Redis Pub/Sub Adapter, coğrafi abonelik odaları ve veri mutabakatı (reconciliation) mimarisini açıklar.

---

## 1. Genel Mimari Şeması

```text
+-----------------------+           +-----------------------+
|  React Native Mobil   |           |  Moderatör Arayüzü    |
| (socketService / WSS) |           | (join_moderation / WSS|
+-----------+-----------+           +-----------+-----------+
            |                                   |
            +-----------------+-----------------+
                              |
                     WSS Handshake + JWT
                              |
                              v
             +----------------------------------+
             |      NestJS RealtimeGateway      |
             |       (Namespace: /realtime)     |
             +----------------+-----------------+
                              |
               +--------------+--------------+
               |                             |
               v                             v
     +-------------------+         +--------------------+
     | Socket.IO Engine  |         |   RedisIoAdapter   |
     |   In-Memory Hub   |         | (Redis Pub/Sub 6380|
     +-------------------+         +---------+----------+
                                             |
                                    İki Yönlü Senkron
                                             |
                                             v
                                   +--------------------+
                                   | Çoklu API Sunucu   |
                                   |  Ölçekleme Ağı     |
                                   +--------------------+
```

---

## 2. Ağ Geçidi ve Güvenlik İlkeleri (`RealtimeGateway`)

### 2.1 Bağlantı El Sıkışması (Handshake)
- İstemciler bağlantı esnasında `auth.token`, `headers.authorization` ("Bearer <token>") veya `query.token` ile JWT erişim anahtarını sunar.
- `JwtService` ile imza ve son geçerlilik tarihi (`exp`) denetlenir.
- **Oturumlu İstemci:** `client.data.user = payload` atanır ve kullanıcıya özel `user:${userId}` odasına otomatik olarak dahil edilir.
- **Anonim İstemci:** Token sunulmaması veya geçersiz olması durumunda bağlantı koparılmaz; istemci `client.data.user = null` olarak genel kentsel olay odasına (`events:global`) dahil edilir.
- **Gizlilik Kuralı:** Sunucu konsoluna veya Redis kuyruğuna asla ham JWT veya refresh token loglanmaz.

### 2.2 Yetkili Moderasyon Odası (`moderation:queue`)
- Yalnızca `MODERATOR` veya `ADMIN` rolüne sahip kullanıcılar `join_moderation` mesajı ile bu odaya katılabilir.
- Normal vatandaşlar (`CITIZEN`) veya anonim istemciler katılmaya çalıştığında istek `UNAUTHORIZED_ROOM` hata kodu ile reddedilir ve audit kaydı düşülür.

---

## 3. Coğrafi Abonelik ve Oda Tasarımı

1. `events:global`:
   - Tüm onaylanmış kentsel olayların durum değişikliklerini (`ACTIVE`, `RESOLVED`, `DISPUTED`) ve sayaç güncellemelerini dinler.
2. `subscribe_bbox` (Sınır Kutusu Aboneliği):
   - İstemci haritada gezinirken görünür ekran sınırlarını (`west, south, east, north`) sunucuya iletir. Sunucu mekânsal filtreleme uygulayarak gereksiz veri transferini önler.
3. `user:${userId}` (Özel Bildirim Kanalı):
   - Kullanıcının kendi olaylarına gelen teyitler, moderatör kararları veya sistem duyuruları bu tekil odaya iletilir.
4. `moderation:queue`:
   - Yeni oluşturulan veya ihtilaf bildirilen inceleme bekleyen olaylar anlık olarak nöbetçi moderatörlere iletilir.

---

## 4. Mesaj Güvenilirliği ve Sıralama Garantisi

Ağ kararsızlıkları ve eşzamanlı mesaj dağıtımlarında veri tutarlılığını sağlamak için iki aşamalı koruma uygulanır:

### 4.1 Mükerrer Mesaj Filtresi (Deduplication)
Her WebSocket veri yükü benzersiz bir `serverEventId` (UUID v4) taşır. İstemci tarafındaki `SocketService`, son işlenen 500 olay kimliğini hafızada tutar ve mükerrer gelen mesajları sessizce eler.

### 4.2 Monotonik Sürüm Koruması (Monotonic Versioning)
Her olay kaydı veritabanında artan bir `version` sütununa sahiptir.
WebSocket üzerinden iletilen `eventVersion`, istemcinin hafızasındaki son sürümden (`lastSeenVersion`) küçükse, ağ gecikmesi nedeniyle sırasız gelmiş eski bir durumun yeni veriyi ezmesi engellenir.

### 4.3 Snapshot Mutabakatı (Reconciliation)
Ağ kopması (Wi-Fi $\rightarrow$ Mobil Veri), arka plana alma veya sunucu yeniden başlaması sonrasında WebSocket yeniden bağlandığında (`reconnect`), istemci REST API üzerinden son BBox snapshot sorgusunu (`GET /api/v1/events/bbox`) otomatik tetikler.

---

## 5. Redis IoAdapter Yapılandırması

Çoklu konteyner ve küme (cluster) ortamında instance'lar arası mesaj dağıtımı `@socket.io/redis-adapter` ile sağlanır:
- Redis 7 (Port 6380) üzerinde Pub ve Sub çift istemci oluşturulur.
- Redis'e ulaşılamaması durumunda sistem çökmeksizin yerel bellek içi (in-memory) Socket.IO adaptörüne geri döner (Graceful degradation).
