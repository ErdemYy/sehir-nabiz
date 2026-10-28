import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Phase 15 — Account Deletion Verification, Privacy Hardening & UX Testleri', async t => {
  const mobileDir = path.resolve(__dirname, '..');

  await t.test('1. Mobil Settings Ekranında 14 Günlük Bekleme ve Anında Silme Ayrımı', () => {
    const settingsPath = path.resolve(mobileDir, 'app/profile/settings.tsx');
    const content = fs.readFileSync(settingsPath, 'utf8');

    assert.ok(
      content.includes('Anında Silme (Derhal İmha)'),
      'Anında silme seçeneği net biçimde sunulmalıdır',
    );
    assert.ok(
      content.includes('14 Günlük Bekleme Süresi'),
      '14 günlük bekleme süresi seçeneği açıkça belirtilmelidir',
    );
    assert.ok(
      content.includes('Cayma veya geri alma imkânı bulunmaz'),
      'Anında silme seçildiğinde geri alma imkanı olmadığı belirtilmelidir',
    );
    assert.ok(
      content.includes('Hesabınız 14 gün dondurulur'),
      'Bekleme süresinde hesabın dondurulacağı kullanıcıya dürüstçe açıklanmalıdır',
    );
  });

  await t.test('2. Kamuya Açık Kentsel Olayların Anonimleştirilerek Korunması Dürüst Bildirimi', () => {
    const settingsPath = path.resolve(mobileDir, 'app/profile/settings.tsx');
    const content = fs.readFileSync(settingsPath, 'utf8');

    assert.ok(
      content.includes('Anonim Vatandaş'),
      'Kullanıcının olay bildirimlerinin "Anonim Vatandaş" olarak kamu yararı adına korunacağı belirtilmelidir',
    );
    assert.ok(
      content.includes('onaylanmamış taslak bildirimleriniz ve geçici fotoğraflarınız tamamen silinir'),
      'Onaylanmamış taslakların kalıcı olarak silineceği şeffaf şekilde açıklanmalıdır',
    );
  });

  await t.test('3. Auth API İstemcisi İptal ve Durum Doğrulaması', () => {
    const authApiPath = path.resolve(mobileDir, 'src/features/auth/services/authApi.ts');
    const content = fs.readFileSync(authApiPath, 'utf8');

    assert.ok(
      content.includes('deleteAccount'),
      'authApi.deleteAccount metodu bulunmalıdır',
    );
    assert.ok(
      content.includes('cancelDeletion'),
      'authApi.cancelDeletion metodu bulunmalıdır',
    );
  });

  await t.test('4. Cihaz GPS Konumunun Sunucuda Saklanmadığı Gizlilik Taahhüdü', () => {
    const settingsPath = path.resolve(mobileDir, 'app/profile/settings.tsx');
    const content = fs.readFileSync(settingsPath, 'utf8');

    assert.ok(
      content.includes('Cihaz Konumu Asla Saklanmaz'),
      'Ayarlar ekranı GPS gizlilik taahhüdünü korumalıdır',
    );
    assert.ok(
      content.includes('EXIF & GPS Temizleme Garantisi'),
      'Ayarlar ekranı EXIF temizleme garantisini korumalıdır',
    );
  });
});
