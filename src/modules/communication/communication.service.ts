import { Injectable, ForbiddenException,NotFoundException } from '@nestjs/common';
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
  async getInbox(
  userId: number,
  page = 1,
  pageSize = 20,
  status?: string,
) {
  const skip = (page - 1) * pageSize;
  const take = Math.min(pageSize, 50);

  const where: any = {
    OR: [{ receiverId: userId }, { receiverId: null }],
  };

  if (status) {
    where.status = status;
  }

  const [data, count] = await Promise.all([
    this.prisma.chatMessage.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
        attachments: true,
      },
    }),
    this.prisma.chatMessage.count({ where }),
  ]);

  const totalPages = Math.ceil(count / take);

  return {
    count,
    total_pages: totalPages,
    current_page: page,
    page_size: take,
    data,
  };
}

async getUnreadCount(userId: number) {
  const count = await this.prisma.chatMessage.count({
    where: {
      receiverId: userId,
      status: 'SENT',
    },
  });
  return { unreadCount: count };
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

  async deleteMessage(messageId: number, userId: number, userRole: string) {
  const message = await this.prisma.chatMessage.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new NotFoundException('Message not found');
  }

  // Only sender, receiver, or admin can delete
  if (
    message.senderId !== userId &&
    message.receiverId !== userId &&
    !['SUPER_ADMIN', 'ADMIN'].includes(userRole)
  ) {
    throw new ForbiddenException('You cannot delete this message');
  }

  await this.prisma.chatMessage.delete({
    where: { id: messageId },
  });

  return { message: 'Message deleted successfully' };
}
}
