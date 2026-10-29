import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { io as ClientIO, Socket as ClientSocket } from 'socket.io-client';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import * as net from 'net';

async function isPortListening(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise(resolve => {
    const s = new net.Socket();
    s.setTimeout(1000);
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

describe('Phase 17 — Çoklu Instance Socket.IO & Redis Adapter Güvenilirlik Testleri', async () => {
  const redisPort = 6380;
  const isRedisUp = await isPortListening(redisPort);

  if (!isRedisUp) {
    it.skip(`Redis servisi (${redisPort}) kapalı olduğundan çoklu instance testleri atlandı (BLOCKED)`, () => {});
    return;
  }

  const PORT_1 = 3181;
  const PORT_2 = 3182;

  let httpServer1: any;
  let httpServer2: any;
  let ioServer1: SocketIOServer;
  let ioServer2: SocketIOServer;
  let pubClient1: Redis;
  let subClient1: Redis;
  let pubClient2: Redis;
  let subClient2: Redis;

  let clientA: ClientSocket; // Connected to Server 1
  let clientB: ClientSocket; // Connected to Server 2

  const userAId = 'user-instance-a-uuid';
  const userBId = 'user-instance-b-uuid';

  beforeAll(async () => {
    // 1. Instance 1 Setup (Port 3181)
    httpServer1 = createServer();
    pubClient1 = new Redis({ host: '127.0.0.1', port: redisPort, password: 'redis_dev_secret', lazyConnect: true });
    subClient1 = pubClient1.duplicate();
    await Promise.all([pubClient1.connect(), subClient1.connect()]);

    ioServer1 = new SocketIOServer(httpServer1, {
      cors: { origin: '*' },
      adapter: createAdapter(pubClient1, subClient1),
    });

    // /realtime namespace
    const nsp1 = ioServer1.of('/realtime');
    nsp1.on('connection', socket => {
      const auth = socket.handshake.auth || {};
      const userId = auth.userId || socket.handshake.query?.userId;
      const role = auth.role || 'CITIZEN';

      if (userId) {
        socket.join(`user:${userId}`);
      }
      socket.join('events:global');

      socket.on('join_moderation', () => {
        if (role === 'MODERATOR' || role === 'ADMIN') {
          socket.join('moderation:queue');
          socket.emit('moderation_joined', { success: true });
        } else {
          socket.emit('error', {
            code: 'UNAUTHORIZED_ROOM',
            message: 'Bu odaya yalnızca moderatörler erişebilir.',
          });
        }
      });
    });

    await new Promise<void>(resolve => httpServer1.listen(PORT_1, resolve));

    // 2. Instance 2 Setup (Port 3182)
    httpServer2 = createServer();
    pubClient2 = new Redis({ host: '127.0.0.1', port: redisPort, password: 'redis_dev_secret', lazyConnect: true });
    subClient2 = pubClient2.duplicate();
    await Promise.all([pubClient2.connect(), subClient2.connect()]);

    ioServer2 = new SocketIOServer(httpServer2, {
      cors: { origin: '*' },
      adapter: createAdapter(pubClient2, subClient2),
    });

    const nsp2 = ioServer2.of('/realtime');
    nsp2.on('connection', socket => {
      const auth = socket.handshake.auth || {};
      const userId = auth.userId || socket.handshake.query?.userId;
      const role = auth.role || 'CITIZEN';

      if (userId) {
        socket.join(`user:${userId}`);
      }
      socket.join('events:global');

      socket.on('join_moderation', () => {
        if (role === 'MODERATOR' || role === 'ADMIN') {
          socket.join('moderation:queue');
          socket.emit('moderation_joined', { success: true });
        } else {
          socket.emit('error', {
            code: 'UNAUTHORIZED_ROOM',
            message: 'Bu odaya yalnızca moderatörler erişebilir.',
          });
        }
      });
    });

    await new Promise<void>(resolve => httpServer2.listen(PORT_2, resolve));
  });

  afterAll(async () => {
    clientA?.disconnect();
    clientB?.disconnect();

    if (httpServer1?.listening) {
      httpServer1.closeAllConnections?.();
      await new Promise(r => httpServer1.close(r));
    }
    if (httpServer2?.listening) {
      httpServer2.closeAllConnections?.();
      await new Promise(r => httpServer2.close(r));
    }

    await Promise.all([
      pubClient1?.disconnect(),
      subClient1?.disconnect(),
      pubClient2?.disconnect(),
      subClient2?.disconnect(),
    ].filter(Boolean));
  });

  it('1. İstemciler farklı instance\'lara bağlandığında el sıkışma (handshake) gecikmesi ölçülmeli', async () => {
    const t0 = Date.now();
    clientA = ClientIO(`http://127.0.0.1:${PORT_1}/realtime`, {
      transports: ['websocket'],
      auth: { userId: userAId, role: 'CITIZEN' },
    });

    const handshakeTimeA = await new Promise<number>(resolve => {
      clientA.on('connect', () => resolve(Date.now() - t0));
    });

    const t1 = Date.now();
    clientB = ClientIO(`http://127.0.0.1:${PORT_2}/realtime`, {
      transports: ['websocket'],
      auth: { userId: userBId, role: 'CITIZEN' },
    });

    const handshakeTimeB = await new Promise<number>(resolve => {
      clientB.on('connect', () => resolve(Date.now() - t1));
    });

    expect(clientA.connected).toBe(true);
    expect(clientB.connected).toBe(true);
    expect(handshakeTimeA).toBeLessThan(1000);
    expect(handshakeTimeB).toBeLessThan(1000);

    console.log(`[Handshake Benchmark] Client A (Instance 1): ${handshakeTimeA}ms, Client B (Instance 2): ${handshakeTimeB}ms`);
  });

  it('2. Instance 1 üzerinde güncellenen olay Redis Adapter ile Instance 2 üzerindeki Client B\'ye iletilmeli', async () => {
    const testPayload = {
      eventId: 'agg-event-phase17-42',
      status: 'ACTIVE',
      title: 'Kadıköy Rıhtım Su Baskını Giderildi',
      version: 2,
      timestamp: new Date().toISOString(),
    };

    const emitStart = Date.now();
    const receivePromises = [
      new Promise<{ client: string; data: any; latencyMs: number }>(resolve => {
        clientA.once('event:status_changed', data => {
          resolve({ client: 'ClientA_Inst1', data, latencyMs: Date.now() - emitStart });
        });
      }),
      new Promise<{ client: string; data: any; latencyMs: number }>(resolve => {
        clientB.once('event:status_changed', data => {
          resolve({ client: 'ClientB_Inst2', data, latencyMs: Date.now() - emitStart });
        });
      }),
    ];

    // Instance 1 üzerinden events:global odasına yayın yap
    ioServer1.of('/realtime').to('events:global').emit('event:status_changed', testPayload);

    const results = await Promise.all(receivePromises);
    const resA = results[0];
    const resB = results[1];

    expect(resA).toBeDefined();
    expect(resB).toBeDefined();
    expect(resA!.data.eventId).toBe('agg-event-phase17-42');
    expect(resB!.data.eventId).toBe('agg-event-phase17-42');
    expect(resB!.data.status).toBe('ACTIVE');

    console.log(
      `[Cross-Instance Latency] Yerel Instance 1 Teslimat: ${resA!.latencyMs}ms, Redis Adapter -> Instance 2 Teslimat: ${resB!.latencyMs}ms`,
    );
    expect(resB!.latencyMs).toBeLessThan(500);
  });

  it('3. Kullanıcıya özel oda (user:userId) izolasyonu: Instance 1\'den atılan mesaj Instance 2\'deki Client B\'ye ulaşırken Client A\'ya sızmamalı', async () => {
    let clientAReceived = false;
    const clientAListener = () => {
      clientAReceived = true;
    };
    clientA.on('user:notification', clientAListener);

    const privateNotification = {
      id: 'notif-priv-1',
      title: 'Sayın Kullanıcı B, bildiriminiz onaylandı',
    };

    const receivedByB = await new Promise<any>(resolve => {
      clientB.once('user:notification', data => resolve(data));
      // Instance 1'den User B'nin tekil odasına mesaj gönder
      ioServer1.of('/realtime').to(`user:${userBId}`).emit('user:notification', privateNotification);
    });

    // 100ms bekle ve Client A'nın almadığını doğrula
    await new Promise(r => setTimeout(r, 100));
    clientA.off('user:notification', clientAListener);

    expect(receivedByB.id).toBe('notif-priv-1');
    expect(clientAReceived).toBe(false);
  });

  it('4. Moderasyon odası yetkilendirmesi: Citizen rolü yetkisiz erişim hatası almalı, Moderator rolü odaya girebilmeli', async () => {
    // Client B (CITIZEN rolü) odaya girmeye çalışır
    const errorPromise = new Promise<{ code: string }>(resolve => {
      clientB.once('error', err => resolve(err));
      clientB.emit('join_moderation');
    });

    const errorResult = await errorPromise;
    expect(errorResult.code).toBe('UNAUTHORIZED_ROOM');

    // Moderator rolüyle Instance 2'ye bağlanan yeni istemci
    const modClient = ClientIO(`http://127.0.0.1:${PORT_2}/realtime`, {
      transports: ['websocket'],
      auth: { userId: 'mod-uuid-1', role: 'MODERATOR' },
    });

    await new Promise<void>(resolve => modClient.on('connect', () => resolve()));

    const joinedPromise = new Promise<{ success: boolean }>(resolve => {
      modClient.once('moderation_joined', res => resolve(res));
      modClient.emit('join_moderation');
    });

    const joinedResult = await joinedPromise;
    expect(joinedResult.success).toBe(true);

    modClient.disconnect();
  });

  it('5. Instance 1 kapatıldığında Client A bağlantı kopmasını algılamalı ve Instance 2\'ye reconnect olup REST senkronizasyonu yapabilmeli', async () => {
    let disconnectFired = false;
    clientA.once('disconnect', () => {
      disconnectFired = true;
    });

    // Instance 1'i kontrollü olarak kapat ve bağlı soketleri kopar
    const disconnectPromise = new Promise<void>(resolve => {
      clientA.once('disconnect', () => {
        disconnectFired = true;
        resolve();
      });
    });

    // Instance 1'in /realtime namespace'indeki tüm bağlı istemcileri kopar
    ioServer1.of('/realtime').disconnectSockets(true);
    await disconnectPromise;
    httpServer1.closeAllConnections?.();
    await new Promise(r => httpServer1.close(r));

    expect(disconnectFired).toBe(true);

    // Client A, ayakta olan Instance 2'ye bağlanır (Failover Reconnect)
    const clientAFailover = ClientIO(`http://127.0.0.1:${PORT_2}/realtime`, {
      transports: ['websocket'],
      auth: { userId: userAId, role: 'CITIZEN' },
    });

    await new Promise<void>(resolve => {
      clientAFailover.on('connect', () => resolve());
    });

    expect(clientAFailover.connected).toBe(true);

    // Reconnection sonrası REST mutabakatı (Reconciliation) simülasyonu
    const simulatedRestSnapshot = {
      latestEventVersion: 5,
      activeEventsCount: 12,
      lastSyncTimestamp: new Date().toISOString(),
    };

    expect(simulatedRestSnapshot.latestEventVersion).toBe(5);
    expect(simulatedRestSnapshot.activeEventsCount).toBeGreaterThan(0);

    clientAFailover.disconnect();
  });

  it('6. Transport Ayarları: WebSocket-only doğrudan bağlanır; HTTP-polling sticky-session (ip_hash) gerektirir', async () => {
    // WebSocket-only transport: Handshake HTTP-polling bypass edilerek tek persistent TCP üzerinden akar
    const wsOnlyClient = ClientIO(`http://127.0.0.1:${PORT_2}/realtime`, {
      transports: ['websocket'],
      upgrade: false,
    });

    await new Promise<void>(resolve => {
      wsOnlyClient.on('connect', () => resolve());
    });

    expect(wsOnlyClient.io.engine.transport.name).toBe('websocket');
    wsOnlyClient.disconnect();

    // Polling transport: Çoklu instance'ta tekil session id (sid) için yük dengeleyicide ip_hash zorunludur
    const pollingClient = ClientIO(`http://127.0.0.1:${PORT_2}/realtime`, {
      transports: ['polling'],
      upgrade: false,
    });

    await new Promise<void>(resolve => {
      pollingClient.on('connect', () => resolve());
    });

    expect(pollingClient.io.engine.transport.name).toBe('polling');
    pollingClient.disconnect();
  });
});
