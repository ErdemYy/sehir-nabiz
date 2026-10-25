import { LoginInput } from '@sehir-nabiz/shared';

export class LoginDto implements LoginInput {
  email!: string;
  password!: string;
}
