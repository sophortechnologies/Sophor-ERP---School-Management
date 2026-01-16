import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationGateway } from './notification.gateway';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly transporter: Transporter | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
  ) {
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      this.logger.log('Nodemailer transporter initialized');
    } else {
      this.transporter = null;
      this.logger.warn(
        'SMTP config not found. Email notifications are disabled.',
      );
    }
  }

  /* =========================
     CREATE NOTIFICATION
     ========================= */
  async create(dto: CreateNotificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new BadRequestException('Target user does not exist');
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        studentId: dto.studentId ?? null,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        status: 'UNREAD',
      },
    });

    //  WebSocket (non-blocking)
    try {
      this.gateway.emitToUser(dto.userId, notification);
    } catch (error) {
      this.logger.error('WebSocket emit failed', error);
    }

    // 📧 Email (fire-and-forget)
    if (dto.sendEmail && user.email && this.transporter) {
      this.sendEmail(user.email, dto.title, dto.message).catch((err) =>
        this.logger.error('Email send failed', err),
      );
    }

    return notification;
  }

  /* =========================
     GET USER NOTIFICATIONS
     ========================= */
  async findByUser(userId: number, query: NotificationQueryDto) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.page_size) || 10;
    const skip = (page - 1) * pageSize;

    const where = {
      userId,
      ...(query.status && { status: query.status }),
    };

    const [count, data] = await this.prisma.$transaction([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.ceil(count / pageSize);

    return {
      count,
      total_pages: totalPages,
      current_page: page,
      page_size: pageSize,
      next:
        page < totalPages
          ? `/notifications?page=${page + 1}&page_size=${pageSize}`
          : null,
      previous:
        page > 1
          ? `/notifications?page=${page - 1}&page_size=${pageSize}`
          : null,
      data,
    };
  }

  /* =========================
     MARK AS READ
     ========================= */
  async markAsRead(notificationId: number, userId: number) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        status: 'UNREAD',
      },
      data: { status: 'READ' },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, status: 'UNREAD' },
      data: { status: 'READ' },
    });
  }

  /* =========================
     EMAIL
     ========================= */
  private async sendEmail(
    to: string,
    subject: string,
    message: string,
  ) {
    if (!this.transporter) return;

    await this.transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        `"School ERP" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: message,
      html: `<p>${message}</p>`,
    });

    this.logger.log(`Email sent to ${to}`);
  }

  async notifyStudent(studentId: number, dto: CreateNotificationDto) {
  const student = await this.prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true },
  });

  if (!student || !student.user) {
    throw new BadRequestException('Student user not found');
  }

  const notification = await this.prisma.notification.create({
    data: {
      userId: student.userId, // ✅ REAL RECEIVER
      studentId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      status: 'UNREAD',
    },
  });

  // WebSocket
  this.gateway.emitToUser(student.userId, notification);

  // Email
  if (dto.sendEmail && student.user.email && this.transporter) {
    this.sendEmail(
      student.user.email,
      dto.title,
      dto.message,
    ).catch(err =>
      this.logger.error('Email send failed', err),
    );
  }

  return notification;
}



  async delete(notificationId: number, userId: number) {
    const notification =
      await this.prisma.notification.findUnique({
        where: { id: notificationId },
      });

    if (!notification) {
      throw new NotFoundException(
        'Notification not found',
      );
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this notification',
      );
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return {
      message: 'Notification deleted successfully',
    };
  }
}
