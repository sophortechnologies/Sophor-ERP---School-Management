// src/modules/notification/notification.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
@Injectable()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private connectedClients: Map<number, string[]> = new Map(); // userId -> socketIds[]

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        this.logger.warn('Client connected without token');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store client connection
      if (!this.connectedClients.has(userId)) {
        this.connectedClients.set(userId, []);
      }
      this.connectedClients.get(userId).push(client.id);

      client.data.userId = userId;
      this.logger.log(`User ${userId} connected with socket ${client.id}`);

      // Send unread count on connection
      await this.sendUnreadCount(userId, client.id);
    } catch (error:any) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId && this.connectedClients.has(userId)) {
      const sockets = this.connectedClients.get(userId).filter(id => id !== client.id);
      if (sockets.length === 0) {
        this.connectedClients.delete(userId);
      } else {
        this.connectedClients.set(userId, sockets);
      }
    }
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: number },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    await this.prisma.notification.update({
      where: { id: data.notificationId, userId },
      data: { status: 'READ' },
    });

    await this.sendUnreadCount(userId);
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    await this.prisma.notification.updateMany({
      where: { userId, status: 'UNREAD' },
      data: { status: 'READ' },
    });

    await this.sendUnreadCount(userId);
  }

  @SubscribeMessage('getNotifications')
  async handleGetNotifications(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    client.emit('notifications', notifications);
  }

  // Emit notification to specific user
  emitToUser(userId: number, notification: any) {
    const socketIds = this.connectedClients.get(userId);
    if (socketIds && socketIds.length > 0) {
      socketIds.forEach(socketId => {
        this.server.to(socketId).emit('newNotification', notification);
      });
    }
    this.sendUnreadCount(userId);
  }

  // Emit to all connected admins
  emitToAdmins(event: string, data: any) {
    // This would require role mapping - simplified version
    this.server.emit(event, data);
  }

  private async sendUnreadCount(userId: number, targetSocketId?: string) {
    const count = await this.prisma.notification.count({
      where: { userId, status: 'UNREAD' },
    });

    const eventData = { unreadCount: count };

    if (targetSocketId) {
      this.server.to(targetSocketId).emit('unreadCount', eventData);
    } else {
      const socketIds = this.connectedClients.get(userId);
      if (socketIds) {
        socketIds.forEach(socketId => {
          this.server.to(socketId).emit('unreadCount', eventData);
        });
      }
    }
  }
}