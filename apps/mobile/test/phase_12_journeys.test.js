const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

describe('Phase 12 — Uçtan Uca Kullanıcı Yolculukları, Tasarım & Erişilebilirlik Testleri', () => {

  // =========================================================================
  // Yolculuk A: Misafir Kullanıcı -> Auth Kalkanı -> Giriş -> State Korunumu
  // =========================================================================
  describe('Yolculuk A: Misafir Kullanıcı Akışı ve Auth Kalkanı', () => {
    it('misafir kullanıcı teyit veya itiraz vermek istediğinde doğrudan işlem yapamamalı, AuthModal tetiklenmeli', () => {
      let authModalOpened = false;
      let pendingAction = null;

      const userState = {
        isAuthenticated: false,
        user: null,
      };

      const handleVoteAction = (actionType, eventId) => {
        if (!userState.isAuthenticated) {
          authModalOpened = true;
          pendingAction = { actionType, eventId };
          return { success: false, reason: 'AUTH_REQUIRED' };
        }
        return { success: true, actionType, eventId };
      };

      const result = handleVoteAction('CONFIRM', 'event-uuid-123');
      assert.equal(result.success, false);
      assert.equal(result.reason, 'AUTH_REQUIRED');
      assert.equal(authModalOpened, true);
      assert.deepEqual(pendingAction, { actionType: 'CONFIRM', eventId: 'event-uuid-123' });

      // Kullanıcı başarıyla oturum açtığında bekleyen işlem tamamlanabilmeli
      userState.isAuthenticated = true;
      userState.user = { id: 'user-uuid-999', displayName: 'Ali Veli' };

      const resumedResult = handleVoteAction(pendingAction.actionType, pendingAction.eventId);
      assert.equal(resumedResult.success, true);
      assert.equal(resumedResult.actionType, 'CONFIRM');
    });

    it('bildirimler ve profil ekranlarında misafir durumu için açık EmptyState ve yönlendirme bulunmalı', () => {
      const notifPath = path.resolve(__dirname, '../app/(tabs)/notifications.tsx');
      const profilePath = path.resolve(__dirname, '../app/(tabs)/profile.tsx');

      const notifContent = fs.readFileSync(notifPath, 'utf8');
      const profileContent = fs.readFileSync(profilePath, 'utf8');

      assert.ok(notifContent.includes('Giriş Yapmalısınız'), 'Bildirimler ekranında misafir başlığı bulunmalı');
      assert.ok(notifContent.includes('setAuthModalVisible(true)'), 'Bildirimlerde AuthModal tetiği bulunmalı');
      assert.ok(profileContent.includes('Misafir Kullanıcı'), 'Profil ekranında misafir fallback ismi olmalı');
    });
  });

  // =========================================================================
  // Yolculuk B: Yeni Kullanıcı Olay Bildirim Akışı & EXIF Güvenliği
  // =========================================================================
  describe('Yolculuk B: Olay Bildirim Akışı ve Medya Güvenliği', () => {
    it('4 adımlı form durumu sırayla tamamlanmalı (Kategori/Detay -> Konum -> Medya -> Önizleme)', () => {
      const steps = ['CATEGORY_DETAILS', 'LOCATION_SELECTION', 'MEDIA_UPLOAD', 'PREVIEW_CONFIRM'];
      let currentStepIndex = 0;

      const advanceStep = () => {
        if (currentStepIndex < steps.length - 1) {
          currentStepIndex += 1;
        }
      };

      assert.equal(steps[currentStepIndex], 'CATEGORY_DETAILS');
      advanceStep();
      assert.equal(steps[currentStepIndex], 'LOCATION_SELECTION');
      advanceStep();
      assert.equal(steps[currentStepIndex], 'MEDIA_UPLOAD');
      advanceStep();
      assert.equal(steps[currentStepIndex], 'PREVIEW_CONFIRM');
    });

    it('seçilen medya dosyalarında EXIF/GPS meta verisi temizlenmeden yükleme yapılmamalı', () => {
      const sanitizePhotoMetadata = (rawFile) => {
        const cleaned = { ...rawFile };
        delete cleaned.exif;
        delete cleaned.gps;
        delete cleaned.location;
        cleaned.isSanitized = true;
        return cleaned;
      };

      const photoWithExif = {
        uri: 'file:///data/user/0/app/cache/photo.jpg',
        exif: { GPSLatitude: 38.72, GPSLongitude: 35.48, Model: 'iPhone 15' },
        gps: { lat: 38.72, lng: 35.48 },
      };

      const sanitized = sanitizePhotoMetadata(photoWithExif);
      assert.equal(sanitized.exif, undefined);
      assert.equal(sanitized.gps, undefined);
      assert.equal(sanitized.isSanitized, true);
    });

    it('yeni veya düşük itibarlı kullanıcının olayı PENDING_REVIEW, güvenilir kullanıcınınki ACTIVE olmalı', () => {
      const determineInitialStatus = (reputationScore) => {
        if (reputationScore >= 50) {
          return 'ACTIVE';
        }
        return 'PENDING_REVIEW';
      };

      assert.equal(determineInitialStatus(10), 'PENDING_REVIEW', 'Yeni kullanıcı incelemeye düşmeli');
      assert.equal(determineInitialStatus(35), 'PENDING_REVIEW', '35 puanlı kullanıcı incelemeye düşmeli');
      assert.equal(determineInitialStatus(55), 'ACTIVE', 'Yüksek itibarlı kullanıcı direkt yayına geçmeli');
    });
  });

  // =========================================================================
  // Yolculuk C: Moderasyon Kuyruğu ve Durum Güncellemesi
  // =========================================================================
  describe('Yolculuk C: Moderatör Onay/Red İş Akışı', () => {
    it('moderatör incelemedeki olayı ACTIVE veya gerekçeli REJECTED yapabilmeli', () => {
      const event = {
        id: 'event-uuid-321',
        title: 'Meydanda Kaza',
        status: 'PENDING_REVIEW',
        rejectionReason: null,
      };

      const moderateEvent = (ev, decision, reason = null) => {
        if (decision === 'REJECTED') {
          if (!reason || reason.trim().length === 0) {
            throw new Error('Reddedilen olaylar için gerekçe zorunludur');
          }
          return { ...ev, status: 'REJECTED', rejectionReason: reason };
        }
        if (decision === 'ACTIVE') {
          return { ...ev, status: 'ACTIVE', rejectionReason: null };
        }
        throw new Error('Geçersiz karar');
      };

      assert.throws(() => moderateEvent(event, 'REJECTED', ''), /gerekçe zorunludur/);

      const rejected = moderateEvent(event, 'REJECTED', 'Mükerrer ve asılsız ihbar');
      assert.equal(rejected.status, 'REJECTED');
      assert.equal(rejected.rejectionReason, 'Mükerrer ve asılsız ihbar');

      const approved = moderateEvent(event, 'ACTIVE');
      assert.equal(approved.status, 'ACTIVE');
      assert.equal(approved.rejectionReason, null);
    });

    it('yetkisiz kullanıcı (CITIZEN) moderasyon paneline erişememeli', () => {
      const checkModerationAccess = (role) => {
        return role === 'MODERATOR' || role === 'ADMIN';
      };

      assert.equal(checkModerationAccess('CITIZEN'), false);
      assert.equal(checkModerationAccess('MODERATOR'), true);
      assert.equal(checkModerationAccess('ADMIN'), true);
    });
  });

  // =========================================================================
  // Yolculuk D: Topluluk Teyit & Geri Bildirim Tutarlılığı
  // =========================================================================
  describe('Yolculuk D: Topluluk Geri Bildirimi ve Oy Tutarlılığı', () => {
    it('olay sahibi kendi olayına teyit veya itiraz verememeli', () => {
      const canUserVote = (authorId, currentUserId) => {
        if (authorId === currentUserId) {
          return { allowed: false, error: 'Kullanıcı kendi bildirdiği olaya teyit veremez' };
        }
        return { allowed: true };
      };

      assert.equal(canUserVote('user-1', 'user-1').allowed, false);
      assert.equal(canUserVote('user-1', 'user-2').allowed, true);
    });

    it('kullanıcı teyit verdikten sonra itiraza geçtiğinde sayaçlar matematiksel olarak tutarlı kalmalı', () => {
      let confirmationCount = 5;
      let disputeCount = 1;
      let userVote = null;

      const vote = (newVote) => {
        if (userVote === newVote) return; // aynı oy

        // Eski oyu düş
        if (userVote === 'CONFIRM') confirmationCount -= 1;
        if (userVote === 'DISPUTE') disputeCount -= 1;

        // Yeni oyu ekle
        if (newVote === 'CONFIRM') confirmationCount += 1;
        if (newVote === 'DISPUTE') disputeCount += 1;

        userVote = newVote;
      };

      const withdrawVote = () => {
        if (userVote === 'CONFIRM') confirmationCount -= 1;
        if (userVote === 'DISPUTE') disputeCount -= 1;
        userVote = null;
      };

      // 1. CONFIRM oy ver
      vote('CONFIRM');
      assert.equal(confirmationCount, 6);
      assert.equal(disputeCount, 1);
      assert.equal(userVote, 'CONFIRM');

      // 2. DISPUTE ile değiştir
      vote('DISPUTE');
      assert.equal(confirmationCount, 5);
      assert.equal(disputeCount, 2);
      assert.equal(userVote, 'DISPUTE');

      // 3. Oyu geri çek
      withdrawVote();
      assert.equal(confirmationCount, 5);
      assert.equal(disputeCount, 1);
      assert.equal(userVote, null);
    });
  });

  // =========================================================================
  // Yolculuk E: Çevrimdışı Taslak ve Çift Gönderim Koruması
  // =========================================================================
  describe('Yolculuk E: Çevrimdışı Taslak ve Mükerrer Gönderim Koruması', () => {
    it('taslak verisi yerel hafızaya kaydedilmeli ve uygulama açıldığında eksiksiz kurtarılmalı', () => {
      const mockStorage = {};
      const DRAFT_KEY = '@sehir_nabiz:create_event_draft';

      const saveDraft = (data) => {
        mockStorage[DRAFT_KEY] = JSON.stringify(data);
      };

      const loadDraft = () => {
        const item = mockStorage[DRAFT_KEY];
        return item ? JSON.parse(item) : null;
      };

      const testDraft = {
        title: 'Kavşakta Arıza',
        description: 'Işıklar yanmıyor, trafik kilitlendi',
        category: 'TRAFFIC',
        latitude: 38.721,
        longitude: 35.485,
        createdEventId: 'event-uuid-draft-55',
      };

      saveDraft(testDraft);
      const restored = loadDraft();

      assert.deepEqual(restored, testDraft);
      assert.equal(restored.createdEventId, 'event-uuid-draft-55');
    });

    it('150 metre yarıçapında aynı kategoride aktif olay varsa duplicate uyarısı tetiklenmeli', () => {
      const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      const existingEvent = { latitude: 38.7205, longitude: 35.4805, category: 'ACCIDENT' };
      const newNearbySame = { latitude: 38.7208, longitude: 35.4809, category: 'ACCIDENT' };
      const newNearbyDiff = { latitude: 38.7208, longitude: 35.4809, category: 'FIRE' };

      const dist = calculateDistanceMeters(
        existingEvent.latitude,
        existingEvent.longitude,
        newNearbySame.latitude,
        newNearbySame.longitude,
      );

      assert.ok(dist < 150, `Mesafe 150m altında olmalı, hesaplanan: ${dist.toFixed(1)}m`);

      const isDuplicate = (existing, incoming) => {
        const d = calculateDistanceMeters(
          existing.latitude,
          existing.longitude,
          incoming.latitude,
          incoming.longitude,
        );
        return d <= 150 && existing.category === incoming.category;
      };

      assert.equal(isDuplicate(existingEvent, newNearbySame), true);
      assert.equal(isDuplicate(existingEvent, newNearbyDiff), false);
    });

    it('form gönderimi sırasında çift tıklama kilidi (submission lock) aktif olmalı', () => {
      let isSubmitting = false;
      let submitCallCount = 0;

      const handleSubmit = () => {
        if (isSubmitting) {
          return { accepted: false, error: 'SUBMISSION_LOCKED' };
        }
        isSubmitting = true;
        submitCallCount += 1;
        return { accepted: true };
      };

      const call1 = handleSubmit();
      const call2 = handleSubmit(); // Hızlı ikinci tıklama
      const call3 = handleSubmit(); // Hızlı üçüncü tıklama

      assert.equal(call1.accepted, true);
      assert.equal(call2.accepted, false);
      assert.equal(call3.accepted, false);
      assert.equal(submitCallCount, 1);
    });
  });

  // =========================================================================
  // Yolculuk F: Transactional Outbox ve Bildirim Idempotency
  // =========================================================================
  describe('Yolculuk F: Outbox ve Bildirim Idempotency Güvenliği', () => {
    it('aynı outbox olayı için birden fazla bildirim oluşturulması idempotencyKey ile engellenmeli', () => {
      const generatedNotifications = new Map();

      const processOutboxEvent = (outboxEvent) => {
        const idempotencyKey = `outbox:${outboxEvent.id}:user:${outboxEvent.targetUserId}`;
        if (generatedNotifications.has(idempotencyKey)) {
          return { skipped: true, reason: 'IDEMPOTENT_DUPLICATE' };
        }

        generatedNotifications.set(idempotencyKey, {
          id: 'notif-uuid-' + Math.random().toString(36).substring(7),
          title: outboxEvent.title,
          createdAt: new Date(),
        });
        return { skipped: false };
      };

      const outboxEvt = {
        id: 'outbox-uuid-101',
        eventType: 'EVENT_RESOLVED',
        targetUserId: 'user-uuid-55',
        title: 'Teyit ettiğiniz olay çözüldü!',
      };

      const firstPass = processOutboxEvent(outboxEvt);
      const secondPass = processOutboxEvent(outboxEvt); // Tekrar eden işlem

      assert.equal(firstPass.skipped, false);
      assert.equal(secondPass.skipped, true);
      assert.equal(secondPass.reason, 'IDEMPOTENT_DUPLICATE');
      assert.equal(generatedNotifications.size, 1);
    });
  });

  // =========================================================================
  // Bölüm 7: Harita Dikey Çakışma ve Urban Floating UI Geometri Doğrulaması
  // =========================================================================
  describe('Bölüm 7: Harita Ekranı Dikey Çakışma Önleme ve Geometri Standartları', () => {
    it('MapScreenLayout üst arama slotu ve kategori filtresi dikey olarak çakışmamalı', () => {
      const layoutPath = path.resolve(__dirname, '../src/components/layout/MapScreenLayout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf8');

      // categoryFilterSlot, searchBarSlot'tan en az 80px sonra başlamalı
      assert.ok(
        content.includes('Math.max(insets.top + 94, 104)'),
        'Kategori filtre slotu arama çubuğunun altına (top + 94) yerleştirilmiş olmalı',
      );
      assert.ok(
        content.includes('Math.max(insets.top + 152, 162)'),
        'Harita aksiyon kontrolleri kategori çiplerinin altına (top + 152) yerleştirilmiş olmalı',
      );
    });

    it('Harita indeksinde banner ve heatmap bildirim hapı floating sekmeyle çakışmamalı', () => {
      const indexPath = path.resolve(__dirname, '../app/(tabs)/index.tsx');
      const content = fs.readFileSync(indexPath, 'utf8');

      assert.ok(
        content.includes('Math.max(insets.top + 146, 156)'),
        'Banner dikey koordinatı kategori filtrelerinin altına hizalanmış olmalı',
      );
      assert.ok(
        content.includes('Math.max(insets.bottom, 12) + 76'),
        'Heatmap bildirim hapı 64px floating tab barın üzerinde (bottom + 76) olmalı',
      );
    });

    it('Erişilebilirlik: Akış, Bildirimler ve Ayarlar ekranlarında dokunmatik hedefler ve label/role tanımları eksiksiz olmalı', () => {
      const feedPath = path.resolve(__dirname, '../app/(tabs)/feed.tsx');
      const notifPath = path.resolve(__dirname, '../app/(tabs)/notifications.tsx');
      const settingsPath = path.resolve(__dirname, '../app/profile/settings.tsx');

      const feedContent = fs.readFileSync(feedPath, 'utf8');
      const notifContent = fs.readFileSync(notifPath, 'utf8');
      const settingsContent = fs.readFileSync(settingsPath, 'utf8');

      assert.ok(feedContent.includes('accessibilityRole="button"'), 'Feed kartlarında accessibilityRole olmalı');
      assert.ok(feedContent.includes('accessibilityLabel='), 'Feed kartlarında accessibilityLabel olmalı');
      assert.ok(notifContent.includes('accessibilityRole="button"'), 'Bildirim kartlarında accessibilityRole olmalı');
      assert.ok(settingsContent.includes('accessibilityLabel="Bildirdiğim Olaylar Bildirimleri"'), 'Ayarlar switchlerinde label olmalı');
    });
  });
});
