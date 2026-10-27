import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RealtimeGateway } from './realtime.gateway';
import { JwtService } from '@nestjs/jwt';
import { UserRole, RealtimeEventName, RealtimeRoom } from '@sehir-nabiz/shared';

describe('RealtimeGateway (Unit Tests)', () => {
  let gateway: RealtimeGateway;
  let mockJwtService: any;
  let mockServer: any;

  beforeEach(() => {
    mockJwtService = {
      verify: vi.fn(),
    };

    mockServer = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };

    gateway = new RealtimeGateway(mockJwtService as JwtService);
    gateway.server = mockServer as any;
  });

  describe('Bağlantı ve Oturum Yönetimi', () => {
    it('geçerli JWT ile bağlanan kullanıcıyı doğrulamalı ve özel odasına katılmalı', async () => {
      const mockClient: any = {
        id: 'socket-1',
        data: {},
        handshake: {
          auth: { token: 'valid.jwt.token' },
        },
        join: vi.fn().mockResolvedValue(undefined),
      };

      mockJwtService.verify.mockReturnValue({
        sub: 'user-uuid-1',
        email: 'user@example.com',
        role: UserRole.CITIZEN,
      });

      await gateway.handleConnection(mockClient);

      expect(mockClient.data.user).toBeDefined();
      expect(mockClient.data.user.sub).toBe('user-uuid-1');
      expect(mockClient.join).toHaveBeenCalledWith('user:user-uuid-1');
      expect(mockClient.join).toHaveBeenCalledWith(RealtimeRoom.EVENTS_GLOBAL);
    });

    it('tokensız anonim istemciyi kabul etmeli ve genel olaylar odasına almalı', async () => {
      const mockClient: any = {
        id: 'anon-socket',
        data: {},
        handshake: {},
        join: vi.fn().mockResolvedValue(undefined),
      };

      await gateway.handleConnection(mockClient);

      expect(mockClient.data.user).toBeNull();
      expect(mockClient.join).toHaveBeenCalledWith(RealtimeRoom.EVENTS_GLOBAL);
    });
  });

  describe('Moderasyon Odası Güvenlik Kalkanı', () => {
    it('normal vatandaşın moderasyon odasına katılımını engellemeli (UNAUTHORIZED_ROOM)', async () => {
      const mockClient: any = {
        id: 'citizen-socket',
        data: {
          user: {
            sub: 'citizen-uuid',
            role: UserRole.CITIZEN,
          },
        },
        join: vi.fn(),
      };

      const result = await gateway.handleJoinModeration(mockClient);

      expect(result.success).toBe(false);
      expect(result.error).toBe('UNAUTHORIZED_ROOM');
      expect(mockClient.join).not.toHaveBeenCalled();
    });

    it('anonim kullanıcının moderasyon odasına katılımını engellemeli', async () => {
      const mockClient: any = {
        id: 'anon-socket',
        data: { user: null },
        join: vi.fn(),
      };

      const result = await gateway.handleJoinModeration(mockClient);

      expect(result.success).toBe(false);
      expect(result.error).toBe('UNAUTHORIZED_ROOM');
    });

    it('yetkili MODERATOR kullanıcısını odaya kabul etmeli', async () => {
      const mockClient: any = {
        id: 'mod-socket',
        data: {
          user: {
            sub: 'mod-uuid',
            role: UserRole.MODERATOR,
          },
        },
        join: vi.fn().mockResolvedValue(undefined),
      };

      const result = await gateway.handleJoinModeration(mockClient);

      expect(result.success).toBe(true);
      expect(result.room).toBe(RealtimeRoom.MODERATION_QUEUE);
      expect(mockClient.join).toHaveBeenCalledWith(RealtimeRoom.MODERATION_QUEUE);
    });

    it('yetkili ADMIN kullanıcısını odaya kabul etmeli', async () => {
      const mockClient: any = {
        id: 'admin-socket',
        data: {
          user: {
            sub: 'admin-uuid',
            role: UserRole.ADMIN,
          },
        },
        join: vi.fn().mockResolvedValue(undefined),
      };

      const result = await gateway.handleJoinModeration(mockClient);

      expect(result.success).toBe(true);
      expect(result.room).toBe(RealtimeRoom.MODERATION_QUEUE);
    });
  });

  describe('Canlılık ve Yayın İşlemleri', () => {
    it('ping mesajına anlık pong ile yanıt vermeli', () => {
      const res = gateway.handlePing();
      expect(res.pong).toBe(true);
      expect(typeof res.timestamp).toBe('number');
    });

    it('olay güncellemesini serverEventId ve eventVersion ile yayınlamalı', () => {
      gateway.broadcastEventUpdate(RealtimeEventName.EVENT_STATUS_CHANGED, {
        id: 'event-1',
        version: 2,
      });

      expect(mockServer.to).toHaveBeenCalledWith(RealtimeRoom.EVENTS_GLOBAL);
      expect(mockServer.emit).toHaveBeenCalledWith(
        RealtimeEventName.EVENT_STATUS_CHANGED,
        expect.objectContaining({
          eventId: 'event-1',
          eventVersion: 2,
          serverEventId: expect.any(String),
          eventName: RealtimeEventName.EVENT_STATUS_CHANGED,
        }),
      );
    });
  });
});
