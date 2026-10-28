import { SetMetadata } from '@nestjs/common';

export const ALLOW_PENDING_DELETION_KEY = 'allowPendingDeletion';

/**
 * PENDING_DELETION (silinme bekleme sürecindeki) kullanıcıların
 * silme durumunu sorgulamasına ve iptal etmesine izin veren deklaratif yetki belirteci.
 */
export const AllowPendingDeletion = () => SetMetadata(ALLOW_PENDING_DELETION_KEY, true);
