import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CryptoModule } from 'src/common/crypto.module';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [
    PrismaModule,
    CryptoModule,
    MailerModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
