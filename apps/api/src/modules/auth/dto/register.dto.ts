import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { RegisterInput } from '@sehir-nabiz/shared';

export class RegisterDto implements RegisterInput {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @IsNotEmpty({ message: 'E-posta adresi boş bırakılamaz' })
  email!: string;

  @IsString({ message: 'Şifre metin formatında olmalıdır' })
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  @MaxLength(100, { message: 'Şifre en fazla 100 karakter olabilir' })
  password!: string;

  @IsString({ message: 'Ad soyad metin formatında olmalıdır' })
  @MinLength(2, { message: 'Ad soyad en az 2 karakter olmalıdır' })
  @MaxLength(100, { message: 'Ad soyad en fazla 100 karakter olabilir' })
  displayName!: string;
}
