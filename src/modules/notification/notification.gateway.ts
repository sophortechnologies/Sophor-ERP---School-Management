  import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: '*' },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.emit('error', 'UNAUTHORIZED');
        client.disconnect();
        return;
      }

      const payload: any = this.jwtService.verify(token);
      const userId = payload.sub;

      if (!userId) {
        client.emit('error', 'INVALID_TOKEN');
        client.disconnect();
        return;
      }

      client.join(`user_${userId}_notifications`);
      this.logger.log(`User ${userId} connected to notifications`);
    } catch (error) {
      this.logger.warn('WebSocket authentication failed');
      client.emit('error', 'AUTH_FAILED');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitToUser(userId: number, payload: any) {
    this.server
      .to(`user_${userId}_notifications`)
      .emit('notification', payload);
  }
}
