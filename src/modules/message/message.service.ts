import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.services';

@Injectable()
export class MessageService {
    constructor(
        private readonly prisma: PrismaService,

    ) { }
    async saveMessage(parsedMessage:any, client: Socket) {
        console.log(`Saving message to DB: ${parsedMessage}`);

        const messageData = await this.prisma.message.create({
            data: {
                isGroup: true,
                message: parsedMessage.payload.message,
                sender_id: client.data?.user?.id,
            }
        })

        console.log(messageData);
        // Here you'd actually save to a DB
    }
}
