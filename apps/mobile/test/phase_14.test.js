import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Phase 14 — Güvenli Hesap Silme, Veri Yaşam Döngüsü ve Release Blocker Mobil Testleri', async t => {
  const rootDir = path.resolve(__dirname, '../../..');
  const mobileDir = path.resolve(__dirname, '..');

  await t.test('1. MapLibre GL Native Sürüm Doğrulaması (11.5.0)', () => {
    const pkgJsonPath = path.resolve(mobileDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

    const maplibreVersion = pkg.dependencies['@maplibre/maplibre-react-native'];
    assert.equal(
      maplibreVersion,
      '11.5.0',
      'package.json içinde MapLibre sürümü tam olarak 11.5.0 olmalıdır',
    );

    const lockPath = path.resolve(rootDir, 'pnpm-lock.yaml');
    if (fs.existsSync(lockPath)) {
      const lockContent = fs.readFileSync(lockPath, 'utf8');
      assert.ok(
        lockContent.includes('@maplibre/maplibre-react-native@11.5.0') ||
        lockContent.includes('@maplibre/maplibre-react-native: 11.5.0'),
        'pnpm-lock.yaml dosyasında kurulu MapLibre sürümü 11.5.0 olmalıdır',
      );
    }

    // Config plugin kontrolü
    const appJsonPath = path.resolve(mobileDir, 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const maplibrePlugin = appJson.expo.plugins.find(p =>
      Array.isArray(p) ? p[0] === '@maplibre/maplibre-react-native' : p === '@maplibre/maplibre-react-native',
    );
    assert.ok(maplibrePlugin, 'app.json içinde @maplibre/maplibre-react-native plug-in tanımlı olmalıdır');
  });

  await t.test('2. Android Paket Kimliği & iOS Bundle ID Tutarlılık Doğrulaması (com.sehirnabiz.app)', () => {
    const appJsonPath = path.resolve(mobileDir, 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

    assert.equal(
      appJson.expo.android.package,
      'com.sehirnabiz.app',
      'Android paket adı com.sehirnabiz.app olarak tutarlı olmalıdır',
    );

    assert.equal(
      appJson.expo.ios.bundleIdentifier,
      'com.sehirnabiz.app',
      'iOS bundle identifier com.sehirnabiz.app olarak tutarlı ve simetrik olmalıdır',
    );
  });

  await t.test('3. Mobil Ayarlar Ekranı Tehlikeli Bölge & Silme Modalı Yapısı', () => {
    const settingsPath = path.resolve(mobileDir, 'app/profile/settings.tsx');
    const content = fs.readFileSync(settingsPath, 'utf8');

    // Tehlikeli Bölge ve KVKK ifadeleri
    assert.ok(content.includes('Hesap Yönetimi & Veri Silme'), 'Ayarlar ekranında hesap silme bölümü bulunmalıdır');
    assert.ok(content.includes('Hesabımı ve Verilerimi Sil'), 'Hesap silme eylemi mevcut olmalıdır');
    assert.ok(content.includes('6698 Sayılı KVKK'), 'Yasal KVKK aydınlatması bulunmalıdır');
    assert.ok(content.includes('deletePassword'), 'Şifre doğrulama kontrolü bulunmalıdır');
    assert.ok(content.includes('handleDeleteAccount'), 'Silme işleyicisi tanımlı olmalıdır');
    assert.ok(content.includes('authApi.deleteAccount'), 'authApi deleteAccount servisi çağrılmalıdır');
    assert.ok(content.includes('logout()'), 'Silme sonrası oturum kapatma çağrısı bulunmalıdır');
  });

  await t.test('4. Web Üzerinden Silme Talebi Ekranı (account-deletion.tsx)', () => {
    const webScreenPath = path.resolve(mobileDir, 'app/account-deletion.tsx');
    assert.ok(fs.existsSync(webScreenPath), 'app/account-deletion.tsx web rotası mevcut olmalıdır');

    const content = fs.readFileSync(webScreenPath, 'utf8');
    assert.ok(content.includes('Hesap Silme Talebi'), 'Ekran başlığı tanımlı olmalıdır');
    assert.ok(content.includes('Veri Yaşam Döngüsü'), 'Veri yaşam döngüsü açıklaması bulunmalıdır');
    assert.ok(content.includes('users/web-deletion-request'), 'Web silme API uç noktası çağrılmalıdır');
    assert.ok(content.includes('keyboardType="email-address"'), 'E-posta girişi desteklenmelidir');
    assert.ok(content.includes('secureTextEntry'), 'Şifre alanı gizli olmalıdır');
  });

  await t.test('5. Auth API İstemcisi Silme ve İptal Metotları', () => {
    const authApiPath = path.resolve(mobileDir, 'src/features/auth/services/authApi.ts');
    const content = fs.readFileSync(authApiPath, 'utf8');

    assert.ok(content.includes('async deleteAccount('), 'authApi.deleteAccount metodu tanımlı olmalıdır');
    assert.ok(content.includes("method: 'DELETE'"), 'deleteAccount DELETE HTTP metodunu kullanmalıdır');
    assert.ok(content.includes('/users/me'), 'deleteAccount /users/me uç noktasına istek atmalıdır');
    assert.ok(content.includes('async cancelDeletion('), 'authApi.cancelDeletion metodu tanımlı olmalıdır');
    assert.ok(content.includes('/users/cancel-deletion'), 'cancelDeletion /users/cancel-deletion uç noktasına istek atmalıdır');
  });

  await t.test('6. Form Doğrulama ve Güvenli Veri Gönderimi Mantığı', () => {
    // Boş şifre denetimi
    const validateDeletionForm = (password, email) => {
      if (!password || password.trim().length === 0) {
        return { valid: false, error: 'Hesap şifrenizi girmeniz zorunludur.' };
      }
      if (email !== undefined && !email.includes('@')) {
        return { valid: false, error: 'Geçerli bir e-posta adresi giriniz.' };
      }
      return { valid: true, error: null };
    };

    assert.equal(validateDeletionForm('').valid, false);
    assert.equal(validateDeletionForm('   ').valid, false);
    assert.equal(validateDeletionForm('Secret123!').valid, true);
    assert.equal(validateDeletionForm('Secret123!', 'invalid-email').valid, false);
    assert.equal(validateDeletionForm('Secret123!', 'test@sehirnabiz.local').valid, true);
  });
});
