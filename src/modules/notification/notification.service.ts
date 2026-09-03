// src/modules/notification/notification.service.ts

import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationGateway } from './notification.gateway';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { NotificationType } from './notification.types'; 

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
      this.logger.warn('SMTP config not found. Email notifications are disabled.');
    }
  }

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

    // ✅ WebSocket real-time notification
    try {
      this.gateway.emitToUser(dto.userId, notification);
      this.logger.log(`WebSocket notification sent to user ${dto.userId}`);
    } catch (error) {
      this.logger.error('WebSocket emit failed', error);
    }

    // ✅ Email notification (fire-and-forget)
    if (dto.sendEmail && user.email && this.transporter) {
      this.sendEmail(user.email, dto.title, dto.message).catch((err) =>
        this.logger.error('Email send failed', err),
      );
    }

    return notification;
  }

  async createBulk(notifications: CreateNotificationDto[]) {
    const results = { success: [], failed: [] };

    for (const dto of notifications) {
      try {
        const notification = await this.create(dto);
        results.success.push(notification);
      } catch (error:any) {
        results.failed.push({ dto, error: error.message });
      }
    }

    return results;
  }

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
      next: page < totalPages ? `/notifications?page=${page + 1}&page_size=${pageSize}` : null,
      previous: page > 1 ? `/notifications?page=${page - 1}&page_size=${pageSize}` : null,
      data,
    };
  }

  async markAsRead(notificationId: number, userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { id: notificationId, userId, status: 'UNREAD' },
      data: { status: 'READ' },
    });

    // Send updated unread count
    const unreadCount = await this.prisma.notification.count({
      where: { userId, status: 'UNREAD' },
    });
    this.gateway.emitToUser(userId, { type: 'UNREAD_COUNT_UPDATE', unreadCount });

    return result;
  }

  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, status: 'UNREAD' },
      data: { status: 'READ' },
    });

    this.gateway.emitToUser(userId, { type: 'UNREAD_COUNT_UPDATE', unreadCount: 0 });

    return result;
  }

  async delete(notificationId: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this notification');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: 'Notification deleted successfully' };
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: { userId, status: 'UNREAD' },
    });
    return { unreadCount: count };
  }

  private async sendEmail(to: string, subject: string, message: string) {
    if (!this.transporter) return;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || `"School ERP" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>${subject}</h2>
              <p>${message}</p>
              <hr>
              <small>School Management System</small>
             </div>`,
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

  return this.create({
    userId: student.userId,
    studentId,
    type: dto.type,
    title: dto.title,
    message: dto.message,
    sendEmail: dto.sendEmail,
  });
}
  // Specialized notification methods
  async notifyAttendance(studentId: number, status: string, date: Date) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) return;

    const message = status === 'ABSENT' 
      ? `Your child was marked ABSENT on ${date.toLocaleDateString()}`
      : `Attendance marked as ${status} for ${date.toLocaleDateString()}`;

    await this.create({
      userId: student.userId,
      studentId,
      type: NotificationType.ATTENDANCE,
      title: status === 'ABSENT' ? 'Absence Alert' : 'Attendance Update',
      message,
      sendEmail: status === 'ABSENT',
    });
  }

  async notifyPayment(studentId: number, amount: number, billId: number, isFullyPaid: boolean) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) return;

    const message = isFullyPaid
      ? `Your payment of ${amount} has been received. Your bill is now fully paid.`
      : `Your payment of ${amount} has been received.`;

    await this.create({
      userId: student.userId,
      studentId,
      type: NotificationType.FEE,
      title: 'Payment Confirmation',
      message,
      sendEmail: true,
    });
  }

  async notifyExamPublished(examId: number, classId: number) {
    const students = await this.prisma.student.findMany({
      where: { classId, status: 'ACTIVE' },
      include: { user: true },
    });

    for (const student of students) {
      await this.create({
        userId: student.userId,
        studentId: student.id,
        type: NotificationType.EXAM,
        title: 'Exam Results Published',
        message: 'Your exam results have been published. Check your report card.',
        sendEmail: false,
      });
    }
  }

  async notifyPayrollGenerated(staffId: number, month: string, amount: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: { user: true },
    });

    if (!staff) return;

    await this.create({
      userId: staff.userId,
      type: NotificationType.PAYROLL,
      title: 'Payroll Generated',
      message: `Your payroll for ${month} has been generated. Amount: ${amount}`,
      sendEmail: true,
    });
  }

  async notifyLeaveApproved(userId: number, leaveType: string, startDate: Date, endDate: Date) {
    await this.create({
      userId,
      type: NotificationType.LEAVE,
      title: 'Leave Request Approved',
      message: `Your ${leaveType} leave request from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} has been approved.`,
      sendEmail: true,
    });
  }
}