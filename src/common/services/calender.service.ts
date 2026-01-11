// src/common/services/calendar.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WEEKEND_DAYS } from 'src/utils/constants/calender.constants';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureWorkingDay(date: Date): Promise<void> {
    const day = date.getDay();

    if (WEEKEND_DAYS.includes(day)) {
      throw new BadRequestException('Attendance not allowed on weekends');
    }

    // 1️⃣ Get active academic session
    const academicSession = await this.prisma.academicSession.findFirst({
      where: { isActive: true },
      select: { id: true },
    });

    if (!academicSession) {
      throw new BadRequestException('No active academic session found');
    }

    // 2️⃣ Check holiday using compound unique key
    const holiday = await this.prisma.holiday.findUnique({
      where: {
        date_academicSessionId: {
          date,
          academicSessionId: academicSession.id,
        },
      },
    });

    if (holiday) {
      throw new BadRequestException('Attendance not allowed on holidays');
    }
  }
}
