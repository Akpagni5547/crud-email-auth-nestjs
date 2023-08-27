import { OmitType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';
import { SignUpDto } from './sign-up.dto';

export class ResetPasswordConfirmationDto extends OmitType(SignUpDto, [
  'username',
] as const) {
  @IsNotEmpty()
  readonly code: string;
}
