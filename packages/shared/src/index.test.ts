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
