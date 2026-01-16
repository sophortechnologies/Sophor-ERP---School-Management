import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/notification.types';

@Injectable()
export class CommunicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  // FR8.8 – role restriction handled via guards (controller level)
  async sendMessage(
    dto: CreateMessageDto,
    attachments?: CreateAttachmentDto[],
  ) {
    const message = await this.prisma.chatMessage.create({
      data: {
        senderId: dto.senderId,
        receiverId: dto.receiverId ?? null,
        message: dto.message,
        messageType: dto.messageType,
        attachments: attachments
          ? { create: attachments }
          : undefined,
      },
      include: { attachments: true },
    });

    // 🔔 Notify receiver (skip announcements/broadcasts)
    if (dto.receiverId) {
      await this.notificationService.create({
        userId: dto.receiverId,
        type: NotificationType.MESSAGE,
        title: 'New Message',
        message: dto.message,
        sendEmail: true,
      });
    }

    return message;
  }
async getInbox(userId: number) {
  return this.prisma.chatMessage.findMany({
    where: {
      OR: [{ receiverId: userId }, { receiverId: null }],
    },
    orderBy: { createdAt: 'desc' },
    include: { sender: true, attachments: true },
  });
}

async getConversation(userId: number, otherUserId: number) {
  return this.prisma.chatMessage.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });
}


  async markAsRead(messageId: number, userId: number) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message || message.receiverId !== userId) {
      throw new ForbiddenException('Not allowed to mark this message as read');
    }

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { status: 'READ' },
    });
  }
}
