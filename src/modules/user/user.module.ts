import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CryptoModule } from 'src/common/crypto.module'; 
import {MailerModule} from 'src/mailer/mailer.module'
@Module({
    imports: [PrismaModule , CryptoModule, MailerModule],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
