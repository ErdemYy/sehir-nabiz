import { RefreshTokenInput } from '@sehir-nabiz/shared';

export class RefreshTokenDto implements RefreshTokenInput {
  refreshToken!: string;
}
