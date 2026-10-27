import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EventCategory,
  EventSeverity,
  EventStatus,
  CreateEventInputSchema,
  GeoCoordinateSchema,
  RegisterInputSchema,
} from './index';

test('EventCategory ve EventSeverity enum değerleri doğru tanımlanmalı', () => {
  assert.equal(EventCategory.TRAFFIC_ACCIDENT, 'TRAFFIC_ACCIDENT');
  assert.equal(EventSeverity.CRITICAL, 'CRITICAL');
  assert.equal(EventStatus.ACTIVE, 'ACTIVE');
});

test('GeoCoordinateSchema geçerli ve geçersiz koordinatları doğrulamalı', () => {
  const validCoord = { latitude: 41.0082, longitude: 28.9784 }; // İstanbul
  const result = GeoCoordinateSchema.safeParse(validCoord);
  assert.equal(result.success, true);

  const invalidCoord = { latitude: 95.0, longitude: 28.9784 }; // Geçersiz enlem
  const invalidResult = GeoCoordinateSchema.safeParse(invalidCoord);
  assert.equal(invalidResult.success, false);
});

test('CreateEventInputSchema zorunlu alanları ve sınırları denetlemeli', () => {
  const validEvent = {
    title: 'E-5 Karayolu Zincirlikuyu Trafik Kazası',
    description: 'Sol şeritte maddi hasarlı kaza meydana geldi, trafik durma noktasında.',
    category: EventCategory.TRAFFIC_ACCIDENT,
    severity: EventSeverity.HIGH,
    coordinate: { latitude: 41.069, longitude: 29.017 },
    city: 'İstanbul',
    district: 'Şişli',
  };

  const parseResult = CreateEventInputSchema.safeParse(validEvent);
  assert.equal(parseResult.success, true);

  const shortTitleEvent = {
    ...validEvent,
    title: 'Kaza', // 5 karakterden kısa
  };
  const shortResult = CreateEventInputSchema.safeParse(shortTitleEvent);
  assert.equal(shortResult.success, false);
});

test('RegisterInputSchema şifre karmaşıklığı ve e-posta formatını doğrulamalı', () => {
  const validRegister = {
    email: 'ahmet.yilmaz@example.com',
    password: 'Password123',
    displayName: 'Ahmet Yılmaz',
  };
  const result = RegisterInputSchema.safeParse(validRegister);
  assert.equal(result.success, true);

  // Basit şifre (rakam yok veya küçük/büyük harf eksik)
  const weakPasswordRegister = {
    ...validRegister,
    password: 'password',
  };
  const weakResult = RegisterInputSchema.safeParse(weakPasswordRegister);
  assert.equal(weakResult.success, false);

  // Geçersiz e-posta
  const invalidEmailRegister = {
    ...validRegister,
    email: 'not-an-email',
  };
  const invalidEmailResult = RegisterInputSchema.safeParse(invalidEmailRegister);
  assert.equal(invalidEmailResult.success, false);
});

test('Phase 8: FeedbackType enum ve CreateFeedbackSchema doğrulamalı', () => {
  const { FeedbackType, CreateFeedbackSchema } = require('./index');
  assert.equal(FeedbackType.CONFIRM, 'CONFIRM');
  assert.equal(FeedbackType.DISPUTE, 'DISPUTE');
  assert.equal(FeedbackType.RESOLVED_REPORT, 'RESOLVED_REPORT');

  const validConfirm = { type: FeedbackType.CONFIRM };
  const res1 = CreateFeedbackSchema.safeParse(validConfirm);
  assert.equal(res1.success, true);

  const validDispute = {
    type: FeedbackType.DISPUTE,
    reason: 'Olay yeri trafiğe açılmış, kaza aracı kaldırılmış.',
  };
  const res2 = CreateFeedbackSchema.safeParse(validDispute);
  assert.equal(res2.success, true);

  const invalidType = { type: 'UNKNOWN_VOTE' };
  const res3 = CreateFeedbackSchema.safeParse(invalidType);
  assert.equal(res3.success, false);

  const tooLongReason = {
    type: FeedbackType.DISPUTE,
    reason: 'A'.repeat(501),
  };
  const res4 = CreateFeedbackSchema.safeParse(tooLongReason);
  assert.equal(res4.success, false);
});

