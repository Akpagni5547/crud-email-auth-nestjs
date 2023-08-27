import { OmitType } from '@nestjs/mapped-types';
import { SignInDto } from './sign-in.dto';

export class DeleteAccountDto extends OmitType(SignInDto, ['email'] as const) {}
