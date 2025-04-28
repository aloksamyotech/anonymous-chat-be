import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthMiddleware } from 'src/auth/ws-auth.middleware';
import { MessageService } from 'src/modules/message/message.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, string>();

  constructor(private readonly messagesService: MessageService, private jwtService: JwtService) { }

  afterInit(server: Server) {
    server.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      console.log(`token`, token);

      if (!token || typeof token !== 'string') {
        return next(new Error('Unauthorized: No token provided'));
      }

      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });

        console.log("payload===>", payload);
        socket.data.user = payload;
        next();
      } catch (err) {
        console.error('JWT error:', err);
        next(new Error('Unauthorized: Invalid token'));
      }
    });
  }

  async handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    console.log("cl-----------", client.data.user);
    const user = client.data.user;
    if (user && user.id) {
      this.onlineUsers.set(user.id, client.id);
      console.log(`User ${user.id} connected with socket ${client.id}`);

      const pendingMessages = await this.messagesService.getOfflineMessagesForUser(user.id);

      if (pendingMessages.length > 0) {

        pendingMessages.forEach((message) => {
          client.emit('privateMessage', {
            from: message.sender_id,
            message: message.message,
          });
        });
      }

      this.messagesService.markMessagesAsDelivered(user.id)

    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const userId = [...this.onlineUsers.entries()].find(([, socketId]) => socketId === client.id)?.[0];
    if (userId) {
      this.onlineUsers.delete(userId); // Clean up the user from the map
      console.log(`User ${userId} disconnected`);
    }
  }


  @SubscribeMessage('message')
  async handleMessage(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    console.log(`Received message: ${message}`);
    console.log("cl-----------", client.data.user);
    console.log("message->", message);
    console.log("message->", message.type);
    console.log("message->", message.payload.message);


    // const parsedMessage = JSON.parse(message);
    const parsedMessage = message;
    const sender = client.data.user;

    if (parsedMessage.type == "group-chat") {
      await this.messagesService.saveMessage(parsedMessage, client);
      this.server.emit('groupMessage', `Server received: ${parsedMessage.payload.message}`);
    }

    if (parsedMessage.type === 'private-chat') {
      const recipientId = parsedMessage.payload.recipientId;
      const recipientSocketId = this.onlineUsers.get(recipientId);


      if (recipientSocketId) {
        await this.messagesService.saveMessage(parsedMessage, client);
        this.server.to(recipientSocketId).emit('privateMessage', {
          from: sender.id,
          message: parsedMessage.payload.message,
        })
      } else {
        await this.messagesService.saveOfflineMessage(parsedMessage, sender.id, recipientId);
        console.log(`User ${recipientId} is not online`);
      }
    }


    // client.emit('messageResponse', `Acknowledged: ${parsedMessage.payload.message}`);
  }
}
