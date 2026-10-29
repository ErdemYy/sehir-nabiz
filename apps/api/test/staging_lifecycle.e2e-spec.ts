import { describe, it, expect, afterAll } from 'vitest';
import { io, Socket } from 'socket.io-client';
import * as net from 'net';
import { execSync } from 'child_process';

// Staging reverse proxy üzerinden kendi kendini imzalayan TLS sertifikasını kabul et
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function isPortListening(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const s = new net.Socket();
    s.setTimeout(1500);
    s.once('connect', () => {
      s.destroy();
      resolve(true);
    });
    s.once('timeout', () => {
      s.destroy();
      resolve(false);
    });
    s.once('error', () => {
      s.destroy();
      resolve(false);
    });
    s.connect(port, host);
  });
}

describe('Phase 16 — Canlı Staging Dry-Run ve 12 Adımlı Uçtan Uca Yaşam Döngüsü', async () => {
  const isNginxUp = await isPortListening(443);
  if (!isNginxUp) {
    it.skip('Staging Nginx (port 443) kapalı, test atlandı', () => {});
    return;
  }

  const BASE_URL = 'https://localhost/api/v1';
  let citizenToken = '';
  let citizenRefreshToken = '';
  let citizenUserId = '';
  const citizenEmail = `staging_user_${Date.now()}@staging.sehirnabiz.local`;
  const citizenPassword = 'SecureStagingPassword2026!';

  let modToken = '';
  const modEmail = `staging_mod_${Date.now()}@staging.sehirnabiz.local`;
  const modPassword = 'SecureModPassword2026!';

  let eventId = '';
  let socketClient: Socket | null = null;

  afterAll(async () => {
    if (socketClient && socketClient.connected) {
      socketClient.disconnect();
    }
  });

  it('1. Kullanıcı Kaydı (Citizen Registration)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: citizenEmail,
        password: citizenPassword,
        displayName: 'Staging Test Vatandaşı',
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.email).toBe(citizenEmail);
    expect(body.tokens.accessToken).toBeDefined();
    expect(body.tokens.refreshToken).toBeDefined();
    citizenUserId = body.user.id;
  });

  it('2. Giriş ve Token Yenileme (Login & Token Rotation)', async () => {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: citizenEmail,
        password: citizenPassword,
      }),
    });

    expect(loginRes.status).toBe(200);
    const loginBody = await loginRes.json();
    citizenToken = loginBody.tokens.accessToken;
    citizenRefreshToken = loginBody.tokens.refreshToken;

    // Refresh token rotasyonu
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: citizenRefreshToken }),
    });

    expect(refreshRes.status).toBe(200);
    const refreshBody = await refreshRes.json();
    expect(refreshBody.accessToken).toBeDefined();
    expect(refreshBody.refreshToken).toBeDefined();
    citizenToken = refreshBody.accessToken;
    citizenRefreshToken = refreshBody.refreshToken;
  });

  it('3. Olay Oluşturma (Create Event with Coordinates & PII Content)', async () => {
    const catRes = await fetch(`${BASE_URL}/categories`);
    expect(catRes.status).toBe(200);
    const categories = await catRes.json();
    expect(categories.length).toBeGreaterThan(0);
    const catId = categories[0].id;

    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({
        categoryId: catId,
        title: 'Kadıköy Rıhtım Su Taşkını',
        description: 'Rıhtımda su borusu patladı. İletişim: 0532 123 45 67 veya test@example.com',
        severity: 'HIGH',
        latitude: 40.9901,
        longitude: 29.0253,
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.status).toBe('PENDING_REVIEW');
    eventId = body.id;
  });

  it('4. Fotoğraf Yükleme URL Talebi (Presigned S3 / MinIO Flow)', async () => {
    const uploadUrlRes = await fetch(`${BASE_URL}/events/${eventId}/media/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({
        fileName: 'taskin_kanit.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
      }),
    });

    expect(uploadUrlRes.status).toBe(200);
    const uploadData = await uploadUrlRes.json();
    expect(uploadData.uploadUrl).toBeDefined();
    expect(uploadData.mediaId).toBeDefined();
  });

  it('5. Moderatör Yetkisi ve Olay Onayı (Event Approval to ACTIVE)', async () => {
    // 1. Kullanıcı kaydı oluştur
    await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: modEmail,
        password: modPassword,
        displayName: 'Staging Yetkili Moderatör',
      }),
    });

    // 2. PostgreSQL üzerinden güvenli rol ataması yap
    execSync(
      `docker exec sehir_nabiz_staging_postgres psql -U sehir_nabiz_staging_user -d sehir_nabiz_staging -c "UPDATE users SET role = 'MODERATOR' WHERE email = '${modEmail}';"`,
    );

    // 3. Moderatör olarak giriş yapıp yeni token al
    const modLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: modEmail, password: modPassword }),
    });
    const modLoginData = await modLoginRes.json();
    modToken = modLoginData.tokens.accessToken;

    // 4. Olayı ACTIVE yap
    const approveRes = await fetch(`${BASE_URL}/events/${eventId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${modToken}`,
      },
      body: JSON.stringify({
        status: 'ACTIVE',
        reason: 'Olay doğrulandı ve yayınlandı.',
      }),
    });

    expect(approveRes.status).toBe(200);
    const approveBody = await approveRes.json();
    expect(approveBody.status).toBe('ACTIVE');
  });

  it('6. WebSocket Bağlantısı ve Canlı Oda Katılımı (Socket.io Gateway)', async () => {
    const wsPromise = new Promise<boolean>((resolve) => {
      socketClient = io('https://localhost/realtime', {
        transports: ['websocket'],
        rejectUnauthorized: false,
        timeout: 5000,
        auth: { token: citizenToken },
      });

      socketClient.on('connect', () => {
        socketClient?.emit('join_room', { room: 'city_istanbul' });
        resolve(true);
      });

      socketClient.on('connect_error', () => {
        resolve(false);
      });
    });

    const isConnected = await wsPromise;
    expect(isConnected).toBe(true);
    socketClient?.disconnect();
  });

  it('7. Topluluk Teyidi (Community Feedback on ACTIVE Event)', async () => {
    const feedbackRes = await fetch(`${BASE_URL}/events/${eventId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${modToken}`,
      },
      body: JSON.stringify({
        type: 'CONFIRM',
      }),
    });

    expect([200, 201]).toContain(feedbackRes.status);
    const feedbackBody = await feedbackRes.json();
    expect(feedbackBody.confirmCount).toBeDefined();
  });

  it('8. Hesap Silme Talebi (14 Günlük Bekleme Modu)', async () => {
    const deleteRes = await fetch(`${BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({
        password: citizenPassword,
        immediate: false,
        reason: 'Test amaçlı 14 günlük silme talebi',
      }),
    });

    expect(deleteRes.status).toBe(200);
    const deleteBody = await deleteRes.json();
    expect(deleteBody.success).toBe(true);
    expect(deleteBody.status).toBe('PENDING');
  });

  it('9. PENDING_DELETION Durumunda Standart İş Akışı Engeli (Isolation)', async () => {
    const blockedRes = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({
        categoryId: '00000000-0000-0000-0000-000000000000',
        title: 'Engellenmesi Gereken Olay',
        description: 'Bu olay silme beklemesinde olduğu için reddedilmeli',
        severity: 'LOW',
        latitude: 41.0,
        longitude: 29.0,
      }),
    });

    expect(blockedRes.status).toBe(401);
  });

  it('10. Silme Durumunu Sorgulama (@AllowPendingDeletion)', async () => {
    const statusRes = await fetch(`${BASE_URL}/users/me/deletion-status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${citizenToken}`,
      },
    });

    expect(statusRes.status).toBe(200);
    const statusBody = await statusRes.json();
    expect(statusBody.hasPendingDeletion).toBe(true);
    expect(statusBody.canCancel).toBe(true);
  });

  it('11. Sınırlı Yetkili Yeniden Doğrulama (POST /auth/reauthenticate-deletion)', async () => {
    const reauthRes = await fetch(`${BASE_URL}/auth/reauthenticate-deletion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: citizenEmail,
        password: citizenPassword,
      }),
    });

    expect(reauthRes.status).toBe(200);
    const reauthBody = await reauthRes.json();
    expect(reauthBody.accessToken).toBeDefined();
    expect(reauthBody.expiresIn).toBe('15m');

    // Sınırlı yetkili token ile iptal etme
    const cancelRes = await fetch(`${BASE_URL}/users/me/cancel-deletion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${reauthBody.accessToken}`,
      },
      body: JSON.stringify({
        password: citizenPassword,
      }),
    });

    expect(cancelRes.status).toBe(200);
    const cancelBody = await cancelRes.json();
    expect(cancelBody.success).toBe(true);
  });

  it('12. Nihai Silme, Kişisel Veri Arındırma & İlişkisel Veri Bütünlüğü', async () => {
    // 1. Kullanıcı olarak tekrar giriş yap
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: citizenEmail, password: citizenPassword }),
    });
    expect(loginRes.status).toBe(200);
    const loginData = await loginRes.json();
    const token = loginData.tokens.accessToken;

    // 2. Anında kalıcı silme çağrısı yap (Immediate Purge)
    const purgeRes = await fetch(`${BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password: citizenPassword,
        immediate: true,
        reason: 'Yaşam döngüsü tamamlama testi',
      }),
    });

    expect(purgeRes.status).toBe(200);
    const purgeBody = await purgeRes.json();
    expect(purgeBody.status).toBe('COMPLETED');
    expect(purgeBody.anonymizedDisplayName).toBe('Anonim Vatandaş');

    // 3. PostgreSQL üzerinden PII arındırmasını ve kentsel olay bütünlüğünü doğrula
    const psqlCheck = execSync(
      `docker exec sehir_nabiz_staging_postgres psql -U sehir_nabiz_staging_user -d sehir_nabiz_staging -t -A -c "SELECT description FROM events WHERE id = '${eventId}';"`,
    ).toString().trim();

    // Açıklamada telefon ve e-posta gizlenmiş olmalı
    expect(psqlCheck).toContain('[Telefon Gizlendi]');
    expect(psqlCheck).toContain('[E-posta Gizlendi]');

    // Kullanıcının hesabı DELETED durumunda olmalı
    const userStatusCheck = execSync(
      `docker exec sehir_nabiz_staging_postgres psql -U sehir_nabiz_staging_user -d sehir_nabiz_staging -t -A -c "SELECT \\"accountStatus\\" FROM users WHERE id = '${citizenUserId}';"`,
    ).toString().trim();
    expect(userStatusCheck).toBe('DELETED');
  });
});
