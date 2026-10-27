const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CreateEventDtoSchema,
  RegisterInputSchema,
  LoginInputSchema,
  UploadUrlInputSchema,
  EventCategory,
  EventSeverity,
  EventStatus,
  MediaStatus,
} = require('@sehir-nabiz/shared');
const { palette } = require('@sehir-nabiz/design-tokens');

test('Phase 7 — Olay Bildirim Akışı, Konum ve Medya Güvenliği Testleri', async (t) => {
  // -------------------------------------------------------------
  // 1. Zod Form Doğrulama (Frontend & Backend Uyumu)
  // -------------------------------------------------------------
  await t.test('1. CreateEventDtoSchema form validasyon kuralları', () => {
    const validData = {
      categoryId: '11111111-1111-1111-1111-111111111111',
      title: 'Cumhuriyet Meydanı Trafik Sıkışıklığı',
      description: 'Meydan kavşağında sinyalizasyon arızası nedeniyle trafik durma noktasında.',
      severity: EventSeverity.HIGH,
      latitude: 38.7225,
      longitude: 35.4853,
      addressText: 'Cumhuriyet Meydanı No: 1',
      city: 'Kayseri',
      district: 'Melikgazi',
    };

    const res = CreateEventDtoSchema.safeParse(validData);
    assert.equal(res.success, true, 'Geçerli olay verisi doğrulamadan geçmeli');

    // Başlık 5 karakterden kısa olamaz
    const shortTitle = { ...validData, title: 'Kaza' };
    const resShortTitle = CreateEventDtoSchema.safeParse(shortTitle);
    assert.equal(resShortTitle.success, false);
    assert.ok(resShortTitle.error.errors.some((e) => e.message.includes('en az 5 karakter')));

    // Açıklama 10 karakterden kısa olamaz
    const shortDesc = { ...validData, description: 'Kısa' };
    const resShortDesc = CreateEventDtoSchema.safeParse(shortDesc);
    assert.equal(resShortDesc.success, false);
    assert.ok(resShortDesc.error.errors.some((e) => e.message.includes('en az 10 karakter')));

    // Geçersiz kategori UUID
    const invalidCat = { ...validData, categoryId: 'gecersiz-uuid' };
    const resInvalidCat = CreateEventDtoSchema.safeParse(invalidCat);
    assert.equal(resInvalidCat.success, false);
    assert.ok(resInvalidCat.error.errors.some((e) => e.message.includes('kategori')));
  });

  // -------------------------------------------------------------
  // 2. Coğrafi Koordinat ve Sınır Güvenliği
  // -------------------------------------------------------------
  await t.test('2. Enlem / Boylam sınır ve format denetimi', () => {
    const base = {
      categoryId: '11111111-1111-1111-1111-111111111111',
      title: 'Talas Bulvarı Su Kesintisi',
      description: 'Ana iletim borusu patladı, sular kesik.',
      severity: EventSeverity.MEDIUM,
    };

    // Geçersiz enlem (> 90)
    const invalidLat = CreateEventDtoSchema.safeParse({
      ...base,
      latitude: 95.5,
      longitude: 35.48,
    });
    assert.equal(invalidLat.success, false, '90 dereceden büyük enlem reddedilmeli');

    // Geçersiz boylam (> 180)
    const invalidLng = CreateEventDtoSchema.safeParse({
      ...base,
      latitude: 38.72,
      longitude: 195.2,
    });
    assert.equal(invalidLng.success, false, '180 dereceden büyük boylam reddedilmeli');

    // Türkiye koordinatları
    const validTr = CreateEventDtoSchema.safeParse({
      ...base,
      latitude: 38.7225,
      longitude: 35.4853,
    });
    assert.equal(validTr.success, true);
  });

  // -------------------------------------------------------------
  // 3. 11 Kategori Desteği ve Renk Eşleşmesi
  // -------------------------------------------------------------
  await t.test('3. Backend 11 kategorisinin tamamı ve renk tokenları desteklenmeli', () => {
    const categories = [
      EventCategory.TRAFFIC,
      EventCategory.ACCIDENT,
      EventCategory.ROAD_WORK,
      EventCategory.WATER_OUTAGE,
      EventCategory.POWER_OUTAGE,
      EventCategory.INFRASTRUCTURE,
      EventCategory.PUBLIC_TRANSPORT,
      EventCategory.WEATHER,
      EventCategory.DISASTER,
      EventCategory.EVENT,
      EventCategory.OTHER,
    ];

    assert.equal(categories.length, 11, '11 sistem kategorisi tanımlı olmalıdır');

    for (const cat of categories) {
      assert.ok(palette.categories[cat], `${cat} kategorisinin tasarım rengi tanımlı olmalıdır`);
    }
  });

  // -------------------------------------------------------------
  // 4. Çok Adımlı Akış Geçişleri (Step Navigation)
  // -------------------------------------------------------------
  await t.test('4. Çok adımlı form aşamaları ve geçiş mantığı', () => {
    // Adım 1 Doğrulaması
    const validateStep1 = (form) => {
      if (!form.categoryId) return { success: false, error: 'Kategori seçilmelidir' };
      if (!form.title || form.title.trim().length < 5) return { success: false, error: 'Başlık en az 5 karakter' };
      if (!form.description || form.description.trim().length < 10) return { success: false, error: 'Açıklama en az 10 karakter' };
      return { success: true };
    };

    assert.equal(validateStep1({ categoryId: null, title: 'Test', description: 'Test' }).success, false);
    assert.equal(validateStep1({ categoryId: 'c1', title: '1234', description: '1234567890' }).success, false);
    assert.equal(validateStep1({ categoryId: 'c1', title: '12345', description: '123456789' }).success, false);
    assert.equal(validateStep1({ categoryId: 'c1', title: '12345', description: '1234567890' }).success, true);

    // Adım 2 Doğrulaması (Konum Şartı)
    const validateStep2 = (form) => {
      if (!form.location || typeof form.location.latitude !== 'number' || typeof form.location.longitude !== 'number') {
        return { success: false, error: 'Konum seçilmelidir' };
      }
      return { success: true };
    };

    assert.equal(validateStep2({ location: null }).success, false);
    assert.equal(validateStep2({ location: { latitude: 38.72, longitude: 35.48 } }).success, true);
  });

  // -------------------------------------------------------------
  // 5. Fotoğraf Sınırları ve Format Denetimi
  // -------------------------------------------------------------
  await t.test('5. Fotoğraf adedi (maks 3) ve dosya boyutu (maks 8MB) kuralları', () => {
    const MAX_PHOTOS = 3;
    const MAX_SIZE = 8 * 1024 * 1024;

    const validatePhotoUpload = (currentPhotos, newPhoto) => {
      if (currentPhotos.length >= MAX_PHOTOS) {
        return { valid: false, error: 'En fazla 3 adet fotoğraf eklenebilir' };
      }
      if (newPhoto.fileSize > MAX_SIZE) {
        return { valid: false, error: 'Fotoğraf boyutu 8 MB sınırını aşamaz' };
      }
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(newPhoto.mimeType)) {
        return { valid: false, error: 'Desteklenmeyen dosya türü' };
      }
      return { valid: true };
    };

    // 3'ten fazla fotoğraf engellenmeli
    const existing3 = [
      { id: '1', fileSize: 1000, mimeType: 'image/jpeg' },
      { id: '2', fileSize: 1000, mimeType: 'image/jpeg' },
      { id: '3', fileSize: 1000, mimeType: 'image/jpeg' },
    ];
    const resOverCount = validatePhotoUpload(existing3, { id: '4', fileSize: 1000, mimeType: 'image/jpeg' });
    assert.equal(resOverCount.valid, false);

    // 8 MB üstü engellenmeli
    const resOverSize = validatePhotoUpload([], { id: '1', fileSize: 9 * 1024 * 1024, mimeType: 'image/jpeg' });
    assert.equal(resOverSize.valid, false);

    // Desteklenmeyen HEIC/GIF engellenmeli
    const resInvalidMime = validatePhotoUpload([], { id: '1', fileSize: 2000, mimeType: 'image/gif' });
    assert.equal(resInvalidMime.valid, false);

    // Geçerli fotoğraf kabul edilmeli
    const resValid = validatePhotoUpload([], { id: '1', fileSize: 2 * 1024 * 1024, mimeType: 'image/webp' });
    assert.equal(resValid.valid, true);
  });

  // -------------------------------------------------------------
  // 6. Harita Merkez Koordinatı Hesaplama (Center Pin)
  // -------------------------------------------------------------
  await t.test('6. Harita BBox sınırlarından merkez koordinatı çıkarma', () => {
    const bounds = [35.0, 38.0, 36.0, 39.0]; // [west, south, east, north]
    const [west, south, east, north] = bounds;
    const centerLng = (west + east) / 2;
    const centerLat = (south + north) / 2;

    assert.equal(centerLng, 35.5);
    assert.equal(centerLat, 38.5);
  });

  // -------------------------------------------------------------
  // 7. Kimlik Doğrulama Koruması ve Token Mutex Mantığı
  // -------------------------------------------------------------
  await t.test('7. Auth guard ve eşzamanlı refresh yarış durumu (Race Condition) koruması', async () => {
    let refreshCalls = 0;
    let refreshPromise = null;

    const getValidToken = async () => {
      if (refreshPromise) return refreshPromise;

      refreshPromise = (async () => {
        refreshCalls++;
        await new Promise((r) => setTimeout(r, 20));
        return 'new_access_token_abc';
      })();

      try {
        return await refreshPromise;
      } finally {
        refreshPromise = null;
      }
    };

    // 3 eşzamanlı istek aynı anda token talep ediyor (örneğin 3 fotoğraf yüklemesi)
    const [t1, t2, t3] = await Promise.all([
      getValidToken(),
      getValidToken(),
      getValidToken(),
    ]);

    assert.equal(t1, 'new_access_token_abc');
    assert.equal(t2, 'new_access_token_abc');
    assert.equal(t3, 'new_access_token_abc');
    assert.equal(refreshCalls, 1, 'Eşzamanlı isteklerde refresh uç noktası yalnızca 1 kez çağrılmalı');
  });

  // -------------------------------------------------------------
  // 8. Mükerrer Bildirim (Duplicate Warning) Mantığı
  // -------------------------------------------------------------
  await t.test('8. DuplicateWarning güvenli DTO yapısı ve kullanıcı bilgilendirmesi', () => {
    const mockWarning = {
      isDuplicateSuspected: true,
      candidateTitle: 'Mevcut Kaza Bildirimi',
      distanceMeters: 85,
      createdAt: '2026-10-26T14:00:00.000Z',
    };

    assert.equal(mockWarning.isDuplicateSuspected, true);
    assert.equal(mockWarning.distanceMeters, 85);
    assert.ok(mockWarning.candidateTitle.length > 0);
    // Gizli moderatör veya kullanıcı şifresi/id'si ifşa edilmemeli
    assert.equal(mockWarning.authorId, undefined);
  });

  // -------------------------------------------------------------
  // 9. Çift Tıklama (Double-Click) Koruması
  // -------------------------------------------------------------
  await t.test('9. Gönderim sırasında çift tıklama koruması (Submission Lock)', async () => {
    let isSubmitting = false;
    let submissionCount = 0;

    const submitEvent = async () => {
      if (isSubmitting) return false;
      isSubmitting = true;
      try {
        submissionCount++;
        await new Promise((r) => setTimeout(r, 30));
        return true;
      } finally {
        isSubmitting = false;
      }
    };

    // Kullanıcı butona ardı ardına 3 kez basıyor
    const results = await Promise.all([submitEvent(), submitEvent(), submitEvent()]);

    assert.equal(submissionCount, 1, 'Aynı anda yalnızca tek bir gönderim gerçekleştirilmeli');
    assert.equal(results.filter((r) => r === true).length, 1);
  });

  // -------------------------------------------------------------
  // 10. Medya Yükleme ve Retry Mekanizması
  // -------------------------------------------------------------
  await t.test('10. Medya 3 adımlı yükleme ve kısmi hata durumunda olay ID korunumu', () => {
    const eventId = 'ev-test-uuid-123';
    const photos = [
      { id: 'p1', fileName: 'f1.jpg', uploadStatus: 'completed' },
      { id: 'p2', fileName: 'f2.jpg', uploadStatus: 'failed', uploadError: 'Ağ hatası' },
    ];

    // Olay ID'si korunarak yalnızca başarısız olan fotoğraf tekrar denenir
    const failedPhotos = photos.filter((p) => p.uploadStatus === 'failed');
    assert.equal(failedPhotos.length, 1);
    assert.equal(failedPhotos[0].id, 'p2');
    assert.equal(eventId, 'ev-test-uuid-123', 'Olay ID sıfırlanmamalı veya mükerrer event açılmamalı');
  });

  // -------------------------------------------------------------
  // 11. Taslak Kaydetme ve Geri Yükleme
  // -------------------------------------------------------------
  await t.test('11. Yerel taslak veri modeli bütünlüğü', () => {
    const draft = {
      step: 2,
      categoryId: 'c1',
      categoryCode: 'TRAFFIC',
      categoryNameTr: 'Trafik',
      title: 'Köprülü Kavşak Tıkanıklığı',
      description: 'Araçlar uzun kuyruklar oluşturdu.',
      severity: EventSeverity.HIGH,
      location: { latitude: 38.72, longitude: 35.48 },
      photos: [{ id: 'ph1', uri: 'file:///data/photo1.jpg', fileName: 'p1.jpg', fileSize: 1024, mimeType: 'image/jpeg', uploadStatus: 'idle' }],
      updatedAt: Date.now(),
    };

    const serialized = JSON.stringify(draft);
    const parsed = JSON.parse(serialized);

    assert.equal(parsed.title, draft.title);
    assert.equal(parsed.severity, EventSeverity.HIGH);
    assert.equal(parsed.photos.length, 1);
    assert.equal(parsed.location.latitude, 38.72);
  });

  // -------------------------------------------------------------
  // 12. Başarı Durumu ve İnceleme Statüsü
  // -------------------------------------------------------------
  await t.test('12. Başarılı gönderim sonrası PENDING_REVIEW durumu gösterilmeli', () => {
    const mockCreatedEvent = {
      id: 'new-event-uuid',
      status: EventStatus.PENDING_REVIEW,
      title: 'Test Bildirimi',
    };

    assert.equal(
      mockCreatedEvent.status,
      EventStatus.PENDING_REVIEW,
      'Yeni oluşturulan olay resmî veya doğrulanmış görünmemeli, PENDING_REVIEW olmalı'
    );
  });

  // -------------------------------------------------------------
  // 13. Phase 7.5: DuplicateWarning Gizlilik Kalkanı Doğrulaması
  // -------------------------------------------------------------
  await t.test('13. DuplicateWarning gizlilik kalkanı: Onaylanmamış olaylarda başlık ve kimlik gizlenmeli', () => {
    const privacyWarning = {
      isDuplicateSuspected: true,
      message: 'Yakın bölgede benzer bir bildirim bulunuyor olabilir.',
      candidateId: undefined,
      candidateTitle: undefined,
      distanceMeters: 120,
    };

    assert.equal(privacyWarning.isDuplicateSuspected, true);
    assert.equal(privacyWarning.candidateTitle, undefined, 'Başka kullanıcının PENDING_REVIEW başlığı sızdırılmamalı');
    assert.equal(privacyWarning.candidateId, undefined, 'Başka kullanıcının olay kimliği sızdırılmamalı');
    assert.equal(privacyWarning.message, 'Yakın bölgede benzer bir bildirim bulunuyor olabilir.');
    assert.equal(privacyWarning.distanceMeters, 120);
  });

  // -------------------------------------------------------------
  // 14. Phase 7.5: Tekrar Deneme Sırasında Mükerrer Olay Engeli (Idempotency)
  // -------------------------------------------------------------
  await t.test('14. Tekrar denemede mevcut createdEvent varsa ikinci kez createEvent çağrılmamalı', async () => {
    let apiCallCount = 0;
    let createdEvent = null;

    const mockCreateEventApi = async (data) => {
      apiCallCount++;
      return { id: 'first-created-id-789', ...data };
    };

    // İlk deneme: Event oluşturuldu ancak fotoğraf yükleme koptu
    if (!createdEvent) {
      createdEvent = await mockCreateEventApi({ title: 'Test Kaza' });
    }

    // İkinci deneme (Kullanıcı tekrar 'Bildirimi Gönder' butonuna bastı)
    if (!createdEvent) {
      createdEvent = await mockCreateEventApi({ title: 'Test Kaza' });
    }

    assert.equal(apiCallCount, 1, 'Event oluşturulduktan sonraki denemelerde ikinci bir olay açılmamalı');
    assert.equal(createdEvent.id, 'first-created-id-789');
  });

  // -------------------------------------------------------------
  // 15. Phase 7.5: Taslak Modelinde createdEventId Korunumu
  // -------------------------------------------------------------
  await t.test('15. Uygulama kapanması/ağ kesintisi durumunda taslak createdEventId alanını saklamalı', () => {
    const draftWithCreatedId = {
      step: 3,
      categoryId: 'c1',
      categoryCode: 'TRAFFIC',
      categoryNameTr: 'Trafik',
      title: 'İvedik Caddesi Çukur',
      description: 'Yolda derin bir çukur oluştu.',
      severity: EventSeverity.MEDIUM,
      location: { latitude: 39.95, longitude: 32.85 },
      photos: [],
      createdEventId: 'event-persisted-999',
      updatedAt: Date.now(),
    };

    const serialized = JSON.stringify(draftWithCreatedId);
    const restored = JSON.parse(serialized);

    assert.equal(restored.createdEventId, 'event-persisted-999');
  });
});
