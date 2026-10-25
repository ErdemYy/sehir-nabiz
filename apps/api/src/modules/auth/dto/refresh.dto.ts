import { IsNotEmpty, IsString } from 'class-validator';
import { RefreshTokenInput } from '@sehir-nabiz/shared';

export class RefreshTokenDto implements RefreshTokenInput {
  @IsString({ message: 'Refresh token metin formatında olmalıdır' })
  @IsNotEmpty({ message: 'Refresh token boş bırakılamaz' })
  refreshToken!: string;
}
