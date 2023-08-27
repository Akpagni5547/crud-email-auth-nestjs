import { Controller, Post, Body, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { ResetPasswordConfirmationDto } from './dto/reset-password-confirmation.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  signin(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('reset-password-confirmation')
  resetPasswordConfirmation(
    @Body() resetPasswordConfirmationDto: ResetPasswordConfirmationDto,
  ) {
    return this.authService.resetPasswordConfirmation(
      resetPasswordConfirmationDto,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('delete')
  deleteAccount(
    @Req() request: Request,
    @Body() deleteAccountDto: DeleteAccountDto,
  ) {
    const userId = request.user['id'];
    return this.authService.deleteAccount(userId, deleteAccountDto);
  }
}
