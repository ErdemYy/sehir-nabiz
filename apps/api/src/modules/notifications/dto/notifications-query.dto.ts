import { IsOptional, IsString, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class NotificationsQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : 20))
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  unreadOnly: boolean = false;
}
