import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.services';

@Injectable()
export class MessageService {
    constructor(
        private readonly prisma: PrismaService,

    ) { }
    async saveMessage(parsedMessage: any, client: Socket) {
        console.log(`Saving message to DB: ${parsedMessage}`);

        if (parsedMessage.type == "group-chat") {
            const messageData = await this.prisma.message.create({
                data: {
                    isGroup: true,
                    message: parsedMessage.payload.message,
                    sender_id: client.data?.user?.id,
                    status: 'DELIVERED'
                }
            })
            console.log(messageData);
        } else if (parsedMessage.type === 'private-chat') {
            const messageData = await this.prisma.message.create({
                data: {
                    isGroup: false,
                    message: parsedMessage.payload.message,
                    sender_id: client.data?.user?.id,
                    receiver_id: parsedMessage.payload.recipientId,
                    status: 'DELIVERED'
                }
            })
            console.log(messageData);
        } else {
            console.log("Invalid message type");
        }
    }

    async saveOfflineMessage(parsedMessage: any, senderId: number, recipientId: number) {
        const message = await this.prisma.message.create({
            data: {
                isGroup: false,
                message: parsedMessage.payload.message,
                status: 'PENDING',
                sender_id: senderId,
                receiver_id: recipientId
            }
        })

        console.log("message offline==>", message);
    }

    async getOfflineMessagesForUser(userId: number) {
        const messages =  await this.prisma.message.findMany({
            where: {
                receiver_id: userId,
                status: 'PENDING'
            }
        })

        return messages;
    }

    async markMessagesAsDelivered(userId: number) {
        await this.prisma.message.updateMany({
            where: {
                receiver_id: userId,
                status: 'PENDING'
            },
            data: {
                status: 'DELIVERED'
            }
        })
    }
}
