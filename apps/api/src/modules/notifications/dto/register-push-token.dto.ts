import { IsNotEmpty, IsString, IsEnum, IsOptional, MaxLength, MinLength } from 'class-validator';
import { PushPlatform, RegisterPushTokenDto } from '@sehir-nabiz/shared';

export class RegisterPushTokenApiDto implements RegisterPushTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Push token boş olamaz' })
  @MinLength(10, { message: 'Push token çok kısa' })
  @MaxLength(255, { message: 'Push token çok uzun' })
  token!: string;

  @IsEnum(PushPlatform, {
    message: 'Geçersiz platform. İzin verilenler: ios, android, web',
  })
  platform!: PushPlatform;

  @IsOptional()
  @IsString()
  @MaxLength(128, { message: 'Cihaz kimliği en fazla 128 karakter olabilir' })
  deviceIdentifier?: string | null;
}
