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



  constructor(private readonly messagesService: MessageService, private jwtService: JwtService) { }

  afterInit(server: Server) {
    server.use((socket: Socket, next) => {
      const token = socket.handshake.headers?.token;

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

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);

  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }


  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
    console.log(`Received message: ${message}`);
    console.log("cl-----------", client.data.user);
    console.log("message->", message);
    console.log("message->", message.type);
    console.log("message->",message.payload.message);
    
    
    // const parsedMessage = JSON.parse(message);
    const parsedMessage = message;

    if (parsedMessage.type == "group-chat") {
      this.messagesService.saveMessage(parsedMessage, client);
      this.server.emit('groupMessage', `Server received: ${parsedMessage.payload.message}`);
    }
    
    
    // client.emit('messageResponse', `Acknowledged: ${parsedMessage.payload.message}`);
  }
}
