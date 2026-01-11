// import { Injectable, Logger } from '@nestjs/common';
// import { PrismaService } from 'src/database/prisma.service';
// import { CreateNotificationDto } from './dto/create-notification.dto';
// import { NotificationQueryDto } from './dto/notification-query.dto';
// import { NotificationGateway } from './notification.gateway';
// import * as nodemailer from 'nodemailer';
// import { Transporter } from 'nodemailer';

// @Injectable()
// export class NotificationService {
//   private readonly logger = new Logger(NotificationService.name);
//   private readonly transporter: Transporter | null;

//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly gateway: NotificationGateway,
//   ) {
//     if (
//       process.env.SMTP_HOST &&
//       process.env.SMTP_PORT &&
//       process.env.SMTP_USER &&
//       process.env.SMTP_PASS
//     ) {
//       this.transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,
//         port: Number(process.env.SMTP_PORT),
//         secure: Number(process.env.SMTP_PORT) === 465,
//         auth: {
//           user: process.env.SMTP_USER,
//           pass: process.env.SMTP_PASS,
//         },
//       });

//       this.logger.log('Nodemailer transporter initialized');
//     } else {
//       this.transporter = null;
//       this.logger.warn(
//         'SMTP config not found. Email notifications are disabled.',
//       );
//     }
//   }

//   /**
//    * Create notification
//    */
//   async create(dto: CreateNotificationDto) {
//     const notification = await this.prisma.notification.create({
//       data: {
//         userId: dto.userId,
//         studentId: dto.studentId ?? null,
//         type: dto.type,
//         title: dto.title,
//         message: dto.message,
//         status: 'UNREAD',
//       },
//     });

//     // 🔔 WebSocket push
//     try {
//       this.gateway.emitToUser(dto.userId, notification);
//     } catch (error) {
//       this.logger.error('WebSocket emit failed', error);
//     }

//     // 📧 Optional email
//     if (dto.sendEmail && dto.email) {
//       await this.sendEmail(dto.email, dto.title, dto.message);
//     }

//     return notification;
//   }

//   /**
//    * Get user notifications (STANDARD PAGINATION RESPONSE)
//    */
//   async findByUser(userId: number, query: NotificationQueryDto) {
//     const currentPage = Number(query.page) || 1;
//     const pageSize = Number(query.page_size) || 10;
//     const skip = (currentPage - 1) * pageSize;

//     const where = {
//       userId,
//       ...(query.status && { status: query.status }),
//     };

//     const [count, data] = await this.prisma.$transaction([
//       this.prisma.notification.count({ where }),
//       this.prisma.notification.findMany({
//         where,
//         orderBy: { createdAt: 'desc' },
//         skip,
//         take: pageSize,
//       }),
//     ]);

//     const totalPages = Math.ceil(count / pageSize);
//     const baseUrl = 'http://localhost:5000/notifications';

//     return {
//       count,
//       total_pages: totalPages,
//       current_page: currentPage,
//       next:
//         currentPage < totalPages
//           ? `${baseUrl}?page=${currentPage + 1}&page_size=${pageSize}`
//           : null,
//       previous:
//         currentPage > 1
//           ? `${baseUrl}?page=${currentPage - 1}&page_size=${pageSize}`
//           : null,
//       page_size: pageSize,
//       data,
//     };
//   }

//   /**
//    * Mark single notification as read
//    */
//   async markAsRead(id: number) {
//     return this.prisma.notification.update({
//       where: { id },
//       data: { status: 'READ' },
//     });
//   }

//   /**
//    * Mark all notifications as read for user
//    */
//   async markAllAsRead(userId: number) {
//     return this.prisma.notification.updateMany({
//       where: { userId, status: 'UNREAD' },
//       data: { status: 'READ' },
//     });
//   }

//   /**
//    * Send email notification
//    */
//   private async sendEmail(to: string, subject: string, message: string) {
//     if (!this.transporter) return;

//     try {
//       await this.transporter.sendMail({
//         from:
//           process.env.SMTP_FROM ||
//           `"School ERP" <${process.env.SMTP_USER}>`,
//         to,
//         subject,
//         text: message,
//       });

//       this.logger.log(`Email sent to ${to}`);
//     } catch (error) {
//       this.logger.error('Failed to send email', error);
//     }
//   }
// }


import {
  Injectable,
  Logger,
  BadRequestException,
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

  /* ========================= CREATE ========================= */
  async create(dto: CreateNotificationDto) {
    // 🔒 Validate target user
    const userExists = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true, email: true },
    });

    if (!userExists) {
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

    // 🔔 WebSocket push (non-blocking)
    try {
      this.gateway.emitToUser(dto.userId, notification);
    } catch (error) {
      this.logger.error('WebSocket emit failed', error);
    }

    // 📧 Optional Email
    if (dto.sendEmail && dto.email && this.transporter) {
      await this.sendEmail(dto.email, dto.title, dto.message);
    }

    return notification;
  }

  /* ========================= GET USER NOTIFICATIONS ========================= */
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
      next:
        page < totalPages
          ? `/notifications?page=${page + 1}&page_size=${pageSize}`
          : null,
      previous:
        page > 1
          ? `/notifications?page=${page - 1}&page_size=${pageSize}`
          : null,
      page_size: pageSize,
      data,
    };
  }

  /* ========================= MARK ONE AS READ ========================= */
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

  /* ========================= MARK ALL AS READ ========================= */
  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, status: 'UNREAD' },
      data: { status: 'READ' },
    });
  }

  /* ========================= EMAIL ========================= */
  private async sendEmail(to: string, subject: string, message: string) {
    try {
      await this.transporter?.sendMail({
        from:
          process.env.SMTP_FROM ||
          `"School ERP" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text: message,
      });

      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error('Failed to send email', error);
    }
  }
}
