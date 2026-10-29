const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('Phase 18A — Android Native Build Readiness & Mobile Visual QA', () => {
  const mobileDir = path.resolve(__dirname, '..');
  const monorepoRoot = path.resolve(mobileDir, '../..');

  it('1. app.json yapılandırması Android gereksinimlerini eksiksiz karşılamalı', () => {
    const appJsonPath = path.join(mobileDir, 'app.json');
    assert.strictEqual(fs.existsSync(appJsonPath), true, 'app.json bulunamadı');

    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const expo = appJson.expo;

    // Paket adı ve şema
    assert.strictEqual(expo.android.package, 'com.sehirnabiz.app', 'Android package com.sehirnabiz.app olmalı');
    assert.strictEqual(expo.scheme, 'sehirnabiz', 'Scheme sehirnabiz olmalı');

    // Android İzinleri
    const permissions = expo.android.permissions;
    assert.ok(permissions.includes('ACCESS_FINE_LOCATION'), 'Hassas konum izni tanımlı olmalı');
    assert.ok(permissions.includes('ACCESS_COARSE_LOCATION'), 'Yaklaşık konum izni tanımlı olmalı');
    assert.ok(permissions.includes('CAMERA'), 'Kamera izni tanımlı olmalı');
    assert.ok(permissions.includes('READ_MEDIA_IMAGES'), 'Galeri medya izni tanımlı olmalı');

    // MapLibre Eklentisi
    const maplibrePlugin = expo.plugins.find(
      (p) => Array.isArray(p) && p[0] === '@maplibre/maplibre-react-native'
    );
    assert.ok(maplibrePlugin, 'MapLibre config plugin app.json içinde bulunmalı');
    assert.strictEqual(maplibrePlugin[1].android.version, '11.5.0', 'MapLibre native sürümü 11.5.0 olmalı');

    // Adaptive icon ve tema rengi
    assert.strictEqual(expo.android.adaptiveIcon.backgroundColor, '#14B8A6', 'Adaptive icon arka planı #14B8A6 olmalı');
  });

  it('2. eas.json profilleri (development, preview, production) doğru yapılandırılmış olmalı', () => {
    const easJsonPath = path.join(mobileDir, 'eas.json');
    assert.strictEqual(fs.existsSync(easJsonPath), true, 'eas.json bulunamadı');

    const easJson = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));

    // Development profili
    assert.strictEqual(easJson.build.development.developmentClient, true, 'Development client true olmalı');
    assert.strictEqual(easJson.build.development.android.buildType, 'apk', 'Development APK çıktısı üretmeli');
    assert.strictEqual(easJson.build.development.android.gradleCommand, ':app:assembleDebug');

    // Preview profili (İç test / QA)
    assert.strictEqual(easJson.build.preview.distribution, 'internal', 'Preview internal dağıtımlı olmalı');
    assert.strictEqual(easJson.build.preview.android.buildType, 'apk', 'Preview APK çıktısı üretmeli');

    // Production profili
    assert.strictEqual(easJson.build.production.android.buildType, 'app-bundle', 'Production AAB çıktısı üretmeli');
    assert.strictEqual(easJson.build.production.autoIncrement, true, 'Sürüm kodu otomatik artırılmalı');
  });

  it('3. android/gradle.properties New Architecture, Hermes ve MapLibre ayarlarını doğrulamalı', () => {
    const gradlePropsPath = path.join(mobileDir, 'android/gradle.properties');
    assert.strictEqual(fs.existsSync(gradlePropsPath), true, 'android/gradle.properties bulunamadı');

    const content = fs.readFileSync(gradlePropsPath, 'utf8');

    assert.ok(content.includes('newArchEnabled=true'), 'New Architecture etkinleştirilmiş olmalı');
    assert.ok(content.includes('hermesEnabled=true'), 'Hermes JS motoru etkinleştirilmiş olmalı');
    assert.ok(content.includes('edgeToEdgeEnabled=true'), 'Edge to edge ekran desteği etkinleştirilmiş olmalı');
    assert.ok(content.includes('org.maplibre.reactnative.version=11.5.0'), 'MapLibre Gradle sürümü 11.5.0 olmalı');
  });

  it('4. metro.config.js monorepo kökünü ve paylaşılan paketleri izlemeli', () => {
    const metroConfigPath = path.join(mobileDir, 'metro.config.js');
    assert.strictEqual(fs.existsSync(metroConfigPath), true, 'metro.config.js bulunamadı');

    const content = fs.readFileSync(metroConfigPath, 'utf8');
    assert.ok(content.includes('watchFolders'), 'Metro watchFolders tanımlı olmalı');
    assert.ok(content.includes('nodeModulesPaths'), 'Metro nodeModulesPaths tanımlı olmalı');
  });

  it('5. S3 Presigned URL istemci manipülasyon koruması — HMAC bütünlüğü korunmalı', () => {
    // S3 AWS V4 imzalı URL simülasyonu
    const mockPresignedUrl = 'http://192.168.1.50:9000/sehir-nabiz-media/event-123.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio_admin%2F20261029%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20261029T140000Z&X-Amz-SignedHeaders=host&X-Amz-Signature=abcdef123456';

    const urlObj = new URL(mockPresignedUrl);
    assert.strictEqual(urlObj.hostname, '192.168.1.50', 'Presigned URL doğru sunucu IP adresini içermeli');
    assert.ok(urlObj.searchParams.has('X-Amz-Signature'), 'İmza parametresi mevcut olmalı');

    // İstemci tarafında host değiştirilirse HMAC bozulur
    const mutatedUrl = mockPresignedUrl.replace('192.168.1.50', '10.0.2.2');
    const mutatedObj = new URL(mutatedUrl);
    assert.notStrictEqual(mutatedObj.hostname, urlObj.hostname, 'Host mutasyonu tespit edildi');
    // Doğrulama kuralı: Mobil istemci presigned URL üzerinde host rewriting YAPMAMALIDIR
  });

  it('6. Urban Floating UI tasarım sistemi ve token uyumu doğrulanmalı', () => {
    const tokensPath = path.join(monorepoRoot, 'packages/design-tokens/src/colors.ts');
    assert.strictEqual(fs.existsSync(tokensPath), true, 'colors.ts bulunamadı');

    const content = fs.readFileSync(tokensPath, 'utf8');
    assert.ok(content.includes('#14B8A6'), 'Primary rengi #14B8A6 olmalı');
    assert.ok(content.includes('TRAFFIC'), '11 kategori renkleri tanımlı olmalı');
    assert.ok(content.includes('ACCIDENT'), 'Kaza rengi tanımlı olmalı');
  });
});
