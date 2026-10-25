import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { LoginInput } from '@sehir-nabiz/shared';

export class LoginDto implements LoginInput {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @IsNotEmpty({ message: 'E-posta adresi boş bırakılamaz' })
  email!: string;

  @IsString({ message: 'Şifre metin formatında olmalıdır' })
  @IsNotEmpty({ message: 'Şifre boş bırakılamaz' })
  password!: string;
}
