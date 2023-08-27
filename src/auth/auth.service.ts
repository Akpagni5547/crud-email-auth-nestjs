import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { MailerService } from 'src/mailer/mailer.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordConfirmationDto } from './dto/reset-password-confirmation.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  async resetPasswordConfirmation(
    resetPasswordConfirmationDto: ResetPasswordConfirmationDto,
  ) {
    const { email, code, password } = resetPasswordConfirmationDto;
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    // Envoyer un message comme quoi l'user a bien été send meme si l'email n'est pas correct
    if (!user) throw new UnauthorizedException('User not found');
    const match = speakeasy.totp.verify({
      secret: email,
      token: code,
      digits: 5,
      step: 60 * 2,
      encoding: 'base32',
    });
    if (!match) throw new UnauthorizedException('Invalid/Expired code');
    const hash = await bcrypt.hash(password, 10);
    await this.prismaService.user.update({
      where: { email },
      data: { password: hash },
    });
    return { data: 'Password updated successfully' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email } = resetPasswordDto;
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    // Envoyer un message comme quoi l'user a bien été send meme si l'email n'est pas correct
    if (!user) throw new UnauthorizedException('User not found');
    const code = speakeasy.totp({
      secret: email,
      digits: 5,
      step: 60 * 2,
      encoding: 'base32',
    });
    const url = 'http://localhost:3000/auth/reset-password-confirmation';
    await this.mailService.sendResetPassword(email, url, code);
    return { data: 'Reset assword mail has been sent successfully' };
  }
  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user)
      throw new UnauthorizedException(
        "L'utilisateur ou le mot de passe est invalide",
      );
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      throw new UnauthorizedException(
        "L'utilisateur ou le mot de passe est invalide",
      );
    const payload = {
      sub: user.id,
      email: user.email,
    };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('SECRET_KEY'),
    });
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }
  async signUp(signUpDto: SignUpDto) {
    try {
      const { email, password, username } = signUpDto;
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });
      if (user) throw new BadRequestException('Cet email existe deja');
      const hash = await bcrypt.hash(password, 10);
      await this.prismaService.user.create({
        data: { email, username, password: hash },
      });
      await this.mailService.sendSignupConfirmation(email);
      return { data: "L'utilisateur a été bien créé" };
    } catch (error) {
      console.log(error);
      return { error: error.messages };
    }
  }

  async deleteAccount(userId: number, deleteAccountDto: DeleteAccountDto) {
    const { password } = deleteAccountDto;
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user)
      throw new UnauthorizedException(
        "L'utilisateur ou le mot de passe est invalide",
      );
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      throw new UnauthorizedException(
        "L'utilisateur ou le mot de passe est invalide",
      );
    await this.prismaService.user.delete({ where: { id: userId } });
    return { data: 'User successfully deleted' };
  }
}
