import { IsBoolean, IsOptional } from 'class-validator';
import { NotificationPreferencesDto } from '@sehir-nabiz/shared';

export class UpdateNotificationPreferencesDto
  implements Partial<NotificationPreferencesDto>
{
  @IsOptional()
  @IsBoolean()
  followedEvents?: boolean;

  @IsOptional()
  @IsBoolean()
  confirmedEvents?: boolean;

  @IsOptional()
  @IsBoolean()
  reportedEvents?: boolean;

  @IsOptional()
  @IsBoolean()
  nearbyEvents?: boolean;

  @IsOptional()
  @IsBoolean()
  systemNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;
}
