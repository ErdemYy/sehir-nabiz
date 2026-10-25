import {
  IsUUID,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventSeverity } from '@sehir-nabiz/shared';

export class CreateEventDto {
  @IsUUID('4', { message: 'Geçerli bir kategori seçilmelidir' })
  categoryId!: string;

  @IsString({ message: 'Başlık metin formatında olmalıdır' })
  @MinLength(5, { message: 'Başlık en az 5 karakter olmalıdır' })
  @MaxLength(150, { message: 'Başlık en fazla 150 karakter olabilir' })
  title!: string;

  @IsString({ message: 'Açıklama metin formatında olmalıdır' })
  @MinLength(10, { message: 'Açıklama en az 10 karakter olmalıdır' })
  @MaxLength(2000, { message: 'Açıklama en fazla 2000 karakter olabilir' })
  description!: string;

  @IsEnum(EventSeverity, { message: 'Geçersiz önem derecesi' })
  @IsOptional()
  severity: EventSeverity = EventSeverity.MEDIUM;

  @Type(() => Number)
  @IsNumber({}, { message: 'Enlem sayısal olmalıdır' })
  @Min(-90, { message: 'Enlem -90 ile 90 arasında olmalıdır' })
  @Max(90, { message: 'Enlem -90 ile 90 arasında olmalıdır' })
  latitude!: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Boylam sayısal olmalıdır' })
  @Min(-180, { message: 'Boylam -180 ile 180 arasında olmalıdır' })
  @Max(180, { message: 'Boylam -180 ile 180 arasında olmalıdır' })
  longitude!: number;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  addressText?: string;

  @IsString()
  @MaxLength(60)
  @IsOptional()
  city?: string;

  @IsString()
  @MaxLength(60)
  @IsOptional()
  district?: string;
}
