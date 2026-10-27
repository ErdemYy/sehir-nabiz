import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
  AccountStatus,
  DeletionRequestStatus,
  DeletionClientSource,
  MediaStatus,
  type DeleteAccountInput,
  type WebDeleteAccountInput,
  type CancelDeletionInput,
  type AccountDeletionResponseDto,
  type AccountDeletionStatusDto,
} from '@sehir-nabiz/shared';
import {
  UserEntity,
  AccountDeletionRequestEntity,
  RefreshTokenEntity,
  DevicePushTokenEntity,
  UserNotificationEntity,
  UserNotificationPreferenceEntity,
  EventMediaEntity,
} from '../../database/entities';
import { StorageService } from '../storage/storage.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class AccountDeletionService {
  private readonly logger = new Logger(AccountDeletionService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(AccountDeletionRequestEntity)
    private readonly deletionRepo: Repository<AccountDeletionRequestEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly tokenRepo: Repository<RefreshTokenEntity>,
    @InjectRepository(EventMediaEntity)
    private readonly mediaRepo: Repository<EventMediaEntity>,
    private readonly storageService: StorageService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Mobil veya API Üzerinden Hesap Silme Talebi (DELETE /users/me)
   */
  async requestDeletion(
    userId: string,
    input: DeleteAccountInput,
    meta: {
      ip?: string;
      userAgent?: string;
      source?: DeletionClientSource;
    } = {},
  ): Promise<AccountDeletionResponseDto> {
    const user = await this.userRepo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('Kullanıcı hesabı bulunamadı.');
    }

    if (user.accountStatus === AccountStatus.DELETED) {
      throw new BadRequestException('Bu hesap zaten kalıcı olarak silinmiştir.');
    }

    // Parola doğrulaması (Zorunlu güvenlik kontrolü)
    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mevcut şifreniz doğrulanamadı.');
    }

    // Eşzamanlı istek kontrolü (Race condition / Concurrency guard)
    const activeProcessing = await this.deletionRepo.findOne({
      where: {
        userId,
        status: DeletionRequestStatus.PROCESSING,
      },
    });

    if (activeProcessing) {
      throw new ConflictException(
        'Hesap silme işlemi şu anda yürütülüyor. Lütfen bekleyiniz.',
      );
    }

    const clientSource = meta.source || DeletionClientSource.MOBILE_APP;
    const immediate = input.immediate === true;

    // Grace period: Eğer hemen silme istenmiyorsa 14 günlük askıya alma ve cayma süresi tanınır
    const scheduledFor = immediate
      ? new Date()
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const deletionRequest = this.deletionRepo.create({
      userId,
      status: immediate ? DeletionRequestStatus.PROCESSING : DeletionRequestStatus.PENDING,
      reason: input.reason?.trim() || 'Kullanıcı talebi',
      scheduledFor,
      clientSource,
      ipAddress: meta.ip || null,
      userAgent: meta.userAgent || null,
      attemptCount: immediate ? 1 : 0,
    });

    const savedRequest = await this.deletionRepo.save(deletionRequest);

    if (immediate) {
      // Anında silme ve anonimleştirme
      await this.executeDeletion(userId, savedRequest.id);

      return {
        success: true,
        message: 'Hesabınız ve tüm kişisel verileriniz başarıyla silindi ve anonimleştirildi.',
        requestId: savedRequest.id,
        status: DeletionRequestStatus.COMPLETED,
        scheduledFor: scheduledFor.toISOString(),
        completedAt: new Date().toISOString(),
        anonymizedDisplayName: 'Anonim Vatandaş',
      };
    } else {
      // 14 günlük bekleme moduna alma
      await this.userRepo.update(
        { id: userId },
        { accountStatus: AccountStatus.PENDING_DELETION },
      );

      // Oturumları sonlandır
      await this.tokenRepo.update(
        { userId, isRevoked: false },
        { isRevoked: true },
      );
      this.realtimeGateway.disconnectUser(userId);

      return {
        success: true,
        message:
          'Hesap silme talebiniz alındı. 14 gün içinde fikrinizi değiştirirseniz iptal edebilirsiniz.',
        requestId: savedRequest.id,
        status: DeletionRequestStatus.PENDING,
        scheduledFor: scheduledFor.toISOString(),
      };
    }
  }

  /**
   * Çekirdek Silme ve Anonimleştirme Yürütücüsü (Transactional & Retryable)
   */
  async executeDeletion(
    userId: string,
    requestId?: string,
  ): Promise<{ success: boolean; details: Record<string, any> }> {
    let lastError: string | null = null;
    const auditDetails: Record<string, any> = {
      startedAt: new Date().toISOString(),
    };

    try {
      // 1. Veritabanı Kişisel Veri Anonimleştirme ve Temizlik (Atomik Transaction)
      await this.dataSource.transaction(async manager => {
        // Satır kilidi ile kullanıcıyı çek
        const user = await manager
          .createQueryBuilder(UserEntity, 'u')
          .setLock('pessimistic_write')
          .where('u.id = :id', { id: userId })
          .getOne();

        if (!user || user.accountStatus === AccountStatus.DELETED) {
          return;
        }

        // PII Maskeleme (KVKK / GDPR / App Store Uyumlu)
        // Unique e-posta kısıtını korurken kullanıcının gerçek e-postasını tamamen yok et
        const anonymizedEmail = `deleted_${Date.now()}_${userId.substring(0, 8)}@deleted.sehirnabiz.local`;
        user.email = anonymizedEmail;
        user.displayName = 'Anonim Vatandaş';
        user.passwordHash = '*DELETED*';
        user.accountStatus = AccountStatus.DELETED;
        user.reputationScore = 0;
        await manager.save(user);

        // 2. Tüm aktif Refresh Token'ları iptal et
        const revokedTokens = await manager.update(
          RefreshTokenEntity,
          { userId, isRevoked: false },
          { isRevoked: true },
        );
        auditDetails.sessionsRevoked = revokedTokens.affected || 0;

        // 3. Push token'ları kalıcı olarak sil
        const deletedPush = await manager.delete(DevicePushTokenEntity, { userId });
        auditDetails.pushTokensDeleted = deletedPush.affected || 0;

        // 4. Kullanıcı içi bildirimleri temizle
        const deletedNotifications = await manager.delete(UserNotificationEntity, { userId });
        auditDetails.notificationsDeleted = deletedNotifications.affected || 0;

        // 5. Bildirim tercihlerini temizle
        await manager.delete(UserNotificationPreferenceEntity, { userId });
      });

      // 6. WebSocket Oturum İzolasyonu (Gerçek zamanlı bağlantıları sonlandır)
      const disconnectedSockets = this.realtimeGateway.disconnectUser(userId);
      auditDetails.socketsDisconnected = disconnectedSockets;

      // 7. Medya Temizliği (MinIO nesne silme ve hata toleransı)
      // Kullanıcının yüklediği onaylanmamış veya taslak medyaları temizle
      const userMedia = await this.mediaRepo.find({
        where: {
          uploadedById: userId,
          status: In([MediaStatus.PENDING_UPLOAD, MediaStatus.REJECTED]),
        },
      });

      let mediaDeletedCount = 0;
      let mediaFailedCount = 0;

      for (const media of userMedia) {
        try {
          await this.storageService.deleteObject(media.storageKey);
          await this.mediaRepo.update({ id: media.id }, { status: MediaStatus.DELETED });
          mediaDeletedCount++;
        } catch (storageErr) {
          mediaFailedCount++;
          const errMessage = (storageErr as Error).message;
          this.logger.warn(
            `MinIO nesne silme hatası (Key=${media.storageKey}): ${errMessage}`,
          );
          lastError = `MinIO silme hatası: ${errMessage}`;
        }
      }

      auditDetails.mediaDeleted = mediaDeletedCount;
      auditDetails.mediaFailed = mediaFailedCount;
      auditDetails.completedAt = new Date().toISOString();

      // 8. Silme Talep Kaydını Güncelle (Audit Trail)
      if (requestId) {
        const req = await this.deletionRepo.findOne({ where: { id: requestId } });
        if (req) {
          req.status = lastError ? DeletionRequestStatus.FAILED : DeletionRequestStatus.COMPLETED;
          req.completedAt = lastError ? null : new Date();
          req.lastError = lastError;
          req.details = auditDetails;
          await this.deletionRepo.save(req);
        }
      }

      this.logger.log(
        `[AccountDeletion] Kullanıcı verileri başarıyla anonimleştirildi: ${userId}`,
      );

      return {
        success: !lastError,
        details: auditDetails,
      };
    } catch (err) {
      const errorMsg = (err as Error).message;
      this.logger.error(`[AccountDeletion] Silme hatası (User: ${userId}): ${errorMsg}`);

      if (requestId) {
        await this.deletionRepo.update(
          { id: requestId },
          {
            status: DeletionRequestStatus.FAILED,
            lastError: errorMsg,
          },
        );
      }

      throw err;
    }
  }

  /**
   * Başarısız veya Süresi Dolan Silme İşlerini Yeniden Deneme (Retryable Worker)
   */
  async retryFailedDeletions(): Promise<{
    retried: number;
    succeeded: number;
    failed: number;
  }> {
    const candidates = await this.deletionRepo
      .createQueryBuilder('r')
      .where('r.status = :failedStatus', { failedStatus: DeletionRequestStatus.FAILED })
      .orWhere('(r.status = :pendingStatus AND r.scheduledFor <= :now)', {
        pendingStatus: DeletionRequestStatus.PENDING,
        now: new Date(),
      })
      .andWhere('r.attemptCount < :maxAttempts', { maxAttempts: 5 })
      .getMany();

    let succeeded = 0;
    let failed = 0;

    for (const req of candidates) {
      try {
        await this.deletionRepo.update(
          { id: req.id },
          {
            status: DeletionRequestStatus.PROCESSING,
            attemptCount: req.attemptCount + 1,
          },
        );

        const result = await this.executeDeletion(req.userId, req.id);
        if (result.success) {
          succeeded++;
        } else {
          failed++;
        }
      } catch (err) {
        failed++;
        this.logger.warn(`Silme tekrar deneme hatası (Req ID: ${req.id}): ${(err as Error).message}`);
      }
    }

    return {
      retried: candidates.length,
      succeeded,
      failed,
    };
  }

  /**
   * Silme Talebini İptal Etme (POST /users/me/cancel-deletion veya şifre ile)
   */
  async cancelDeletion(
    identifier: { userId?: string; email?: string },
    input: CancelDeletionInput,
  ): Promise<{ success: boolean; message: string }> {
    let user: UserEntity | null = null;

    if (identifier.userId) {
      user = await this.userRepo
        .createQueryBuilder('u')
        .addSelect('u.passwordHash')
        .where('u.id = :id', { id: identifier.userId })
        .getOne();
    } else if (identifier.email) {
      user = await this.userRepo
        .createQueryBuilder('u')
        .addSelect('u.passwordHash')
        .where('u.email = :email', { email: identifier.email.trim().toLowerCase() })
        .getOne();
    }

    if (!user) {
      throw new NotFoundException('Kullanıcı hesabı bulunamadı.');
    }

    // Parola doğrulaması
    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Şifre doğrulanamadı.');
    }

    if (user.accountStatus === AccountStatus.DELETED) {
      throw new BadRequestException('Bu hesap kalıcı olarak silinmiştir, geri alınamaz.');
    }

    if (user.accountStatus !== AccountStatus.PENDING_DELETION) {
      throw new BadRequestException('Bu hesap için aktif bir silme talebi bulunmamaktadır.');
    }

    // Kullanıcı durumunu yeniden aktif yap
    user.accountStatus = AccountStatus.ACTIVE;
    await this.userRepo.save(user);

    // Aktif talebi iptal olarak işaretle
    await this.deletionRepo.update(
      {
        userId: user.id,
        status: In([DeletionRequestStatus.PENDING, DeletionRequestStatus.PROCESSING]),
      },
      {
        status: DeletionRequestStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    );

    this.logger.log(`[AccountDeletion] Silme talebi iptal edildi: User=${user.id}`);

    return {
      success: true,
      message: 'Hesap silme talebiniz başarıyla iptal edildi. Hesabınız yeniden aktiftir.',
    };
  }

  /**
   * Hesap Silme Durumunu Getirme (GET /users/me/deletion-status)
   */
  async getDeletionStatus(userId: string): Promise<AccountDeletionStatusDto> {
    const latest = await this.deletionRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!latest) {
      return {
        hasPendingDeletion: false,
        canCancel: false,
      };
    }

    const isPending =
      latest.status === DeletionRequestStatus.PENDING ||
      latest.status === DeletionRequestStatus.PROCESSING;

    return {
      hasPendingDeletion: isPending,
      status: latest.status,
      requestId: latest.id,
      scheduledFor: latest.scheduledFor.toISOString(),
      createdAt: latest.createdAt.toISOString(),
      canCancel: isPending && latest.status === DeletionRequestStatus.PENDING,
    };
  }

  /**
   * Web Üzerinden Silme Talebi (POST /users/web-deletion-request)
   */
  async requestWebDeletion(
    input: WebDeleteAccountInput,
    meta: { ip?: string; userAgent?: string } = {},
  ): Promise<AccountDeletionResponseDto> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.userRepo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email: normalizedEmail })
      .getOne();

    if (!user) {
      // Güvenlik: Kullanıcı varlığı sızdırmaz
      throw new UnauthorizedException('Geçersiz e-posta veya şifre.');
    }

    return this.requestDeletion(
      user.id,
      {
        password: input.password,
        reason: input.reason,
        immediate: input.immediate,
      },
      {
        ...meta,
        source: DeletionClientSource.WEB_REQUEST,
      },
    );
  }

  /**
   * Web Hesap Silme Sayfası HTML İçeriği (Phase 14)
   */
  renderAccountDeletionHtml(): string {
    return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hesap ve Veri Silme Talebi — ŞehirNabız</title>
  <style>
    :root {
      --bg: #0F172A;
      --card: #1E293B;
      --border: #334155;
      --text: #F8FAFC;
      --text-muted: #94A3B8;
      --primary: #14B8A6;
      --primary-hover: #0D9488;
      --danger: #EF4444;
      --danger-hover: #DC2626;
      --radius: 16px;
      --radius-pill: 9999px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: var(--bg); color: var(--text); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background-color: var(--card); border: 1px solid var(--border); border-radius: var(--radius); max-width: 520px; width: 100%; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .header { text-align: center; margin-bottom: 24px; }
    .logo { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 16px; background-color: rgba(20, 184, 166, 0.15); color: var(--primary); font-size: 28px; margin-bottom: 12px; }
    h1 { font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
    p.subtitle { font-size: 14px; color: var(--text-muted); line-height: 1.5; }
    .info-box { background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 14px; margin-bottom: 20px; font-size: 13px; line-height: 1.5; color: #FCA5A5; }
    .info-box strong { color: #FECACA; display: block; margin-bottom: 4px; }
    .policy-box { background-color: rgba(20, 184, 166, 0.08); border: 1px solid rgba(20, 184, 166, 0.2); border-radius: 12px; padding: 14px; margin-bottom: 20px; font-size: 12px; line-height: 1.5; color: #99F6E4; }
    .policy-box strong { color: var(--primary); display: block; margin-bottom: 4px; }
    .form-group { margin-bottom: 16px; text-align: left; }
    label { display: block; font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
    input, textarea, select { width: 100%; padding: 12px 14px; background-color: var(--bg); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 14px; transition: border-color 0.2s; }
    input:focus, textarea:focus, select:focus { outline: none; border-color: var(--primary); }
    button { width: 100%; padding: 14px; background-color: var(--danger); color: #fff; border: none; border-radius: var(--radius-pill); font-size: 15px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; margin-top: 8px; }
    button:hover { background-color: var(--danger-hover); }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .status-msg { margin-top: 16px; padding: 12px; border-radius: 10px; font-size: 13px; text-align: center; display: none; }
    .status-success { background-color: rgba(16, 185, 129, 0.15); color: #6EE7B7; border: 1px solid rgba(16, 185, 129, 0.3); display: block; }
    .status-error { background-color: rgba(239, 68, 68, 0.15); color: #FCA5A5; border: 1px solid rgba(239, 68, 68, 0.3); display: block; }
    .footer { margin-top: 24px; text-align: center; font-size: 12px; color: var(--text-muted); }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">⚡</div>
      <h1>ŞehirNabız</h1>
      <p class="subtitle">Hesap ve Kişisel Veri Silme Talebi</p>
    </div>

    <div class="policy-box">
      <strong>Veri Yaşam Döngüsü ve Anonimleştirme:</strong>
      6698 Sayılı KVKK, Apple App Store ve Google Play yönergeleri uyarınca hesabınız silindiğinde; e-posta adresiniz, şifreniz, profil bilgileriniz, bildirim tercihleriniz ve tüm cihaz push belirteçleriniz kalıcı olarak imha edilir. Kamu yararı taşıyan kentsel olay bildirimleri kimliğinizden arındırılarak ("Anonim Vatandaş") şehir güvenliği için korunur.
    </div>

    <div class="info-box">
      <strong>Kalıcı İşlem Uyarısı:</strong>
      Bu işlem onaylandığında mevcut oturumlarınız anında sonlandırılacak ve geri alınamayacaktır.
    </div>

    <form id="deletionForm">
      <div class="form-group">
        <label for="email">Kayıtlı E-posta Adresi</label>
        <input type="email" id="email" required placeholder="ornek@domain.com" />
      </div>

      <div class="form-group">
        <label for="password">Hesap Şifresi</label>
        <input type="password" id="password" required placeholder="Mevcut şifreniz" />
      </div>

      <div class="form-group">
        <label for="reason">Silme Gerekçesi (İsteğe Bağlı)</label>
        <textarea id="reason" rows="2" placeholder="Uygulamayı neden silmek istiyorsunuz?"></textarea>
      </div>

      <div class="form-group">
        <label for="mode">İşlem Türü</label>
        <select id="mode">
          <option value="true">Hemen Kalıcı Olarak Sil ve Anonimleştir</option>
          <option value="false">14 Günlük Askıya Alma (Vazgeçme Süresi ile)</option>
        </select>
      </div>

      <button type="submit" id="submitBtn">Hesabımı ve Verilerimi Sil</button>
    </form>

    <div id="statusBox" class="status-msg"></div>

    <div class="footer">
      ŞehirNabız © 2026 — Güvenli ve Doğrulanabilir Kentsel Bilgi Ekosistemi
    </div>
  </div>

  <script>
    const form = document.getElementById('deletionForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusBox = document.getElementById('statusBox');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.innerText = 'İşlem yürütülüyor...';
      statusBox.className = 'status-msg';
      statusBox.style.display = 'none';

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const reason = document.getElementById('reason').value.trim();
      const immediate = document.getElementById('mode').value === 'true';

      try {
        const res = await fetch('/api/v1/users/web-deletion-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, reason, immediate })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          statusBox.className = 'status-msg status-success';
          statusBox.innerText = data.message || 'Silme talebiniz başarıyla işlendi.';
          form.reset();
        } else {
          statusBox.className = 'status-msg status-error';
          statusBox.innerText = data.message || 'Silme işlemi gerçekleştirilemedi. Bilgilerinizi kontrol ediniz.';
        }
      } catch (err) {
        statusBox.className = 'status-msg status-error';
        statusBox.innerText = 'Sunucuya bağlanırken bir hata oluştu: ' + err.message;
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Hesabımı ve Verilerimi Sil';
      }
    });
  </script>
</body>
</html>`;
  }
}
