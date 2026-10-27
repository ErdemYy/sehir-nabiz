import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from '../../map/services/eventsApi';
import type { RealtimeEventPayload } from '@sehir-nabiz/shared';

export type RealtimeConnectionStatus =
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'reconnecting'
  | 'syncing';

export class SocketService {
  private static instance: SocketService | null = null;
  private socket: Socket | null = null;
  private currentStatus: RealtimeConnectionStatus = 'disconnected';
  private statusListeners = new Set<(status: RealtimeConnectionStatus) => void>();

  // Deduplication & Monotonic Sıralama Koruyucuları (Section 7)
  private processedEventIds = new Set<string>();
  private eventVersions = new Map<string, number>();

  private currentToken: string | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /**
   * Socket Bağlantısını Başlat / Yapılandır
   */
  public connect(token?: string | null): Socket {
    this.currentToken = token ?? null;

    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const hostUrl = getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
    const socketUrl = `${hostUrl}/realtime`;

    this.updateStatus('connecting');

    this.socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5, // Jitter
      timeout: 10000,
      auth: {
        token: this.currentToken || undefined,
      },
    });

    this.socket.on('connect', () => {
      this.updateStatus('connected');
      this.socket?.emit('subscribe_events');
    });

    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // Sunucu tarafından zorla kapatıldıysa tekrar bağlan
        this.socket?.connect();
      }
      this.updateStatus('disconnected');
    });

    this.socket.on('reconnect_attempt', () => {
      this.updateStatus('reconnecting');
    });

    this.socket.on('reconnect', () => {
      this.updateStatus('syncing');
      this.socket?.emit('subscribe_events');
      setTimeout(() => {
        this.updateStatus('connected');
      }, 500);
    });

    this.socket.on('connect_error', () => {
      this.updateStatus('disconnected');
    });

    return this.socket;
  }

  /**
   * Bağlantıyı Kapat
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.updateStatus('disconnected');
    this.processedEventIds.clear();
    this.eventVersions.clear();
  }

  /**
   * Bağlantı Durumu Dinleyicisi
   */
  public onStatusChange(callback: (status: RealtimeConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.currentStatus);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  public getStatus(): RealtimeConnectionStatus {
    return this.currentStatus;
  }

  /**
   * Olay Dinleyici Kaydı (Deduplication ve Sıra Garantisi ile)
   */
  public on<T = Record<string, unknown>>(
    eventName: string,
    callback: (data: T) => void,
  ): () => void {
    if (!this.socket) {
      this.connect(this.currentToken);
    }

    const handler = (payload: RealtimeEventPayload<T> | T) => {
      // RealtimeEventPayload formatındaysa deduplication ve sıralama kontrolü yap
      if (payload && typeof payload === 'object' && 'serverEventId' in payload) {
        const p = payload as RealtimeEventPayload<T>;

        // 1. Mükerrer Mesaj Filtresi (Deduplication)
        if (this.processedEventIds.has(p.serverEventId)) {
          return;
        }
        this.processedEventIds.add(p.serverEventId);

        // Bellek yönetimi: En fazla 500 ID sakla
        if (this.processedEventIds.size > 500) {
          const first = this.processedEventIds.values().next().value;
          if (first) this.processedEventIds.delete(first);
        }

        // 2. Sırasız Mesaj Koruması (Monotonic Versioning)
        const lastVersion = this.eventVersions.get(p.eventId);
        if (lastVersion !== undefined && p.eventVersion < lastVersion) {
          // Eski durum yeni durumun üzerine yazılmamalı
          return;
        }
        this.eventVersions.set(p.eventId, p.eventVersion);

        callback(p.data);
      } else {
        callback(payload as T);
      }
    };

    this.socket?.on(eventName, handler);

    return () => {
      this.socket?.off(eventName, handler);
    };
  }

  /**
   * Coğrafi BBox Aboneliği
   */
  public subscribeBbox(bbox: { west: number; south: number; east: number; north: number }): void {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_bbox', bbox);
    }
  }

  /**
   * Yetkili Moderasyon Odasına Katılma
   */
  public async joinModeration(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ success: false, error: 'SOCKET_DISCONNECTED' });
        return;
      }

      this.socket.emit('join_moderation', (res: { success: boolean; error?: string }) => {
        resolve(res);
      });

      // Zaman aşımı koruması
      setTimeout(() => {
        resolve({ success: false, error: 'TIMEOUT' });
      }, 5000);
    });
  }

  private updateStatus(status: RealtimeConnectionStatus): void {
    this.currentStatus = status;
    this.statusListeners.forEach((listener) => listener(status));
  }
}

export const socketService = SocketService.getInstance();
