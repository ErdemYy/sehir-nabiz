import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import {
  JwtPayload,
  UserRole,
  RealtimeEventName,
  RealtimeRoom,
  RealtimeEventPayload,
} from '@sehir-nabiz/shared';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private activeClients = new Map<string, { userId?: string; role?: UserRole }>();

  constructor(private readonly jwtService: JwtService) {}

  afterInit(): void {
    this.logger.log('[RealtimeGateway] WebSocket Ağ Geçidi başlatıldı (/realtime)');
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (token) {
        try {
          const payload = this.jwtService.verify<JwtPayload>(token);
          client.data.user = payload;
          this.activeClients.set(client.id, {
            userId: payload.sub,
            role: payload.role,
          });

          // Kullanıcının kendi özel bildirim odasına katılmasını sağla
          const userRoom = `user:${payload.sub}`;
          await client.join(userRoom);

          this.logger.log(
            `[RealtimeGateway] Oturumlu istemci bağlandı: ID=${client.id}, Rol=${payload.role}`,
          );
        } catch {
          // Geçersiz token durumunda istemci anonim olarak devam eder
          client.data.user = null;
          this.activeClients.set(client.id, {});
          this.logger.log(`[RealtimeGateway] Anonim istemci bağlandı (Geçersiz token): ID=${client.id}`);
        }
      } else {
        client.data.user = null;
        this.activeClients.set(client.id, {});
        this.logger.log(`[RealtimeGateway] Anonim istemci bağlandı: ID=${client.id}`);
      }

      // Varsayılan olarak genel olay kanalına abone et
      await client.join(RealtimeRoom.EVENTS_GLOBAL);
    } catch (err) {
      this.logger.warn(`[RealtimeGateway] Bağlantı hatası: ${(err as Error).message}`);
    }
  }

  handleDisconnect(client: Socket): void {
    this.activeClients.delete(client.id);
    this.logger.log(`[RealtimeGateway] İstemci ayrıldı: ID=${client.id}`);
  }

  /**
   * Genel olaylar kanalına abone olma
   */
  @SubscribeMessage('subscribe_events')
  async handleSubscribeEvents(@ConnectedSocket() client: Socket): Promise<{ success: boolean; room: string }> {
    await client.join(RealtimeRoom.EVENTS_GLOBAL);
    return { success: true, room: RealtimeRoom.EVENTS_GLOBAL };
  }

  /**
   * Genel olaylar kanalından çıkma
   */
  @SubscribeMessage('unsubscribe_events')
  async handleUnsubscribeEvents(@ConnectedSocket() client: Socket): Promise<{ success: boolean; room: string }> {
    await client.leave(RealtimeRoom.EVENTS_GLOBAL);
    return { success: true, room: RealtimeRoom.EVENTS_GLOBAL };
  }

  /**
   * Bounding box (coğrafi alan) aboneliği
   */
  @SubscribeMessage('subscribe_bbox')
  handleSubscribeBbox(
    @ConnectedSocket() client: Socket,
    @MessageBody() bbox: { west: number; south: number; east: number; north: number },
  ): { success: boolean; bbox: typeof bbox } {
    client.data.subscribedBbox = bbox;
    return { success: true, bbox };
  }

  /**
   * Yetkili Moderasyon Odasına Katılma
   * Güvenlik: Yalnızca MODERATOR veya ADMIN rolündeki kullanıcılar katılabilir.
   */
  @SubscribeMessage('join_moderation')
  async handleJoinModeration(
    @ConnectedSocket() client: Socket,
  ): Promise<{ success: boolean; room?: string; error?: string }> {
    const user = client.data.user as JwtPayload | undefined;

    if (!user || (user.role !== UserRole.MODERATOR && user.role !== UserRole.ADMIN)) {
      this.logger.warn(
        `[RealtimeGateway] Yetkisiz moderasyon odası katılım denemesi: İstemci=${client.id}, Rol=${user?.role || 'ANONYMOUS'}`,
      );
      return {
        success: false,
        error: 'UNAUTHORIZED_ROOM',
      };
    }

    await client.join(RealtimeRoom.MODERATION_QUEUE);
    this.logger.log(`[RealtimeGateway] Moderatör odaya katıldı: ID=${client.id}, Kullanıcı=${user.sub}`);
    return { success: true, room: RealtimeRoom.MODERATION_QUEUE };
  }

  /**
   * Moderasyon odasından ayrılma
   */
  @SubscribeMessage('leave_moderation')
  async handleLeaveModeration(@ConnectedSocket() client: Socket): Promise<{ success: boolean }> {
    await client.leave(RealtimeRoom.MODERATION_QUEUE);
    return { success: true };
  }

  /**
   * Bağlantı canlılık kontrolü (Ping/Pong)
   */
  @SubscribeMessage('ping')
  handlePing(): { pong: boolean; timestamp: number } {
    return { pong: true, timestamp: Date.now() };
  }

  /**
   * Genel olay güncellemesi yayını (Broadcast)
   * Idempotency ve sıra garantisi için serverEventId ve eventVersion içerir.
   */
  broadcastEventUpdate<T extends { id: string; version?: number }>(
    eventName: RealtimeEventName,
    eventData: T,
  ): void {
    const payload: RealtimeEventPayload<T> = {
      serverEventId: randomUUID(),
      eventVersion: eventData.version ?? 1,
      eventName,
      eventId: eventData.id,
      data: eventData,
      timestamp: new Date().toISOString(),
    };

    if (this.server) {
      this.server.to(RealtimeRoom.EVENTS_GLOBAL).emit(eventName, payload);
    }
  }

  /**
   * Moderatör kuyruğu yayını
   */
  broadcastToModerators<T extends { id: string }>(
    eventName: RealtimeEventName | string,
    eventData: T,
  ): void {
    const payload = {
      serverEventId: randomUUID(),
      eventName,
      eventId: eventData.id,
      data: eventData,
      timestamp: new Date().toISOString(),
    };

    if (this.server) {
      this.server.to(RealtimeRoom.MODERATION_QUEUE).emit(eventName, payload);
    }
  }

  /**
   * Tekil kullanıcıya özel bildirim iletme
   */
  sendToUser<T>(userId: string, eventName: string, data: T): void {
    if (this.server) {
      const userRoom = `user:${userId}`;
      this.server.to(userRoom).emit(eventName, data);
    }
  }

  /**
   * Handshake üzerinden token çıkarıcı
   */
  private extractToken(client: Socket): string | null {
    const authHeader =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization ||
      client.handshake.query?.token;

    if (!authHeader || typeof authHeader !== 'string') {
      return null;
    }

    if (authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }

    return authHeader.trim();
  }
}
