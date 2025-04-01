import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // This method is triggered when a client connects to the WebSocket server
  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  // This method is triggered when a client disconnects from the WebSocket server
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // This method is triggered when a specific message is received from a client
  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): string {
    console.log(`Received message: ${message}`);
    return 'Hello from server!';
  }
}