test('Phase 9: NotificationType, PushPlatform, Realtime enums ve Push şemaları doğrulamalı', () => {
  const {
    NotificationType,
    PushPlatform,
    RealtimeEventName,
    RealtimeRoom,
    RegisterPushTokenSchema,
    UpdateNotificationPreferencesSchema,
    NotificationsQuerySchema,
  } = require('./index');

  assert.equal(NotificationType.EVENT_APPROVED, 'EVENT_APPROVED');
  assert.equal(NotificationType.EVENT_RESOLVED, 'EVENT_RESOLVED');
  assert.equal(NotificationType.MODERATION_QUEUE, 'MODERATION_QUEUE');
  assert.equal(PushPlatform.IOS, 'ios');
  assert.equal(PushPlatform.ANDROID, 'android');
  assert.equal(RealtimeEventName.EVENT_STATUS_CHANGED, 'event:status_changed');
  assert.equal(RealtimeRoom.EVENTS_GLOBAL, 'events:global');

  // Push token doğrulaması
  const validToken = {
    token: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
    platform: PushPlatform.ANDROID,
    deviceIdentifier: 'device-hash-123',
  };
  const resToken = RegisterPushTokenSchema.safeParse(validToken);
  assert.equal(resToken.success, true);

  const invalidToken = {
    token: 'short',
    platform: 'invalid-platform',
  };
  const resTokenInvalid = RegisterPushTokenSchema.safeParse(invalidToken);
  assert.equal(resTokenInvalid.success, false);

  // Tercihler doğrulaması
  const validPrefs = {
    followedEvents: true,
    pushEnabled: false,
    nearbyEvents: false,
  };
  const resPrefs = UpdateNotificationPreferencesSchema.safeParse(validPrefs);
  assert.equal(resPrefs.success, true);

  // Query parametresi doğrulaması
  const query = NotificationsQuerySchema.parse({ limit: '15', unreadOnly: 'true' });
  assert.equal(query.limit, 15);
  assert.equal(query.unreadOnly, true);
});

test('Phase 10: StatsOverviewQuerySchema, HeatmapQuerySchema ve SearchEventsQuerySchema doğrulamalı', () => {
  const {
    StatsOverviewQuerySchema,
    HeatmapQuerySchema,
    SearchEventsQuerySchema,
    MyEventsQuerySchema,
  } = require('./index');

  // Stats Overview varsayılanları
  const statsQuery = StatsOverviewQuerySchema.parse({});
  assert.equal(statsQuery.city, 'Kayseri');
  assert.equal(statsQuery.period, '7d');

  // Heatmap koordinat sınırları
  const validHeatmap = {
    minLng: 35.4,
    minLat: 38.6,
    maxLng: 35.6,
    maxLat: 38.8,
    period: '24h',
  };
  const heatmapRes = HeatmapQuerySchema.safeParse(validHeatmap);
  assert.equal(heatmapRes.success, true);

  const invalidHeatmap = {
    minLng: -195, // geçersiz boylam
    minLat: 38.6,
    maxLng: 35.6,
    maxLat: 38.8,
  };
  const invalidHeatmapRes = HeatmapQuerySchema.safeParse(invalidHeatmap);
  assert.equal(invalidHeatmapRes.success, false);

  // Arama şeması
  const searchValid = SearchEventsQuerySchema.parse({
    q: 'Kayseri Tramvay',
    limit: '25',
  });
  assert.equal(searchValid.q, 'Kayseri Tramvay');
  assert.equal(searchValid.limit, 25);

  // Çok kısa arama terimi (< 2)
  const searchShort = SearchEventsQuerySchema.safeParse({ q: 'a' });
  assert.equal(searchShort.success, false);

  // MyEvents şeması
  const myEventsValid = MyEventsQuerySchema.parse({ limit: '10' });
  assert.equal(myEventsValid.limit, 10);
});

