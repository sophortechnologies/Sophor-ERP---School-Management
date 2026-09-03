import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/notification.types';

@Injectable()
export class CalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateCalendarEventDto, userId: number) {
    return this.prisma.calendarEvent.create({
      data: {
        title: dto.title,
        description: dto.description,
        eventDate: new Date(dto.eventDate),
        notifyAt: new Date(dto.notifyAt),
        createdBy: userId,
      },
    });
  }

  async findAll(query: CalendarQueryDto) {
    const where: any = {};

    if (query.from || query.to) {
      where.eventDate = {};
      if (query.from) where.eventDate.gte = new Date(query.from);
      if (query.to) where.eventDate.lte = new Date(query.to);
    }

    return this.prisma.calendarEvent.findMany({
      where,
      orderBy: { eventDate: 'asc' },
    });
  }

  async findOne(id: number) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Calendar event not found');
    }

    return event;
  }

  async update(id: number, dto: UpdateCalendarEventDto) {
    await this.findOne(id);

    return this.prisma.calendarEvent.update({
      where: { id },
      data: {
        ...dto,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
        notifyAt: dto.notifyAt ? new Date(dto.notifyAt) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.calendarEvent.delete({ where: { id } });
    return { message: 'Event deleted successfully' };
  }

  async triggerReminders() {
    const now = new Date();
    const events = await this.prisma.calendarEvent.findMany({
      where: { notifyAt: { lte: now } },
    });

    for (const event of events) {
      const users = await this.prisma.user.findMany();
      for (const user of users) {
        await this.notificationService.create({
          userId: event.createdBy,
          type: NotificationType.EVENT,
          title: 'Upcoming Event',
          message: event.title,
          sendEmail: true,
        });
      }
    }
  }
}