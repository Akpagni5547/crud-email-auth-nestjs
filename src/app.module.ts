import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from './mailer/mailer.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategy.service';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule,
    JwtModule.register({
      global: true,
      // secret: jwtConstants.secret,
      signOptions: { expiresIn: '2h' },
    }),
    PostModule,
    CommentModule,
  ],
  providers: [PrismaService, JwtStrategy],
})
export class AppModule {}
