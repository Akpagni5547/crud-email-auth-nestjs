import { OmitType } from '@nestjs/mapped-types';
import { SignUpDto } from './sign-up.dto';

export class ResetPasswordDto extends OmitType(SignUpDto, [
  'username',
  'password',
] as const) {}
