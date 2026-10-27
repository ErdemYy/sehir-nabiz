# ŞehirNabız — Phase 9: Gerçek Zamanlı Şehir Olayları, WebSocket ve Akıllı Bildirim Sistemi Tamamlama Raporu

**Faz:** Phase 9  
**Tarih:** 27 Ekim 2026  
**Durum:** Başarıyla Tamamlandı (100% Yeşil Testler, Sıfır Regresyon)  

---

## 1. Faz Özeti ve Kapsam

Phase 9 kapsamında ŞehirNabız; olayların ve teyitlerin istemcilere anlık aktarıldığı WebSocket altyapısı, Redis Pub/Sub adapter, coğrafi abonelik odaları, veri mutabakatı (reconciliation), PostgreSQL tabanlı bildirim veritabanı, REST bildirim API'leri, Expo Push altyapısı ve Urban Floating UI bildirim ekranı ile donatılmıştır.

---

## 2. Gerçek Zamanlı Mimari ve WebSocket Ağ Geçidi

- **Ağ Geçidi:** `apps/api/src/modules/realtime/realtime.gateway.ts` (`@WebSocketGateway({ namespace: '/realtime' })`)
- **Adaptör:** `RedisIoAdapter` (`@socket.io/redis-adapter` + `ioredis`). Redis 7 üzerinde Pub/Sub kümelemesi sağlar; Redis erişilemezse otomatik olarak in-memory adaptöre geri çekilir.
- **Güvenlik & Handshake:**
  - Token doğrulama `JwtService` ile yapılır.
  - Oturumlu kullanıcılar doğrulanıp özel `user:${userId}` odasına katılır.
  - Anonim kullanıcılar reddedilmez, genel olaylar odasına (`events:global`) yönlendirilir.
  - Sunucu günlüklerine hiçbir token yazılmaz.
- **Yetkili Moderasyon Odası:**
  - `join_moderation` isteğinde rol kontrolü yapılır (`MODERATOR` veya `ADMIN`).
  - Yetkisiz istekler `UNAUTHORIZED_ROOM` hatası ile püskürtülür.

---

## 3. Coğrafi Abonelik ve Veri Tutarlılığı

1. **Deduplication:** Her olay `serverEventId` (UUID v4) taşır. İstemci hafızasındaki 500'lük LRU filtre ile mükerrer mesajlar engellenir.
2. **Monotonic Versioning:** Veritabanındaki `events.version` kolonu sayesinde sırasız (out-of-order) gelen eski durumların yeni durumu ezmesi engellenir.
3. **Snapshot Reconciliation:** Ağ geçişlerinde ve reconnect sonrasında istemci otomatik olarak REST BBox sorgusunu tetikleyerek kayıp mesaj riskini ortadan kaldırır.

---

## 4. Bildirim Veritabanı ve Modeller

Üç yeni PostgreSQL varlığı TypeORM migration (`1740000004000-CreateNotificationsAndPushTokens.ts`) ile veritabanına işlenmiştir:

1. **`UserNotificationEntity` (`user_notifications`):**
   - Alanlar: `id`, `userId`, `type`, `title`, `body`, `eventId`, `readAt`, `expiresAt`, `createdAt`.
   - İndeksler: `(userId, createdAt DESC)`, `(userId, readAt)`, `(eventId)`.
2. **`DevicePushTokenEntity` (`device_push_tokens`):**
   - Alanlar: `id`, `userId`, `token`, `platform`, `deviceIdentifier`, `isActive`, `lastSeenAt`, `createdAt`.
   - Kısıt: `UNIQUE("token")`.
3. **`UserNotificationPreferenceEntity` (`user_notification_preferences`):**
   - Alanlar: `userId` (Unique), `followedEvents`, `confirmedEvents`, `reportedEvents`, `nearbyEvents` (varsayılan false), `systemNotifications`, `pushEnabled`, `inAppEnabled`.

---

## 5. Bildirim ve Cihaz API'leri

| Metot | Uç Nokta | Rol | Açıklama |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notifications` | JWT | Sayfalanmış bildirim listesi (`unreadOnly` filtreli) |
| `GET` | `/api/v1/notifications/unread-count` | JWT | Okunmamış bildirim sayısı |
| `PATCH` | `/api/v1/notifications/:id/read` | JWT | Tekil bildirimi okundu işaretleme (Idempotent) |
| `PATCH` | `/api/v1/notifications/read-all` | JWT | Tümünü okundu işaretleme |
| `GET` | `/api/v1/notifications/preferences` | JWT | Bildirim tercihlerini getirme |
| `PATCH` | `/api/v1/notifications/preferences` | JWT | Tercihleri güncelleme |
| `POST` | `/api/v1/devices/push-token` | JWT | Push token kaydetme / yenileme |
| `DELETE` | `/api/v1/devices/push-token` | JWT | Push token pasifleştirme (Oturum çıkışı) |

---

## 6. Mobil Bildirimler ve Canlı Harita Deneyimi

1. **Bildirimler Ekranı (`apps/mobile/app/(tabs)/notifications.tsx`):**
   - Urban Floating UI tasarım dili.
   - "Tümü" ve "Okunmamış" filtre çipleri.
   - "Tümünü Oku" tek dokunuş aksiyonu.
   - Tarih gruplaması: "Bugün", "Dün", "Daha Önce".
   - Bildirim kartına basıldığında olaya yönlendirme (`/events/[id]`).
   - Oturum kapalı durumu için `AuthModal` entegrasyonlu `EmptyState`.
2. **Canlı Harita Bağlantı Rozeti (`ConnectionStatusBadge.tsx`):**
   - Harita üst barında minimal hap rozet.
   - Durumlar: Canlı (Yeşil), Güncelleniyor (Mavi), Bağlanıyor (Sarı), Çevrimdışı (Gri).
   - Dokunulduğunda yeniden bağlanma (`reconnect`) tetikler.
3. **Moderatör Paneli Canlı Akışı:**
   - Moderasyon odasına otomatik katılım ve yeni olay düştüğünde listenin canlı yenilenmesi.

---

## 7. Test ve Doğrulama Sonuçları

Önceki 172 testin tamamı korunmuş; **49 yeni test** eklenerek toplam **221 test** %100 başarıyla tamamlanmıştır.

- **`@sehir-nabiz/design-tokens`:** 11 / 11 PASSED
- **`@sehir-nabiz/shared`:** 6 / 6 PASSED (+1 yeni test)
- **`sehir-nabiz-mobile`:** 57 / 57 PASSED (+8 yeni test)
- **`sehir-nabiz-api`:** 147 / 147 PASSED (+40 yeni test: 102 unit, 45 live E2E)
- **Toplam:** **221 / 221 PASSED** (%100 Başarı)

---

## 8. Graphify Bilgi Grafı Metrikleri

- **Düğümler (Nodes):** 2,118 (+270 yeni düğüm)
- **Kenarlar (Edges):** 4,736 (+727 yeni ilişki)
- **Topluluklar (Communities):** 114 küme

---

## 9. Sorumluluk Reddi ve Native Push Notu

Fiziksel cihaz üzerinde gerçek native bildirim teslimatı, EAS Project kimliği ve FCM/APNs sertifikaları yapılandırılana kadar geliştirme ortamında simüle edilmektedir ve native cihaz testi yapılana kadar doğrulanmamış olarak sınıflandırılmıştır.
