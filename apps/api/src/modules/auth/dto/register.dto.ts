import { RegisterInput } from '@sehir-nabiz/shared';

export class RegisterDto implements RegisterInput {
  email!: string;
  password!: string;
  displayName!: string;
}
