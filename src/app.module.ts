import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/response.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { MailerModule } from './mailer/mailer.module';
import { EventsGateway } from './events/events.gateway';
import { MessageModule } from './modules/message/message.module';
@Module({
  imports: [PrismaModule, UserModule, MailerModule, MessageModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_INTERCEPTOR,
    useClass: ResponseInterceptor,
  }, EventsGateway,],
})
export class AppModule {}
